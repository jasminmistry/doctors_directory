import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requirePatient } from '@/lib/patient-auth'
import { getConsentzToken, fetchConsentzBookings } from '@/lib/patient-consentz'

export async function GET(req: NextRequest) {
  const { patient, error } = await requirePatient(req)
  if (error) return error

  const consentzToken = await getConsentzToken(patient)

  if (consentzToken) {
    try {
      const bookings = await fetchConsentzBookings(consentzToken)
      return NextResponse.json({ bookings, source: 'consentz' })
    } catch (err) {
      console.error('[patient/bookings] Consentz fetch failed, falling back to local DB:', err)
    }
  }

  // Fall back to local DB mirror
  const rows = await prisma.booking.findMany({
    where: { patientId: patient.id },
    include: {
      clinic: { select: { id: true, name: true, slug: true, city: { select: { name: true } } } },
    },
    orderBy: { slotStart: 'desc' },
  })

  const bookings = rows.map(({ clinic, ...b }) => ({
    ...b,
    clinic: { ...clinic, city: clinic.city?.name ?? null },
  }))

  return NextResponse.json({ bookings, source: 'local' })
}
