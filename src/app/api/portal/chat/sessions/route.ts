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
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, sender: true, createdAt: true },
        },
      },
    })

    // Count unread (clinic messages not yet responded to, i.e. last message is from patient)
    const unread = sessions.filter(
      (s) => s.messages[0]?.sender === 'patient' && s.status === 'active',
    ).length

    return NextResponse.json({ sessions, unread })
  } catch (err) {
    console.error('[portal/chat/sessions]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
