import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createCoreBooking, isCoreConfigured } from '@/lib/core-api'
import { splitName, COOKIE_TOKEN } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const clinic = await prisma.clinic.findUnique({
    where: { slug: params.slug },
    select: { id: true, claimedPlan: true },
  })

  if (!clinic) {
    return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const bookings = await prisma.booking.findMany({
    where: {
      clinicId: clinic.id,
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
  })

  return NextResponse.json({ bookings, plan: clinic.claimedPlan })
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const clinic = await prisma.clinic.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      coreClinicId: true,
      claimRequests: {
        where: { status: 'approved', consentzUserId: { not: null } },
        orderBy: { approvedAt: 'desc' },
        take: 1,
        select: { consentzUserId: true },
      },
    },
  })

  if (!clinic) {
    return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { patientName, patientPhone, patientEmail, treatment, notes, slotStart, slotEnd, status, coreBookingId } = body

  if (!patientName?.trim() || !slotStart || !slotEnd) {
    return NextResponse.json({ error: 'patientName, slotStart and slotEnd are required' }, { status: 400 })
  }
  if (new Date(slotEnd) <= new Date(slotStart)) {
    return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
  }

  const booking = await prisma.booking.create({
    data: {
      clinicId: clinic.id,
      patientName: patientName.trim(),
      patientPhone: patientPhone?.trim() ?? '',
      patientEmail: patientEmail?.trim() || null,
      treatment: treatment?.trim() || null,
      notes: notes?.trim() || null,
      slotStart: new Date(slotStart),
      slotEnd: new Date(slotEnd),
      status: status ?? 'confirmed',
      coreBookingId: coreBookingId ?? null,
      syncedFromCore: !!coreBookingId,
      lastSyncedAt: coreBookingId ? new Date() : null,
    },
  })

  // Push to Consentz Core if configured and clinic has a Core account
  if (isCoreConfigured() && !coreBookingId) {
    const sessionToken = req.cookies.get(COOKIE_TOKEN)?.value
    const coreClinicId = clinic.coreClinicId
    const practitionerId = clinic.claimRequests[0]?.consentzUserId

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
        console.info(`[admin/bookings] Synced booking ${booking.id} → Core booking ${coreRes.booking.id}`)
      } catch (err: unknown) {
        console.error('[admin/bookings] Core sync failed:', (err as { message?: string })?.message)
      }
    } else {
      console.info('[admin/bookings] Skipping Core sync — coreClinicId=%s practitionerId=%s', coreClinicId, practitionerId)
    }
  }

  return NextResponse.json({ booking }, { status: 201 })
}
