export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getPortalUser } from '@/lib/portal'
import { prisma } from '@/lib/db'
import { sendCoreMessage, startCoreConversation } from '@/lib/consentz-chat'
import { splitName } from '@/lib/auth'
import { z } from 'zod'

const bodySchema = z.object({
  content: z.string().min(1).max(2000),
})

async function resolveSession(sessionId: string, clinicId: number) {
  const id = parseInt(sessionId, 10)
  if (isNaN(id)) return null
  return prisma.chatSession.findFirst({
    where: { id, clinicId },
    select: {
      id: true,
      coreConversationId: true,
      status: true,
      patientName: true,
      patientEmail: true,
      patientPhone: true,
      clinic: { select: { coreClinicId: true } },
    },
  })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  try {
    const user = await getPortalUser()
    if (!user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await resolveSession(params.sessionId, user.clinicId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
      select: { id: true, sender: true, content: true, createdAt: true },
    })

    return NextResponse.json({ messages })
  } catch (err) {
    console.error('[portal/chat/messages GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  try {
    const user = await getPortalUser()
    if (!user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = bodySchema.safeParse(await req.json())
    if (!body.success) {
      return NextResponse.json({ error: 'Invalid request', issues: body.error.issues }, { status: 400 })
    }

    const session = await resolveSession(params.sessionId, user.clinicId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    if (session.status === 'closed') {
      return NextResponse.json({ error: 'Session is closed' }, { status: 400 })
    }

    const message = await prisma.chatMessage.create({
      data: { sessionId: session.id, sender: 'clinic', content: body.data.content },
      select: { id: true, sender: true, content: true, createdAt: true },
    })

    // Push clinic reply to Consentz Core (async, non-blocking)
    const coreClinicId = session.clinic.coreClinicId
    let coreConversationId = session.coreConversationId
      ? parseInt(session.coreConversationId, 10)
      : null

    // If coreClinicId is set but conversation was never started, try to start it now
    if (coreClinicId && !coreConversationId) {
      if (!session.patientEmail) {
        console.warn(`[portal/chat/messages] cannot retroactively start Core conversation for session=${session.id} — no patient email`)
      } else {
        try {
          const firstPatientMessage = await prisma.chatMessage.findFirst({
            where: { sessionId: session.id, sender: 'patient' },
            orderBy: { createdAt: 'asc' },
            select: { content: true },
          })
          const { firstName, lastName } = splitName(session.patientName ?? '')
          const conversationId = await startCoreConversation({
            coreClinicId,
            firstName,
            lastName,
            email: session.patientEmail,
            ...(session.patientPhone ? { phone: session.patientPhone } : {}),
            message: firstPatientMessage?.content ?? "Hi, I'd like to enquire about a consultation.",
          })
          if (conversationId) {
            console.log(`[portal/chat/messages] retroactively started Core conversation id=${conversationId} for session=${session.id}`)
            await prisma.chatSession.update({
              where: { id: session.id },
              data: { coreConversationId: String(conversationId) },
            })
            coreConversationId = conversationId
          } else {
            console.warn(`[portal/chat/messages] retroactive Core conversation start returned null for session=${session.id}`)
          }
        } catch (err) {
          console.error('[portal/chat/messages] retroactive Core conversation start error:', err)
        }
      }
    }

    if (coreClinicId && coreConversationId) {
      sendCoreMessage({ coreClinicId, conversationId: coreConversationId, message: body.data.content })
        .then(async (coreMessageId) => {
          if (coreMessageId) {
            await prisma.chatMessage.update({
              where: { id: message.id },
              data: { coreMessageId: String(coreMessageId) },
            }).catch((err) => console.error('[portal/chat/messages] failed to store coreMessageId:', err))
          } else {
            console.warn(`[portal/chat/messages] Core sendMessage returned null for session=${session.id}`)
          }
        })
        .catch((err) => console.error('[portal/chat/messages] Core sendMessage error:', err))
    } else if (!coreClinicId) {
      console.log(`[portal/chat/messages] no Core sync — clinic has no coreClinicId`)
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (err) {
    console.error('[portal/chat/messages POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
