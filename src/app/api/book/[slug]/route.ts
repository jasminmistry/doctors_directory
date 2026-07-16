import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createCoreBooking, isCoreConfigured } from '@/lib/core-api'
import { COOKIE_TOKEN } from '@/lib/auth'
import { getPatientClaims } from '@/lib/patient-auth'
import { getConsentzToken, generateConsentzPassword, initConsentzPatient } from '@/lib/patient-consentz'
import { addMinutes } from 'date-fns'
import { isClinicScheduleConfigured, SCHEDULE_NOT_CONFIGURED_RESPONSE } from '@/lib/schedule-check'

const bodySchema = z.object({
  practitionerId: z.number().int().positive(),
  slotDatetime: z.string(), // "2026-05-20 09:00:00" from Core slot
  slotDuration: z.number().int().positive().default(30),
  patientFirstName: z.string().min(1).max(100),
  patientLastName: z.string().min(1).max(100),
  patientEmail: z.string().email(),
  patientPhone: z.string().min(7).max(30),
  videoCall: z.boolean().optional(),
})

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { practitionerId, slotDatetime, slotDuration, patientFirstName, patientLastName, patientEmail, patientPhone, videoCall } = parsed.data

  const clinic = await prisma.clinic.findUnique({
    where: { slug: params.slug },
    select: { id: true, coreClinicId: true },
  })

  if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
  if (!await isClinicScheduleConfigured(clinic.id)) {
    return NextResponse.json(SCHEDULE_NOT_CONFIGURED_RESPONSE, { status: 422 })
  }
  if (!clinic.coreClinicId) return NextResponse.json({ error: 'Online booking not available for this clinic' }, { status: 422 })
  if (!isCoreConfigured()) return NextResponse.json({ error: 'Booking service unavailable' }, { status: 503 })

  const slotStart = new Date(slotDatetime.replace(' ', 'T') + '+00:00')
  const slotEnd = addMinutes(slotStart, slotDuration)

  // Resolve logged-in patient for token-linked booking
  const patientClaims = getPatientClaims(req)
  let patient = patientClaims
    ? await prisma.patient.findUnique({ where: { id: patientClaims.id } })
    : null

  // For first-time bookings: generate a Consentz password so Core can create the patient account.
  // NOTE: Consentz must accept `patient_password` in the booking body to set up the account.
  let pendingPassword: string | null = null
  let patientToken: string | null = null

  if (patient) {
    if (patient.consentzPassword) {
      patientToken = await getConsentzToken(patient)
    } else {
      pendingPassword = generateConsentzPassword()
    }
  }

  try {
    const sessionToken = req.cookies.get(COOKIE_TOKEN)?.value
    const coreRes = await createCoreBooking(clinic.coreClinicId, {
      practitioner_id: practitionerId,
      slot_start: slotStart.toISOString(),
      slot_end: slotEnd.toISOString(),
      patient_first_name: patientFirstName,
      patient_last_name: patientLastName,
      patient_email: patientEmail,
      patient_phone: patientPhone,
      ...(videoCall ? { video_call: true } : {}),
      ...(patientToken ? { patient_token: patientToken } : {}),
      // patient_password is only sent on the first booking so Consentz can create the account
      ...(pendingPassword ? { patient_password: pendingPassword } : {}),
    }, sessionToken)

    const booking = coreRes.booking

    // Acquire Consentz tokens now that the account exists (first booking only)
    if (patient && pendingPassword) {
      initConsentzPatient(patient.id, patientEmail, pendingPassword).catch(
        (err) => console.error('[book] initConsentzPatient failed:', err),
      )
    }

    // Mirror into local DB so the clinic portal calendar reflects it
    await prisma.booking.upsert({
      where: { coreBookingId: String(booking.id) },
      create: {
        clinicId: clinic.id,
        coreBookingId: String(booking.id),
        patientName: `${patientFirstName} ${patientLastName}`,
        patientEmail,
        patientPhone,
        treatment: booking.treatment?.name ?? null,
        slotStart: new Date(booking.slot_start),
        slotEnd: new Date(booking.slot_end),
        status: 'confirmed',
        syncedFromCore: true,
        lastSyncedAt: new Date(),
        videoCallMeetingId: booking.video_call ? String(booking.id) : null,
        videoCallJoinUrl: booking.video_call?.join_url ?? null,
        ...(patient ? { patientId: patient.id } : {}),
      },
      update: {
        status: 'confirmed',
        lastSyncedAt: new Date(),
        videoCallMeetingId: booking.video_call ? String(booking.id) : null,
        videoCallJoinUrl: booking.video_call?.join_url ?? null,
      },
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (err: unknown) {
    console.error('[book] Core API error:', err)
    const status = (err as { status?: number }).status
    if (status === 409) return NextResponse.json({ error: 'That slot was just taken — please pick another time' }, { status: 409 })
    if (status === 400) return NextResponse.json({ error: 'Invalid booking data' }, { status: 400 })
    return NextResponse.json({ error: 'Booking failed — please try again' }, { status: 502 })
  }
}
