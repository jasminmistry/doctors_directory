export const dynamic = 'force-dynamic'

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
      const raw = await fetchConsentzBookings(consentzToken)
      const bookings = raw.map((b) => ({
        id: b.id,
        treatment: b.treatment,
        slotStart: b.slotStart,
        slotEnd: b.slotEnd,
        status: b.status,
        videoCallMeetingId: b.bookingType === 'video' ? String(b.id) : null,
        videoCallJoinUrl: b.videoCall?.joinUrl ?? null,
        clinic: { name: b.clinicName, slug: '', city: null },
      }))
      return NextResponse.json({ bookings, source: 'consentz' }, { headers: { 'Cache-Control': 'no-store' } })
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

  return NextResponse.json({ bookings, source: 'local' }, { headers: { 'Cache-Control': 'no-store' } })
}
