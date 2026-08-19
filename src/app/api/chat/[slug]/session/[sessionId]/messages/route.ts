import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendCoreMessage, pollCoreMessages, CHAT_MESSAGE_MAX_LENGTH, type NormalizedMessage } from '@/lib/consentz-chat'
import { getPatientClaims } from '@/lib/patient-auth'
import { z } from 'zod'

const bodySchema = z.object({
  content: z.string().min(1).max(CHAT_MESSAGE_MAX_LENGTH),
  visitorToken: z.string().length(64),
})

// Mark everything up to `latestCreatedAt` as read by the patient — clears the
// unread badge for this conversation. Fire-and-forget so it doesn't slow down
// the response; only write when there's something new to avoid hammering the
// DB on every 3s poll of an already-read chat.
function markPatientRead(sessionId: number, patientLastReadAt: Date | null, latestCreatedAt: Date) {
  if (patientLastReadAt && latestCreatedAt <= patientLastReadAt) return
  prisma.chatSession
    .update({ where: { id: sessionId }, data: { patientLastReadAt: latestCreatedAt } })
    .catch((err) => console.error('[chat/messages GET] failed to mark read:', err))
}

// Consentz Core's inbox GET endpoint does not reliably echo back who actually
// sent a message — clinic replies pushed with sender: 'clinic' come back
// labelled "visitor" just like patient messages, which would otherwise show
// clinic replies under "You" on the patient's side. Our own DB is the
// authoritative record of who sent what, since every message that goes
// through this app (patient widget or clinic portal) is written locally
// before or alongside the Core push. This reconciles Core's response against
// that local record instead of trusting Core's sender field.
async function reconcileCoreMessages(
  sessionId: number,
  coreMessages: NormalizedMessage[],
  isIncrementalPoll: boolean,
): Promise<NormalizedMessage[]> {
  if (coreMessages.length === 0) return coreMessages

  const coreIds = coreMessages.map((m) => String(m.id))
  const linked = await prisma.chatMessage.findMany({
    where: { sessionId, coreMessageId: { in: coreIds } },
    select: { coreMessageId: true, sender: true },
  })
  const linkedSenderByCoreId = new Map(linked.map((l) => [l.coreMessageId as string, l.sender]))

  // The opening message is pushed to Core fire-and-forget with no message id
  // returned to link back (see session/route.ts), so it resurfaces on the
  // first poll unlinked. Match it by content against not-yet-linked local
  // patient messages so it isn't mistaken for a new clinic-originated one below.
  const unlinkedPatient = await prisma.chatMessage.findMany({
    where: { sessionId, sender: 'patient', coreMessageId: null },
    select: { id: true, content: true },
  })
  const claimed = new Set<number>()

  const result: NormalizedMessage[] = []
  for (const m of coreMessages) {
    const linkedSender = linkedSenderByCoreId.get(String(m.id))
    if (linkedSender) {
      // Patient messages are linked synchronously in the POST handler, before
      // the response (carrying the local DB id) reaches the client. If this
      // same message resurfaces on the very next incremental poll — Core's
      // created_at can land on or after the "since" boundary we just advanced
      // past — pushing it here (keyed by Core's id, not the local id the
      // client already rendered) would show up as a second bubble. The
      // patient has already seen it optimistically, so drop it — but only
      // for incremental polls. A full history load (no "since", e.g. on
      // reopening the panel) replaces the client's entire message list, so
      // dropping it here would delete the patient's own message instead of
      // deduping it.
      if (linkedSender === 'patient') {
        if (isIncrementalPoll) continue
        result.push({ ...m, sender: 'patient' })
        continue
      }
      result.push({ ...m, sender: linkedSender as 'clinic' })
      continue
    }

    const echoMatch = unlinkedPatient.find((lm) => !claimed.has(lm.id) && lm.content === m.content)
    if (echoMatch) {
      claimed.add(echoMatch.id)
      await prisma.chatMessage
        .update({ where: { id: echoMatch.id }, data: { coreMessageId: String(m.id) } })
        .catch((err) => console.error('[chat/messages GET] failed to link echoed message:', err))
      continue
    }

    // Genuinely new to us — Core originated it, whether that's a clinic staff
    // reply typed straight into Core's own inbox UI or a system notification
    // (e.g. "Video call booked") Core posts on the visitor's behalf when they
    // complete a booking. The "echo" unreliability noted above only affects
    // messages *we* pushed (Core mislabels our own clinic pushes as visitor
    // on replay); it doesn't apply to messages Core authored itself, so its
    // sender tag here is authoritative — trust m.sender rather than assuming
    // clinic. Persist it so it also appears in the clinic's own portal inbox
    // (which reads local messages only) and isn't reprocessed.
    await prisma.chatMessage
      .create({
        data: {
          sessionId,
          sender: m.sender,
          content: m.content,
          coreMessageId: String(m.id),
          createdAt: new Date(m.createdAt),
        },
      })
      .catch((err) => console.error('[chat/messages GET] failed to persist Core-originated message:', err))
    result.push(m)
  }

  return result
}

