import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'
import { getCoreSchedule, setCoreSchedule, resolveClinicTimezone } from '@/lib/core-api'

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

export async function GET() {
  const user = await getPortalUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const claim = await getClaimIds(user)
  const consentzUserId = claim?.consentzUserId
  const timezone = await resolveClinicTimezone(claim?.consentzClinicId ?? null)
  console.log(`[portal/schedule] GET user=${user.claimerEmail} consentzUserId=${consentzUserId ?? 'none'} timezone=${timezone}`)

  if (!consentzUserId) return NextResponse.json({ schedule: [], timezone })

  try {
    const fetchedSchedule = await getCoreSchedule(consentzUserId)
    console.log(`[portal/schedule] GET returned ${fetchedSchedule.length} days`)

    // Cache locally so availability can be computed without a round-trip to Core
    if (fetchedSchedule.length > 0 && claim) {
      await prisma.claimRequest.update({
        where: { id: claim.id },
        data: { scheduleJson: JSON.stringify(fetchedSchedule) },
      }).catch(() => {})
    }

    return NextResponse.json({ schedule: fetchedSchedule, timezone })
  } catch (err) {
    console.error('[portal/schedule] GET unexpected error:', err)
    return NextResponse.json({ schedule: [], timezone })
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

  console.log(`[portal/schedule] POST payload: ${JSON.stringify(schedule)}`)

  try {
    const result = await setCoreSchedule(consentzUserId, schedule)
    console.log(`[portal/schedule] POST Core success, saving scheduleJson locally`)

    await prisma.claimRequest.update({
      where: { id: claim.id },
      data: {
        scheduleConfigured: true,
        scheduleJson: JSON.stringify(schedule),
        ...(wizardComplete ? { scheduleWizardDone: true } : {}),
      },
    })

    return NextResponse.json({ success: true, schedule: result })
  } catch (err) {
    console.error('[portal/schedule] POST unexpected error:', err)
    const status = (err as { status?: number }).status
    const body = (err as { body?: string }).body
    let message = 'Failed to save schedule'
    if (body) {
      try {
        message = (JSON.parse(body) as { error?: { message?: string } }).error?.message ?? message
      } catch { /* raw, non-JSON body */ }
    }
    const clientStatus = status && status >= 400 && status < 500 ? status : 500
    return NextResponse.json({ error: message }, { status: clientStatus })
  }
}
