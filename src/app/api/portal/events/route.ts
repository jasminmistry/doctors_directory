import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'
import { getConsentzV1Url, getApplicationId, COOKIE_TOKEN } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const DURATIONS = ['15 min', '30 min', '45 min', '60 min', '90 min', '120 min', '150 min', '180 min', '240 min'] as const

const createSchema = z.object({
  title: z.string().trim().min(1, 'Event name is required.').max(255),
  duration: z.enum(DURATIONS),
  description: z.string().optional().nullable(),
  location: z.number().int().min(0).max(1),
  price: z.string().nullable().optional(),
  status: z.boolean(),
})

function eventsUrl(consentzUserId: number) {
  return `${getConsentzV1Url()}/practitioner/${consentzUserId}/events`
}

function coreHeaders(token: string | undefined) {
  return {
    'Content-Type': 'application/json',
    'X-APPLICATION-ID': getApplicationId(),
    ...(token ? { 'X-SESSION-TOKEN': token } : {}),
  }
}

async function getClaimConsentzUserId(user: Awaited<ReturnType<typeof getPortalUser>>) {
  if (!user) return null
  const where =
    user.entityType === 'clinic'
      ? { clinicId: user.clinicId!, status: 'approved' as const }
      : { practitionerId: user.practitionerId!, status: 'approved' as const }
  return prisma.claimRequest.findFirst({
    where,
    select: { consentzUserId: true },
    orderBy: { approvedAt: 'desc' },
  })
}

export async function GET() {
  const user = await getPortalUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const claim = await getClaimConsentzUserId(user)
  if (!claim?.consentzUserId) {
    return NextResponse.json({ events: [] })
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_TOKEN)?.value

  try {
    const res = await fetch(eventsUrl(claim.consentzUserId), {
      headers: coreHeaders(token),
    })
    if (!res.ok) {
      console.error(`[portal/events] Core GET failed: ${res.status}`)
      return NextResponse.json({ events: [] })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[portal/events] GET error:', err)
    return NextResponse.json({ events: [] })
  }
}

export async function POST(req: NextRequest) {
  const user = await getPortalUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Please check the form and try again.'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const claim = await getClaimConsentzUserId(user)
  if (!claim?.consentzUserId) {
    return NextResponse.json({ error: 'Practitioner not linked to Core' }, { status: 422 })
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_TOKEN)?.value

  try {
    const res = await fetch(eventsUrl(claim.consentzUserId), {
      method: 'POST',
      headers: coreHeaders(token),
      body: JSON.stringify(parsed.data),
    })
    const data = await res.json()
    if (!res.ok) {
      const message = (data as { message?: string }).message ?? 'Failed to create event'
      return NextResponse.json({ error: message }, { status: res.status })
    }
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('[portal/events] POST error:', err)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 502 })
  }
}
