import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { startCoreConversation } from '@/lib/consentz-chat'
import { splitName } from '@/lib/auth'
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
      select: { id: true, claimed: true, coreClinicId: true, claimedPlan: true },
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

    const session = await prisma.chatSession.create({
      data: {
        clinicId: clinic.id,
        visitorToken,
        patientName: body.data.patientName,
        patientEmail: body.data.patientEmail,
        patientPhone: body.data.patientPhone,
      },
    })

    // Always store the initial message locally so the clinic portal can see it
    if (openingMessage) {
      await prisma.chatMessage.create({
        data: { sessionId: session.id, sender: 'patient', content: openingMessage },
      }).catch((err) => console.error('[chat/session] failed to store initial message locally:', err))
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

    return NextResponse.json({ sessionId: session.id, visitorToken })
  } catch (err) {
    console.error('[chat/session POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
