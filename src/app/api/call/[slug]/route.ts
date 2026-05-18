import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

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
      select: { coreClinicId: true },
    })

    if (!clinic?.coreClinicId) {
      return NextResponse.json({ error: 'Online call booking is not available for this clinic' }, { status: 400 })
    }

    const body = bodySchema.safeParse(await req.json())
    if (!body.success) {
      return NextResponse.json({ error: 'Invalid request', issues: body.error.issues }, { status: 400 })
    }

    const res = await fetch(
      `${getCoreLiteBase()}/clinics/${clinic.coreClinicId}/call-booking`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body.data),
      },
    )

    const data = await res.json()

    if (!res.ok) {
      console.error('[call/booking POST]', res.status, data)
      return NextResponse.json({ error: data?.message ?? 'Booking failed' }, { status: res.status })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('[call/booking POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
