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
  console.log(`[portal/schedule] GET user=${user.claimerEmail} consentzUserId=${consentzUserId ?? 'none'}`)

  if (!consentzUserId) return NextResponse.json({ schedule: [] })

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_TOKEN)?.value
  const url = scheduleUrl(consentzUserId)
  console.log(`[portal/schedule] GET ${url}  appId=${getApplicationId()} hasToken=${!!token}`)

  try {
    const res = await fetch(url, { headers: coreHeaders(token) })
    console.log(`[portal/schedule] GET → HTTP ${res.status}`)
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`[portal/schedule] GET error body: ${body}`)
      return NextResponse.json({ schedule: [] })
    }
    const data = await res.json()
    const fetchedSchedule = data.schedule ?? data ?? []
    console.log(`[portal/schedule] GET returned ${Array.isArray(fetchedSchedule) ? fetchedSchedule.length : 0} days`)

    // Cache locally so availability can be computed without Core auth
    if (Array.isArray(fetchedSchedule) && fetchedSchedule.length > 0 && claim) {
      await prisma.claimRequest.update({
        where: { id: claim.id },
        data: { scheduleJson: JSON.stringify(fetchedSchedule) },
      }).catch(() => {})
    }

    return NextResponse.json({ schedule: fetchedSchedule })
  } catch (err) {
    console.error('[portal/schedule] GET unexpected error:', err)
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
  console.log(`[portal/schedule] POST user=${user.claimerEmail} consentzUserId=${consentzUserId ?? 'none'} days=${schedule.length}`)

  if (!consentzUserId) {
    console.log('[portal/schedule] POST no consentzUserId — skipping Core, saving wizard flag only')
    if (wizardComplete) {
      await prisma.claimRequest.update({ where: { id: claim.id }, data: { scheduleWizardDone: true } })
    }
    return NextResponse.json({ success: true, schedule: [] })
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_TOKEN)?.value
  const url = scheduleUrl(consentzUserId)
  console.log(`[portal/schedule] POST ${url}  appId=${getApplicationId()} hasToken=${!!token}`)
  console.log(`[portal/schedule] POST payload: ${JSON.stringify(schedule)}`)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: coreHeaders(token),
      body: JSON.stringify(schedule),
    })
    console.log(`[portal/schedule] POST → HTTP ${res.status}`)
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error(`[portal/schedule] POST Core error body: ${errText}`)
      return NextResponse.json({ error: 'Failed to save schedule to Core' }, { status: 502 })
    }
    const result = await res.json()
    console.log(`[portal/schedule] POST Core success, saving scheduleJson locally`)

    await prisma.claimRequest.update({
      where: { id: claim.id },
      data: {
        scheduleConfigured: true,
        scheduleJson: JSON.stringify(schedule),
        ...(wizardComplete ? { scheduleWizardDone: true } : {}),
      },
    })

    return NextResponse.json({ success: true, schedule: result.schedule ?? result })
  } catch (err) {
    console.error('[portal/schedule] POST unexpected error:', err)
    return NextResponse.json({ error: 'Failed to save schedule' }, { status: 500 })
  }
}
