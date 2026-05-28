import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requirePatient } from '@/lib/patient-auth'
import { getConsentzToken, fetchConsentzBooking } from '@/lib/patient-consentz'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { patient, error } = await requirePatient(req)
  if (error) return error

  const consentzToken = await getConsentzToken(patient)

  if (consentzToken) {
    try {
      const raw = await fetchConsentzBooking(consentzToken, params.id)
      // Look up clinic slug/city from local DB by name (best-effort for linking)
      const clinicRow = await prisma.clinic.findFirst({
        where: { name: raw.clinicName },
        select: { slug: true, city: { select: { name: true } } },
      })
      const booking = {
        id: raw.id,
        treatment: raw.treatment,
        slotStart: raw.slotStart,
        slotEnd: raw.slotEnd,
        status: raw.status,
        notes: null,
        videoCallMeetingId: raw.bookingType === 'video' ? String(raw.id) : null,
        videoCallJoinUrl: raw.videoCall?.joinUrlReady ? (raw.videoCall.joinUrl ?? null) : null,
        clinic: {
          id: null,
          name: raw.clinicName,
          slug: clinicRow?.slug ?? '',
          city: clinicRow?.city?.name ?? null,
        },
      }
      return NextResponse.json({ booking, source: 'consentz' })
    } catch (err: unknown) {
      const status = (err as { status?: number }).status
      if (status === 404) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      console.error('[patient/bookings/[id]] Consentz fetch failed, falling back to local DB:', err)
    }
  }

  // Fall back to local DB mirror
  const id = parseInt(params.id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const row = await prisma.booking.findFirst({
    where: { id, patientId: patient.id },
    include: {
      clinic: { select: { id: true, name: true, slug: true, city: { select: { name: true } } } },
    },
  })

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { clinic, ...rest } = row
  const booking = { ...rest, clinic: { ...clinic, city: clinic.city?.name ?? null } }

  return NextResponse.json({ booking, source: 'local' })
}
