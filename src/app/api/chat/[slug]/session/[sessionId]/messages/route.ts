import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendCoreMessage, pollCoreMessages } from '@/lib/consentz-chat'
import { z } from 'zod'

const bodySchema = z.object({
  content: z.string().min(1).max(2000),
  visitorToken: z.string().length(64),
})

async function resolveSession(slug: string, sessionId: string, visitorToken: string) {
  const id = parseInt(sessionId, 10)
  if (isNaN(id)) return null
  return prisma.chatSession.findFirst({
    where: { id, visitorToken, clinic: { slug }, status: 'active' },
    select: {
      id: true,
      coreConversationId: true,
      clinic: { select: { coreClinicId: true } },
    },
  })
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; sessionId: string } },
) {
  try {
    const visitorToken = req.nextUrl.searchParams.get('visitorToken') ?? ''
    const session = await resolveSession(params.slug, params.sessionId, visitorToken)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const coreClinicId = session.clinic.coreClinicId
    const coreConversationId = session.coreConversationId
      ? parseInt(session.coreConversationId, 10)
      : null

    // Consentz-backed: poll from Core API
    if (coreClinicId && coreConversationId) {
      const sinceIso = req.nextUrl.searchParams.get('since')
      const after = sinceIso ? Math.floor(new Date(sinceIso).getTime() / 1000) : undefined
      const messages = await pollCoreMessages({ coreClinicId, conversationId: coreConversationId, after })
      return NextResponse.json({ messages })
    }

    // Local DB fallback
    const since = req.nextUrl.searchParams.get('since')
    const messages = await prisma.chatMessage.findMany({
      where: {
        sessionId: session.id,
        ...(since ? { createdAt: { gt: new Date(since) } } : {}),
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true, sender: true, content: true, createdAt: true },
    })

    return NextResponse.json({ messages })
  } catch (err) {
    console.error('[chat/messages GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string; sessionId: string } },
) {
  try {
    const body = bodySchema.safeParse(await req.json())
    if (!body.success) {
      return NextResponse.json({ error: 'Invalid request', issues: body.error.issues }, { status: 400 })
    }

    const session = await resolveSession(params.slug, params.sessionId, body.data.visitorToken)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const coreClinicId = session.clinic.coreClinicId
    const coreConversationId = session.coreConversationId
      ? parseInt(session.coreConversationId, 10)
      : null

    // Consentz-backed: send to Core + save locally
    if (coreClinicId && coreConversationId) {
      const [coreMessageId, message] = await Promise.all([
        sendCoreMessage({ coreClinicId, conversationId: coreConversationId, message: body.data.content }),
        prisma.chatMessage.create({
          data: { sessionId: session.id, sender: 'patient', content: body.data.content },
          select: { id: true, sender: true, content: true, createdAt: true },
        }),
      ])

      if (coreMessageId) {
        await prisma.chatMessage.update({
          where: { id: message.id },
          data: { coreMessageId: String(coreMessageId) },
        }).catch((err) => console.error('[chat/messages POST] failed to store coreMessageId:', err))
      } else {
        console.warn(`[chat/messages POST] Core sendMessage returned null for session=${session.id}`)
      }

      return NextResponse.json({ message }, { status: 201 })
    }

    // Local DB fallback
    const message = await prisma.chatMessage.create({
      data: { sessionId: session.id, sender: 'patient', content: body.data.content },
      select: { id: true, sender: true, content: true, createdAt: true },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (err) {
    console.error('[chat/messages POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
