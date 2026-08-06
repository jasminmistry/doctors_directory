export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getPortalUser } from '@/lib/portal'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const user = await getPortalUser()
    if (!user?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await prisma.chatSession.findMany({
      // Excludes sessions left empty by the duplicate-thread merge (their messages were
      // reassigned to a primary session) — a 0-message thread has nothing to show anyway.
      where: { clinicId: user.clinicId, messages: { some: {} } },
      select: {
        id: true,
        patientName: true,
        patientEmail: true,
        patientPhone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        clinicLastReadAt: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, sender: true, createdAt: true },
        },
      },
    })

    // Unread count — number of patient messages the clinic hasn't viewed yet
    // (viewing a conversation sets clinicLastReadAt)
    const unreadCountsBySessionId = new Map(
      await Promise.all(
        sessions.map(async (s) => {
          const count =
            s.status === 'active'
              ? await prisma.chatMessage.count({
                  where: {
                    sessionId: s.id,
                    sender: 'patient',
                    ...(s.clinicLastReadAt ? { createdAt: { gt: s.clinicLastReadAt } } : {}),
                  },
                })
              : 0
          return [s.id, count] as const
        }),
      ),
    )

    const sessionsWithUnread = sessions.map(({ clinicLastReadAt: _clinicLastReadAt, ...s }) => ({
      ...s,
      unread: unreadCountsBySessionId.get(s.id) ?? 0,
    }))

    // Sort by last activity, not `updatedAt` — that column only changes when the
    // session row itself is touched (read receipts, Core sync), not when a new
    // ChatMessage is created, so it drifts from the timestamp shown on each row.
    sessionsWithUnread.sort((a, b) => {
      const aTime = a.messages[0]?.createdAt ?? a.createdAt
      const bTime = b.messages[0]?.createdAt ?? b.createdAt
      return bTime.getTime() - aTime.getTime()
    })

    const unread = sessionsWithUnread.filter((s) => s.unread).length

    return NextResponse.json({ sessions: sessionsWithUnread, unread })
  } catch (err) {
    console.error('[portal/chat/sessions]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
