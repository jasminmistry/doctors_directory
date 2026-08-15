export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requirePatient } from '@/lib/patient-auth'

export async function GET(req: NextRequest) {
  const { patient, error } = await requirePatient(req)
  if (error) return NextResponse.json({ unread: 0 }, { headers: { 'Cache-Control': 'no-store' } })

  // Sessions where the most recent message is from the clinic and the
  // patient hasn't viewed the conversation since that message arrived
  const sessions = await prisma.chatSession.findMany({
    where: { patientId: patient.id },
    select: {
      patientLastReadAt: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { sender: true, createdAt: true },
      },
    },
  })

  const unread = sessions.filter((s) => {
    const lastMsg = s.messages[0]
    return lastMsg?.sender === 'clinic' && (!s.patientLastReadAt || lastMsg.createdAt > s.patientLastReadAt)
  }).length

  return NextResponse.json({ unread }, { headers: { 'Cache-Control': 'no-store' } })
}
