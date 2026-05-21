export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getPortalUser } from '@/lib/portal'
import { prisma } from '@/lib/db'
import { sendCoreMessage } from '@/lib/consentz-chat'
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

    // Push clinic reply to Consentz Core (fire-and-forget)
    const coreClinicId = session.clinic.coreClinicId
    const coreConversationId = session.coreConversationId
      ? parseInt(session.coreConversationId, 10)
      : null

    if (coreClinicId && coreConversationId) {
      sendCoreMessage({ coreClinicId, conversationId: coreConversationId, message: body.data.content })
        .then(async (coreMessageId) => {
          if (coreMessageId) {
            await prisma.chatMessage.update({
              where: { id: message.id },
              data: { coreMessageId: String(coreMessageId) },
            }).catch(() => {})
          }
        })
        .catch(() => {})
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (err) {
    console.error('[portal/chat/messages POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
