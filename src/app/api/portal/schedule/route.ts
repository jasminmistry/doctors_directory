import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'
import { getConsentzV1Url, getApplicationId, COOKIE_TOKEN } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const daySchema = z.object({
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
  enabled: z.boolean(),
})

const scheduleBodySchema = z.object({
  schedule: z.array(daySchema).min(1),
  wizardComplete: z.boolean().optional(),
})

async function getClaimIds(user: Awaited<ReturnType<typeof getPortalUser>>) {
  if (!user) return null
  const where =
    user.entityType === 'clinic'
      ? { clinicId: user.clinicId!, status: 'approved' as const }
      : { practitionerId: user.practitionerId!, status: 'approved' as const }

  return prisma.claimRequest.findFirst({
    where,
    select: { id: true, consentzUserId: true, consentzClinicId: true },
    orderBy: { approvedAt: 'desc' },
  })
}

// Self-service endpoint — portal users call /api/v1/practitioner/{id}/schedule.
// Admin routes call /register/practitioner|clinic/{id}/schedule (admin token only).
function scheduleUrl(consentzUserId: number) {
  return `${getConsentzV1Url()}/practitioner/${consentzUserId}/schedule`
}

function coreHeaders(token: string | undefined) {
  return {
    'Content-Type': 'application/json',
    'X-APPLICATION-ID': getApplicationId(),
    ...(token ? { 'X-SESSION-TOKEN': token } : {}),
  }
}

export async function GET() {
  const user = await getPortalUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const claim = await getClaimIds(user)
  const consentzUserId = claim?.consentzUserId

  if (!consentzUserId) return NextResponse.json({ schedule: [] })

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_TOKEN)?.value

  try {
    const res = await fetch(scheduleUrl(consentzUserId), { headers: coreHeaders(token) })
    if (res.status === 404) return NextResponse.json({ schedule: [] })
    if (!res.ok) return NextResponse.json({ schedule: [] })
    const data = await res.json()
    return NextResponse.json({ schedule: data.schedule ?? data ?? [] })
  } catch {
    return NextResponse.json({ schedule: [] })
  }
}

export async function POST(req: NextRequest) {
  const user = await getPortalUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = scheduleBodySchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { schedule, wizardComplete } = parsed.data
  const claim = await getClaimIds(user)
  if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })

  const consentzUserId = claim.consentzUserId

  if (!consentzUserId) {
    if (wizardComplete) {
      await prisma.claimRequest.update({ where: { id: claim.id }, data: { scheduleWizardDone: true } })
    }
    return NextResponse.json({ success: true, schedule: [] })
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_TOKEN)?.value

  try {
    const res = await fetch(scheduleUrl(consentzUserId), {
      method: 'POST',
      headers: coreHeaders(token),
      body: JSON.stringify(schedule),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('[portal/schedule] Core API error:', res.status, errText)
      return NextResponse.json({ error: 'Failed to save schedule to Core' }, { status: 502 })
    }
    const result = await res.json()

    await prisma.claimRequest.update({
      where: { id: claim.id },
      data: {
        scheduleConfigured: true,
        ...(wizardComplete ? { scheduleWizardDone: true } : {}),
      },
    })

    return NextResponse.json({ success: true, schedule: result.schedule ?? result })
  } catch (err) {
    console.error('[portal/schedule] error:', err)
    return NextResponse.json({ error: 'Failed to save schedule' }, { status: 500 })
  }
}
