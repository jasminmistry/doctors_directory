export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'
import { createCoreBooking, isCoreConfigured } from '@/lib/core-api'
import { splitName, COOKIE_TOKEN } from '@/lib/auth'
import type { PortalUser } from '@/lib/portal'

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Resolves the directory clinicId to use for local Booking records.
 * - Clinic portal users: their own clinicId.
 * - Practitioner portal users: the directory clinic that shares their coreClinicId, if one exists.
 */
async function resolveClinicId(user: PortalUser): Promise<number | null> {
  if (user.clinicId) return user.clinicId
  if (!user.practitionerId) return null

  const practitioner = await prisma.practitioner.findUnique({
    where: { id: user.practitionerId },
    select: { coreClinicId: true },
  })
  if (!practitioner?.coreClinicId) return null

  const linkedClinic = await prisma.clinic.findUnique({
    where: { coreClinicId: practitioner.coreClinicId },
    select: { id: true },
  })
  return linkedClinic?.id ?? null
}

/**
 * Resolves Core credentials for syncing a booking to Consentz.
 * Returns null when Core is not configured for this entity.
 */
async function resolveCoreCredentials(
  user: PortalUser,
): Promise<{ coreClinicId: number; consentzUserId: number } | null> {
  if (user.clinicId) {
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
    const consentzUserId = clinic?.claimRequests[0]?.consentzUserId
    if (!coreClinicId || !consentzUserId) return null
    return { coreClinicId, consentzUserId }
  }

  if (user.practitionerId) {
    const practitioner = await prisma.practitioner.findUnique({
      where: { id: user.practitionerId },
      select: { coreClinicId: true },
    })
    const claim = await prisma.claimRequest.findUnique({
      where: { id: user.claimId },
      select: { consentzUserId: true },
    })
    const coreClinicId = practitioner?.coreClinicId
    const consentzUserId = claim?.consentzUserId
    if (!coreClinicId || !consentzUserId) return null
    return { coreClinicId, consentzUserId }
  }

  return null
}

export async function GET(req: NextRequest) {
  const user = await getPortalUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clinicId = await resolveClinicId(user)
  if (!clinicId) {
    return NextResponse.json({ error: 'No clinic linked to this account' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const bookings = await prisma.booking.findMany({
    where: {
      clinicId,
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
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clinicId = await resolveClinicId(user)
  if (!clinicId) {
    return NextResponse.json({ error: 'No clinic linked to this account' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { patientName, patientPhone, patientEmail, treatment, notes, slotStart, slotEnd, status } = body

  if (!patientName?.trim() || !slotStart || !slotEnd) {
    return NextResponse.json({ error: 'Patient name is required.' }, { status: 400 })
  }
  if (patientEmail?.trim() && !EMAIL_RE.test(patientEmail.trim())) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }
  if (patientPhone?.trim() && !UK_PHONE_RE.test(patientPhone.trim().replace(/\s/g, ''))) {
    return NextResponse.json({ error: 'Please enter a valid UK phone number.' }, { status: 400 })
  }
  if (new Date(slotEnd) <= new Date(slotStart)) {
    return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
  }

  // Create locally first
  const booking = await prisma.booking.create({
    data: {
      clinicId,
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
    const core = await resolveCoreCredentials(user)

    if (core) {
      const { firstName, lastName } = splitName(patientName.trim())
      try {
        const coreRes = await createCoreBooking(core.coreClinicId, {
          practitioner_id: core.consentzUserId,
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
        const e = err as { message?: string; status?: number }
        console.error(`[portal/bookings] Core sync failed: HTTP ${e.status ?? '?'} — ${e.message} — coreClinicId=${core.coreClinicId} slotStart=${slotStart}`)
      }
    }
  }

  return NextResponse.json({ booking }, { status: 201 })
}
