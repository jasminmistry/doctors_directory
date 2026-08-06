import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendCoreMessage, startCoreConversation } from '@/lib/consentz-chat'
import { splitName } from '@/lib/auth'
import { getPatientClaims } from '@/lib/patient-auth'
import { CONSENT_FORM_VERSION, consentCheckboxWording } from '@/lib/consent'
import crypto from 'crypto'
import { z } from 'zod'

const bodySchema = z.object({
  patientName: z.string().min(1).max(200),
  patientEmail: z.string().email().optional(),
  patientPhone: z.string().max(30).optional(),
  initialMessage: z.string().max(1000).optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { slug: params.slug },
      select: { id: true, name: true, claimed: true, coreClinicId: true, claimedPlan: true },
    })

    if (!clinic?.claimed) {
      return NextResponse.json({ error: 'Clinic not available for chat' }, { status: 400 })
    }

    const body = bodySchema.safeParse(await req.json())
    if (!body.success) {
      return NextResponse.json({ error: 'Invalid request', issues: body.error.issues }, { status: 400 })
    }

    const visitorToken = crypto.randomBytes(32).toString('hex')
    const openingMessage = body.data.initialMessage?.trim() || ''

    // Link to the logged-in patient (the widget requires login) so it shows up under
    // their account's chat history — otherwise /api/patient/chats can never find it.
    const patientId = getPatientClaims(req)?.id ?? null

    // Continue an existing active conversation instead of spawning a duplicate — the
    // widget only knows about its own localStorage pointer, which expires after 24h or
    // is lost on a different device, so without this check every "New chat" after that
    // point minted a fresh ChatSession for the same patient/clinic pair.
    if (patientId) {
      const existing = await prisma.chatSession.findFirst({
        where: { patientId, clinicId: clinic.id, status: 'active' },
        orderBy: { createdAt: 'desc' },
        select: { id: true, visitorToken: true, coreConversationId: true },
      })

      if (existing) {
        let message: { id: number; sender: string; content: string; createdAt: Date } | null = null
        if (openingMessage) {
          const coreConversationId = existing.coreConversationId
            ? parseInt(existing.coreConversationId, 10)
            : null

          if (clinic.coreClinicId && coreConversationId) {
            const [coreMessageId, created] = await Promise.all([
              sendCoreMessage({ coreClinicId: clinic.coreClinicId, conversationId: coreConversationId, message: openingMessage }),
              prisma.chatMessage.create({
                data: { sessionId: existing.id, sender: 'patient', content: openingMessage },
                select: { id: true, sender: true, content: true, createdAt: true },
              }),
            ])
            message = created
            if (coreMessageId) {
              await prisma.chatMessage.update({
                where: { id: created.id },
                data: { coreMessageId: String(coreMessageId) },
              }).catch((err) => console.error('[chat/session] failed to store coreMessageId:', err))
            }
          } else {
            message = await prisma.chatMessage.create({
              data: { sessionId: existing.id, sender: 'patient', content: openingMessage },
              select: { id: true, sender: true, content: true, createdAt: true },
            }).catch((err) => {
              console.error('[chat/session] failed to store message on existing session:', err)
              return null
            })
          }
        }

        return NextResponse.json({ sessionId: existing.id, visitorToken: existing.visitorToken, message })
      }
    }

    const session = await prisma.chatSession.create({
      data: {
        clinicId: clinic.id,
        visitorToken,
        patientId,
        patientName: body.data.patientName,
        patientEmail: body.data.patientEmail,
        patientPhone: body.data.patientPhone,
      },
    })

    // Every consultation request must surface as a prospect, not just the ones caught
    // while the clinic is offline — mirror the lead created by POST /api/leads so the
    // "online" branch (chat) doesn't silently skip the Prospects tab.
    await prisma.consultationLead.create({
      data: {
        clinicId: clinic.id,
        patientName: body.data.patientName,
        patientPhone: body.data.patientPhone ?? '',
        patientEmail: body.data.patientEmail,
        ...(patientId ? { patientId } : {}),
      },
    }).catch((err) => {
      console.error('[chat/session] failed to create consultation lead:', err)
    })

    if (patientId) {
      const wording = consentCheckboxWording(clinic.name ?? params.slug)
      await prisma.patientConsent.createMany({
        data: (['share', 'privacy', 'age'] as const).map((checkbox) => ({
          patientId,
          checkbox,
          ticked: true,
          wordingShown: wording[checkbox],
          formVersion: CONSENT_FORM_VERSION,
        })),
      }).catch((err) => console.error('[chat/session] failed to record consent:', err))
    } else {
      console.warn(`[chat/session] no patientId resolved for slug=${params.slug} — skipping consent record`)
    }

    // Always store the initial message locally so the clinic portal can see it.
    // The client must not also POST it to the messages endpoint — that would duplicate it.
    let message: { id: number; sender: string; content: string; createdAt: Date } | null = null
    if (openingMessage) {
      message = await prisma.chatMessage.create({
        data: { sessionId: session.id, sender: 'patient', content: openingMessage },
        select: { id: true, sender: true, content: true, createdAt: true },
      }).catch((err) => {
        console.error('[chat/session] failed to store initial message locally:', err)
        return null
      })
    }

    // Push to Consentz Core — paid plans with coreClinicId only
    const isFree = !clinic.claimedPlan || clinic.claimedPlan === 'free'
    const shouldSyncToCore = !isFree && clinic.coreClinicId && body.data.patientEmail

    console.log(`[chat/session] slug=${params.slug} coreClinicId=${clinic.coreClinicId ?? 'null'} plan=${clinic.claimedPlan ?? 'none'} syncToCore=${!!shouldSyncToCore}`)

    if (shouldSyncToCore) {
      const { firstName, lastName } = splitName(body.data.patientName)
      const coreMessage = openingMessage || "Hi, I'd like to enquire about a consultation."

      startCoreConversation({
        coreClinicId: clinic.coreClinicId!,
        firstName,
        lastName,
        email: body.data.patientEmail!,
        phone: body.data.patientPhone,
        message: coreMessage,
      })
        .then(async (conversationId) => {
          if (conversationId) {
            console.log(`[chat/session] Core conversation started id=${conversationId} session=${session.id}`)
            await prisma.chatSession.update({
              where: { id: session.id },
              data: { coreConversationId: String(conversationId) },
            })
          } else {
            console.warn(`[chat/session] Core conversation returned null for session=${session.id} — messages will be local-only`)
          }
        })
        .catch((err) => console.error('[chat/session] failed to persist coreConversationId:', err))
    }

    return NextResponse.json({ sessionId: session.id, visitorToken, message })
  } catch (err) {
    console.error('[chat/session POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
