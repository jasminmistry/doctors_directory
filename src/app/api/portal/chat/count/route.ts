import { NextResponse } from 'next/server'
import { getPortalUser } from '@/lib/portal'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const user = await getPortalUser()
    if (!user?.clinicId) {
      return NextResponse.json({ unread: 0 })
    }

    // Sessions where the most recent message is from a patient (needs clinic reply)
    const sessions = await prisma.chatSession.findMany({
      where: { clinicId: user.clinicId, status: 'active' },
      select: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { sender: true },
        },
      },
    })

    const unread = sessions.filter((s) => s.messages[0]?.sender === 'patient').length
    return NextResponse.json({ unread })
  } catch {
    return NextResponse.json({ unread: 0 })
  }
}