async function resolveSession(slug: string, sessionId: string, visitorToken: string) {
  const id = parseInt(sessionId, 10)
  if (isNaN(id)) return null
  return prisma.chatSession.findFirst({
    where: { id, visitorToken, clinic: { slug }, status: 'active' },
    select: {
      id: true,
      patientId: true,
      coreConversationId: true,
      patientLastReadAt: true,
      clinic: { select: { coreClinicId: true } },
    },
  })
}

// A session created while logged in belongs to that patient only — a visitorToken
// alone (e.g. a stale one restored from another account's localStorage on a shared
// device) must not be enough to read someone else's conversation. Sessions with no
// patientId predate patient accounts and stay token-only for backward compatibility.
function isOwnedByRequester(session: { patientId: number | null }, req: NextRequest): boolean {
  if (session.patientId === null) return true
  return getPatientClaims(req)?.id === session.patientId
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; sessionId: string } },
) {
  try {
    const visitorToken = req.nextUrl.searchParams.get('visitorToken') ?? ''
    const session = await resolveSession(params.slug, params.sessionId, visitorToken)
    if (!session || !isOwnedByRequester(session, req)) {
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
      const coreMessages = await pollCoreMessages({ coreClinicId, conversationId: coreConversationId, after })
      const messages = await reconcileCoreMessages(session.id, coreMessages, sinceIso !== null)
      const latest = messages[messages.length - 1]
      if (latest) markPatientRead(session.id, session.patientLastReadAt, new Date(latest.createdAt))
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

    const latest = messages[messages.length - 1]
    if (latest) markPatientRead(session.id, session.patientLastReadAt, latest.createdAt)

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
      const contentIssue = body.error.issues.find((i) => i.path[0] === 'content')
      const error =
        contentIssue?.code === 'too_big'
          ? `Message is too long (max ${CHAT_MESSAGE_MAX_LENGTH} characters).`
          : contentIssue?.code === 'too_small'
            ? 'Message cannot be empty.'
            : 'Invalid request'
      return NextResponse.json({ error, issues: body.error.issues }, { status: 400 })
    }

    const session = await resolveSession(params.slug, params.sessionId, body.data.visitorToken)
    if (!session || !isOwnedByRequester(session, req)) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const coreClinicId = session.clinic.coreClinicId
    const coreConversationId = session.coreConversationId
      ? parseInt(session.coreConversationId, 10)
      : null

    // Consentz-backed: send to Core + save locally
    if (coreClinicId && coreConversationId) {
      const [coreMessageId, message] = await Promise.all([
        sendCoreMessage({ coreClinicId, conversationId: coreConversationId, message: body.data.content, sender: 'visitor' }),
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
