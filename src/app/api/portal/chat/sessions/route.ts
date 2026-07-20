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
      where: { clinicId: user.clinicId },
      orderBy: { updatedAt: 'desc' },
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

    // Unread — last message is from the patient AND the clinic hasn't viewed
    // this conversation since that message arrived (viewing a conversation
    // sets clinicLastReadAt; a plain reply also flips the last-sender check)
    const sessionsWithUnread = sessions.map(({ clinicLastReadAt, ...s }) => {
      const lastMsg = s.messages[0]
      const unread =
        s.status === 'active' &&
        lastMsg?.sender === 'patient' &&
        (!clinicLastReadAt || lastMsg.createdAt > clinicLastReadAt)
      return { ...s, unread }
    })

    const unread = sessionsWithUnread.filter((s) => s.unread).length

    return NextResponse.json({ sessions: sessionsWithUnread, unread })
  } catch (err) {
    console.error('[portal/chat/sessions]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
