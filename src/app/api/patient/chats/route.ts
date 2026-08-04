export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requirePatient } from '@/lib/patient-auth'

export async function GET(req: NextRequest) {
  const { patient, error } = await requirePatient(req)
  if (error) return error

  const sessions = await prisma.chatSession.findMany({
    where: { patientId: patient.id },
    include: {
      clinic: { select: { id: true, name: true, slug: true, city: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true, sender: true, createdAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Unread count — number of clinic messages the patient hasn't viewed yet
  // (viewing a conversation sets patientLastReadAt)
  const unreadCountsBySessionId = new Map(
    await Promise.all(
      sessions.map(async (s) => {
        const count = await prisma.chatMessage.count({
          where: {
            sessionId: s.id,
            sender: 'clinic',
            ...(s.patientLastReadAt ? { createdAt: { gt: s.patientLastReadAt } } : {}),
          },
        })
        return [s.id, count] as const
      }),
    ),
  )

  const sessionsWithUnread = sessions.map(({ patientLastReadAt: _patientLastReadAt, ...s }) => ({
    ...s,
    unread: unreadCountsBySessionId.get(s.id) ?? 0,
  }))

  return NextResponse.json({ sessions: sessionsWithUnread }, { headers: { 'Cache-Control': 'no-store' } })
}
