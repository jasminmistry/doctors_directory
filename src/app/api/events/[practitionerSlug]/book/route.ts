import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requirePatient } from '@/lib/patient-auth'
import { domainHasMailServer } from '@/lib/email-domain-check'
import { isSlotInPast } from '@/lib/core-api'

function getCoreLiteBase() {
  const authUrl = process.env.CONSENTZ_AUTH_API_URL
  if (!authUrl) throw new Error('CONSENTZ_AUTH_API_URL is not configured')
  return `${new URL(authUrl).origin}/api/core-lite`
}

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/

const bodySchema = z.object({
  event_id: z.number().int().positive(),
  practitioner_id: z.number().int().positive(),
  slot_start: z.string().min(1),
  slot_end: z.string().min(1).optional(),
  patient_first_name: z.string().trim().min(1, 'First name is required.').max(100),
  patient_last_name: z.string().trim().min(1, 'Last name is required.').max(100),
  patient_email: z.string().trim().min(1, 'Email address is required.').email('Please enter a valid email address.'),
  patient_phone: z.string().trim().max(30).optional()
    .refine((v) => !v || UK_PHONE_RE.test(v.replace(/\s/g, '')), 'Please enter a valid UK phone number.'),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { practitionerSlug: string } },
) {
  const { patient, error: authError } = await requirePatient(req)
  if (authError) return authError

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Please check the form and try again.'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (!(await domainHasMailServer(parsed.data.patient_email))) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  if (isSlotInPast(new Date(parsed.data.slot_start))) {
    return NextResponse.json({ error: 'This time slot has already passed — please pick another time' }, { status: 409 })
  }

  try {
    const row = await prisma.practitioner.findUnique({
      where: { slug: params.practitionerSlug },
      select: {
        clinicAssociations: {
          orderBy: { clinicId: 'asc' },
          take: 1,
          select: { clinic: { select: { id: true, coreClinicId: true } } },
        },
      },
    })

    const primaryClinic = row?.clinicAssociations[0]?.clinic ?? null
    const coreClinicId = primaryClinic?.coreClinicId ?? null

    if (!coreClinicId) {
      return NextResponse.json({ error: 'Online booking not available for this practitioner' }, { status: 422 })
    }

    const url = `${getCoreLiteBase()}/clinics/${coreClinicId}/bookings`
    const appId = process.env.CONSENTZ_APPLICATION_ID ?? 'admin'
    console.log(`[events/book] POST ${url}  appId=${appId}`)
    const res = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-APPLICATION-ID': appId },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify(parsed.data),
    })
    console.log(`[events/book] Core HTTP ${res.status}`)

    const body = await res.text()

    if (!res.ok) {
      if (res.status === 409) {
        return NextResponse.json({ error: 'This slot is no longer available, please pick another time' }, { status: 409 })
      }
      if (res.status === 400) {
        return NextResponse.json({ error: 'Invalid booking data' }, { status: 400 })
      }
      console.error(`[events/book] Core error body: ${body}`)
      return NextResponse.json({ error: 'Booking failed — please try again' }, { status: 502 })
    }

    let data: { booking: unknown }
    try { data = JSON.parse(body) } catch {
      return NextResponse.json({ error: 'Booking failed — please try again' }, { status: 502 })
    }

    // Mirror into local DB
    if (primaryClinic && data.booking) {
      const b = data.booking as {
        id: number
        slot_start: string
        slot_end: string
        video_call: { join_url: string | null } | null
      }

      await prisma.booking.upsert({
        where: { coreBookingId: String(b.id) },
        create: {
          clinicId: primaryClinic.id,
          coreBookingId: String(b.id),
          patientId: patient.id,
          patientName: `${parsed.data.patient_first_name} ${parsed.data.patient_last_name}`,
          patientEmail: parsed.data.patient_email,
          patientPhone: parsed.data.patient_phone ?? '',
          slotStart: new Date(b.slot_start),
          slotEnd: new Date(b.slot_end),
          status: 'confirmed',
          syncedFromCore: true,
          lastSyncedAt: new Date(),
          videoCallJoinUrl: b.video_call?.join_url ?? null,
        },
        update: {
          status: 'confirmed',
          lastSyncedAt: new Date(),
          videoCallJoinUrl: b.video_call?.join_url ?? null,
          patientId: patient.id,
        },
      })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('[events/book] unexpected error:', err)
    return NextResponse.json({ error: 'Booking failed — please try again' }, { status: 502 })
  }
}
