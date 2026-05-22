import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { COOKIE_TOKEN } from '@/lib/auth'
import { isClinicScheduleConfigured, SCHEDULE_NOT_CONFIGURED_RESPONSE } from '@/lib/schedule-check'
import { getPatientClaims } from '@/lib/patient-auth'

function getCoreLiteBase() {
  const authUrl = process.env.CONSENTZ_AUTH_API_URL
  if (!authUrl) throw new Error('CONSENTZ_AUTH_API_URL is not configured')
  return `${new URL(authUrl).origin}/api/core-lite`
}

const bodySchema = z.object({
  practitioner_id: z.number().int(),
  slot_start: z.string(), // "YYYY-MM-DD HH:MM"
  slot_end: z.string(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { slug: params.slug },
      select: { id: true, coreClinicId: true },
    })

    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }

    if (!await isClinicScheduleConfigured(clinic.id)) {
      return NextResponse.json(SCHEDULE_NOT_CONFIGURED_RESPONSE, { status: 422 })
    }

    if (!clinic.coreClinicId) {
      return NextResponse.json({ error: 'Online call booking is not available for this clinic' }, { status: 400 })
    }

    const body = bodySchema.safeParse(await req.json())
    if (!body.success) {
      return NextResponse.json({ error: 'Invalid request', issues: body.error.issues }, { status: 400 })
    }

    const sessionToken = req.cookies.get(COOKIE_TOKEN)?.value
    const res = await fetch(
      `${getCoreLiteBase()}/clinics/${clinic.coreClinicId}/call-booking`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken ? { 'X-SESSION-TOKEN': sessionToken } : {}),
        },
        body: JSON.stringify(body.data),
      },
    )

    const data = await res.json()

    if (!res.ok) {
      console.error('[call/booking POST]', res.status, data)
      return NextResponse.json({ error: data?.message ?? 'Booking failed' }, { status: res.status })
    }

    // Mirror into local DB so the patient dashboard can show it
    const patientClaims = getPatientClaims(req)
    const slotStart = new Date(`${body.data.slot_start.replace(' ', 'T')}+00:00`)
    const slotEnd = new Date(`${body.data.slot_end.replace(' ', 'T')}+00:00`)
    prisma.booking.create({
      data: {
        clinicId: clinic.id,
        coreBookingId: `call-${data.meeting_id ?? Date.now()}`,
        patientName: `${body.data.first_name} ${body.data.last_name}`,
        patientEmail: body.data.email,
        patientPhone: body.data.phone ?? '',
        treatment: 'Video Call',
        slotStart,
        slotEnd,
        status: 'confirmed',
        videoCallMeetingId: String(data.meeting_id ?? ''),
        videoCallJoinUrl: data.join_url ?? null,
        syncedFromCore: true,
        lastSyncedAt: new Date(),
        ...(patientClaims ? { patientId: patientClaims.id } : {}),
      },
    }).catch((err) => console.error('[call/booking] failed to mirror locally:', err))

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('[call/booking POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
