export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getPortalUser } from '@/lib/portal'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const user = await getPortalUser()
    if (!user?.clinicId) {
      return NextResponse.json({ unread: 0 })
    }

    // Sessions where the most recent message is from a patient and the
    // clinic hasn't viewed the conversation since that message arrived
    const sessions = await prisma.chatSession.findMany({
      where: { clinicId: user.clinicId, status: 'active' },
      select: {
        clinicLastReadAt: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { sender: true, createdAt: true },
        },
      },
    })

    const unread = sessions.filter((s) => {
      const lastMsg = s.messages[0]
      return lastMsg?.sender === 'patient' && (!s.clinicLastReadAt || lastMsg.createdAt > s.clinicLastReadAt)
    }).length

    return NextResponse.json({ unread })
  } catch {
    return NextResponse.json({ unread: 0 })
  }
}
