import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'
import { createCoreBooking, isCoreConfigured } from '@/lib/core-api'
import { splitName, COOKIE_TOKEN } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getPortalUser()
  if (!user || !user.clinicId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const bookings = await prisma.booking.findMany({
    where: {
      clinicId: user.clinicId,
      ...(from || to
        ? {
            slotStart: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    orderBy: { slotStart: 'asc' },
    select: {
      id: true,
      patientName: true,
      patientPhone: true,
      patientEmail: true,
      treatment: true,
      notes: true,
      slotStart: true,
      slotEnd: true,
      status: true,
      coreBookingId: true,
      syncedFromCore: true,
    },
  })

  return NextResponse.json({ bookings })
}

export async function POST(req: NextRequest) {
  const user = await getPortalUser()
  if (!user || !user.clinicId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { patientName, patientPhone, patientEmail, treatment, notes, slotStart, slotEnd, status } = body

  if (!patientName?.trim() || !slotStart || !slotEnd) {
    return NextResponse.json({ error: 'patientName, slotStart and slotEnd are required' }, { status: 400 })
  }
  if (new Date(slotEnd) <= new Date(slotStart)) {
    return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
  }

  // Create locally first
  const booking = await prisma.booking.create({
    data: {
      clinicId: user.clinicId,
      patientName: patientName.trim(),
      patientPhone: patientPhone?.trim() ?? '',
      patientEmail: patientEmail?.trim() || null,
      treatment: treatment?.trim() || null,
      notes: notes?.trim() || null,
      slotStart: new Date(slotStart),
      slotEnd: new Date(slotEnd),
      status: status ?? 'confirmed',
      syncedFromCore: false,
    },
  })

  // Push to Consentz Core if configured
  if (isCoreConfigured()) {
    const sessionToken = req.cookies.get(COOKIE_TOKEN)?.value
    const clinic = await prisma.clinic.findUnique({
      where: { id: user.clinicId },
      select: {
        coreClinicId: true,
        claimRequests: {
          where: { status: 'approved', consentzUserId: { not: null } },
          orderBy: { approvedAt: 'desc' },
          take: 1,
          select: { consentzUserId: true },
        },
      },
    })

    const coreClinicId = clinic?.coreClinicId
    const practitionerId = clinic?.claimRequests[0]?.consentzUserId

    if (coreClinicId && practitionerId) {
      const { firstName, lastName } = splitName(patientName.trim())
      try {
        const coreRes = await createCoreBooking(coreClinicId, {
          practitioner_id: practitionerId,
          slot_start: slotStart,
          slot_end: slotEnd,
          patient_first_name: firstName,
          patient_last_name: lastName,
          patient_email: patientEmail?.trim() || '',
          patient_phone: patientPhone?.trim() || '',
        }, sessionToken)
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            coreBookingId: String(coreRes.booking.id),
            syncedFromCore: true,
            lastSyncedAt: new Date(),
          },
        })
        booking.coreBookingId = String(coreRes.booking.id)
        booking.syncedFromCore = true
      } catch (err: unknown) {
        console.error('[portal/bookings] Core sync failed:', (err as { message?: string })?.message)
      }
    }
  }

  return NextResponse.json({ booking }, { status: 201 })
}
