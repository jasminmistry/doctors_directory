import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getPatientClaims } from '@/lib/patient-auth'

function getCoreLiteBase() {
  const authUrl = process.env.CONSENTZ_AUTH_API_URL
  if (!authUrl) throw new Error('CONSENTZ_AUTH_API_URL is not configured')
  return `${new URL(authUrl).origin}/api/core-lite`
}

const bodySchema = z.object({
  event_id: z.number().int().positive(),
  practitioner_id: z.number().int().positive(),
  slot_start: z.string().min(1),
  slot_end: z.string().min(1).optional(),
  patient_first_name: z.string().min(1).max(100),
  patient_last_name: z.string().min(1).max(100),
  patient_email: z.string().email(),
  patient_phone: z.string().min(7).max(30).optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { clinicSlug: string } },
) {
  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const clinic = await prisma.clinic.findUnique({
      where: { slug: params.clinicSlug },
      select: { id: true, coreClinicId: true },
    })

    const coreClinicId = clinic?.coreClinicId ?? null

    if (!coreClinicId) {
      return NextResponse.json({ error: 'Online booking not available for this clinic' }, { status: 422 })
    }

    const url = `${getCoreLiteBase()}/clinics/${coreClinicId}/bookings`
    const appId = process.env.CONSENTZ_APPLICATION_ID ?? 'admin'
    const requestPayload = JSON.stringify(parsed.data)
    console.log(`[events/clinic/book] ── REQUEST ──────────────────────────`)
    console.log(`[events/clinic/book]  URL     : POST ${url}`)
    console.log(`[events/clinic/book]  Headers : X-APPLICATION-ID=${appId}  X-SESSION-TOKEN=none (public patient request)`)
    console.log(`[events/clinic/book]  Payload : ${requestPayload}`)
    console.log(`[events/clinic/book] ─────────────────────────────────────`)
    const res = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-APPLICATION-ID': appId },
      body: requestPayload,
    })

    const body = await res.text()
    console.log(`[events/clinic/book] ── RESPONSE ─────────────────────────`)
    console.log(`[events/clinic/book]  Status  : ${res.status}`)
    console.log(`[events/clinic/book]  Body    : ${body}`)
    if (res.status === 401) {
      console.error(`[events/clinic/book]  REASON  : Core requires X-SESSION-TOKEN for POST /bookings.`)
      console.error(`[events/clinic/book]            This is a patient request — no session token available.`)
      console.error(`[events/clinic/book]            Core must allow X-APPLICATION-ID-only access to this endpoint.`)
    }
    console.log(`[events/clinic/book] ─────────────────────────────────────`)

    if (!res.ok) {
      if (res.status === 409) {
        return NextResponse.json({ error: 'This slot is no longer available, please pick another time' }, { status: 409 })
      }
      if (res.status === 400) {
        return NextResponse.json({ error: 'Invalid booking data' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Booking failed — please try again' }, { status: 502 })
    }

    let data: { booking: unknown }
    try { data = JSON.parse(body) } catch {
      return NextResponse.json({ error: 'Booking failed — please try again' }, { status: 502 })
    }

    // Mirror into local DB
    if (clinic && data.booking) {
      const b = data.booking as {
        id: number
        slot_start: string
        slot_end: string
        video_call: { join_url: string | null } | null
      }

      // Prefer logged-in patient session; fall back to matching by booking email
      const sessionClaims = getPatientClaims(req)
      const patient = sessionClaims
        ? await prisma.patient.findUnique({ where: { id: sessionClaims.id }, select: { id: true } })
        : await prisma.patient.findUnique({ where: { email: parsed.data.patient_email }, select: { id: true } })

      await prisma.booking.upsert({
        where: { coreBookingId: String(b.id) },
        create: {
          clinicId: clinic.id,
          coreBookingId: String(b.id),
          patientName: `${parsed.data.patient_first_name} ${parsed.data.patient_last_name}`,
          patientEmail: parsed.data.patient_email,
          patientPhone: parsed.data.patient_phone ?? '',
          slotStart: new Date(b.slot_start),
          slotEnd: new Date(b.slot_end),
          status: 'confirmed',
          syncedFromCore: true,
          lastSyncedAt: new Date(),
          videoCallJoinUrl: b.video_call?.join_url ?? null,
          ...(patient ? { patientId: patient.id } : {}),
        },
        update: {
          status: 'confirmed',
          lastSyncedAt: new Date(),
          videoCallJoinUrl: b.video_call?.join_url ?? null,
          ...(patient ? { patientId: patient.id } : {}),
        },
      })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('[events/clinic/book] unexpected error:', err)
    return NextResponse.json({ error: 'Booking failed — please try again' }, { status: 502 })
  }
}
