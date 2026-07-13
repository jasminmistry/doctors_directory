import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'
import { getConsentzV1Url, getApplicationId, COOKIE_TOKEN } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const DURATIONS = ['15 min', '30 min', '45 min', '60 min', '90 min', '120 min', '150 min', '180 min', '240 min'] as const

const updateSchema = z.object({
  title: z.string().trim().min(1, 'Event name is required.').max(255).optional(),
  duration: z.enum(DURATIONS).optional(),
  description: z.string().nullable().optional(),
  location: z.enum(['zoom', 'video_call']).optional(),
  price: z.string().nullable().optional(),
  status: z.boolean().optional(),
})

function eventUrl(consentzUserId: number, eventId: string) {
  return `${getConsentzV1Url()}/practitioner/${consentzUserId}/events/${eventId}`
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

export async function PUT(
  req: NextRequest,
  { params }: { params: { eventId: string } },
) {
  const user = await getPortalUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
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
    const res = await fetch(eventUrl(claim.consentzUserId, params.eventId), {
      method: 'PUT',
      headers: coreHeaders(token),
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    })
    const data = await res.json()
    if (!res.ok) {
      const message = (data as { message?: string }).message ?? 'Failed to update event'
      return NextResponse.json({ error: message }, { status: res.status })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error('[portal/events] PUT error:', err)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 502 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { eventId: string } },
) {
  const user = await getPortalUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const claim = await getClaimConsentzUserId(user)
  if (!claim?.consentzUserId) {
    return NextResponse.json({ error: 'Practitioner not linked to Core' }, { status: 422 })
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_TOKEN)?.value

  try {
    const res = await fetch(eventUrl(claim.consentzUserId, params.eventId), {
      method: 'DELETE',
      headers: coreHeaders(token),
      cache: 'no-store',
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      const message = (data as { message?: string }).message ?? 'Failed to delete event'
      return NextResponse.json({ error: message }, { status: res.status })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[portal/events] DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 502 })
  }
}
