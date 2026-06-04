import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

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
  { params }: { params: { practitionerSlug: string } },
) {
  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
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
    const res = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    })

    const body = await res.text()

    if (!res.ok) {
      if (res.status === 409) {
        return NextResponse.json({ error: 'This slot is no longer available, please pick another time' }, { status: 409 })
      }
      if (res.status === 400) {
        return NextResponse.json({ error: 'Invalid booking data' }, { status: 400 })
      }
      console.error(`[events/book] Core HTTP ${res.status}: ${body}`)
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
        },
      })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('[events/book] unexpected error:', err)
    return NextResponse.json({ error: 'Booking failed — please try again' }, { status: 502 })
  }
}
