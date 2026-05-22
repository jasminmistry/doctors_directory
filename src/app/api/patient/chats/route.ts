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

  return NextResponse.json({ sessions })
}
