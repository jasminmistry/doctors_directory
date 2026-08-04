export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requirePatient } from '@/lib/patient-auth'
import { getConsentzToken, fetchConsentzBookings } from '@/lib/patient-consentz'

export async function GET(req: NextRequest) {
  const { patient, error } = await requirePatient(req)
  if (error) {
    console.log('[patient/bookings] no valid patient session — returning 401')
    return error
  }

  console.log(`[patient/bookings] patient id=${patient.id} email=${patient.email}`)

  // Local DB mirror is written synchronously by POST /api/book/[slug] before it
  // responds with success, so it's always fresh — unlike Core, which may lag on
  // reads immediately after a write. Always load it so a just-made booking can
  // never disappear because Core hasn't caught up yet.
  const rows = await prisma.booking.findMany({
    where: {
      OR: [
        { patientId: patient.id },
        { patientEmail: patient.email, patientId: null },
      ],
    },
    include: {
      clinic: { select: { id: true, name: true, slug: true, city: { select: { name: true } } } },
    },
    orderBy: { slotStart: 'desc' },
  })
  console.log(`[patient/bookings] local DB found ${rows.length} bookings for patientId=${patient.id} or email=${patient.email}`)

  // Backfill patientId for any email-matched rows that were missing it
  const unlinked = rows.filter((r) => r.patientId === null)
  if (unlinked.length > 0) {
    console.log(`[patient/bookings] backfilling patientId on ${unlinked.length} bookings`)
    await prisma.booking.updateMany({
      where: { id: { in: unlinked.map((r) => r.id) } },
      data: { patientId: patient.id },
    })
  }

  const localBookings = rows.map(({ clinic, ...b }) => ({
    ...b,
    clinic: { ...clinic, city: clinic.city?.name ?? null },
  }))

  const consentzToken = await getConsentzToken(patient)
  console.log(`[patient/bookings] consentzToken=${consentzToken ? 'present' : 'none'}`)

  if (consentzToken) {
    try {
      const raw = await fetchConsentzBookings(consentzToken)
      console.log(`[patient/bookings] Consentz returned ${raw.length} bookings`)
      const consentzBookings = raw.map((b) => ({
        id: b.id,
        treatment: b.treatment,
        slotStart: b.slotStart,
        slotEnd: b.slotEnd,
        status: b.status,
        videoCallMeetingId: b.bookingType === 'video' ? String(b.id) : null,
        videoCallJoinUrl: b.videoCall?.joinUrl ?? null,
        clinic: { name: b.clinicName, slug: '', city: null },
      }))

      // Merge in any locally-mirrored booking Core's own listing hasn't
      // surfaced yet (e.g. read-after-write lag right after booking).
      const consentzIds = new Set(consentzBookings.map((b) => String(b.id)))
      const missingFromConsentz = localBookings.filter(
        (b) => b.coreBookingId && !consentzIds.has(b.coreBookingId),
      )
      if (missingFromConsentz.length > 0) {
        console.log(`[patient/bookings] ${missingFromConsentz.length} local booking(s) not yet in Consentz response, merging`)
      }

      const bookings = [...consentzBookings, ...missingFromConsentz].sort(
        (a, b) => new Date(b.slotStart).getTime() - new Date(a.slotStart).getTime(),
      )

      return NextResponse.json({ bookings, source: 'consentz' }, { headers: { 'Cache-Control': 'no-store' } })
    } catch (err) {
      console.error('[patient/bookings] Consentz fetch failed, falling back to local DB:', err)
    }
  }

  return NextResponse.json({ bookings: localBookings, source: 'local' }, { headers: { 'Cache-Control': 'no-store' } })
}
