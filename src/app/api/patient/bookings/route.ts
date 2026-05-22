import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requirePatient } from '@/lib/patient-auth'

export async function GET(req: NextRequest) {
  const { patient, error } = await requirePatient(req)
  if (error) return error

  const bookings = await prisma.booking.findMany({
    where: { patientId: patient.id },
    include: {
      clinic: { select: { id: true, name: true, slug: true, city: true } },
    },
    orderBy: { slotStart: 'desc' },
  })

  return NextResponse.json({ bookings })
}
