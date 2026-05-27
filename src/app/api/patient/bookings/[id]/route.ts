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
      const booking = await fetchConsentzBooking(consentzToken, params.id)
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
