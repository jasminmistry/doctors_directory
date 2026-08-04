import { NextRequest, NextResponse } from 'next/server'
import { toZonedTime } from 'date-fns-tz'
import { prisma } from '@/lib/db'
import { getCoreAvailability, isCoreConfigured } from '@/lib/core-api'
import { COOKIE_TOKEN } from '@/lib/auth'
import { isClinicScheduleConfigured, SCHEDULE_NOT_CONFIGURED_RESPONSE } from '@/lib/schedule-check'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

// Matches DEFAULT_CLINIC_TIMEZONE in src/lib/core-api.ts — every clinic in
// this directory is UK-based, and the local fallback has no per-clinic
// timezone data to work with.
const CLINIC_TIMEZONE = 'Europe/London'

interface DaySchedule {
  day: string
  startTime: string
  endTime: string
  enabled: boolean
}

function computeLocalSlots(
  scheduleJson: string,
  date: string,
  practitionerId: number,
  practitionerName: string,
) {
  let schedule: DaySchedule[]
  try {
    schedule = JSON.parse(scheduleJson)
  } catch {
    return null
  }

  const d = new Date(`${date}T00:00:00`)
  const dayName = DAY_NAMES[d.getDay()]
  const entry = schedule.find((s) => s.day === dayName && s.enabled)
  if (!entry) return { available: [], slot_duration: 30 }

  const nowZoned = toZonedTime(new Date(), CLINIC_TIMEZONE)
  const todayKey = `${nowZoned.getFullYear()}-${String(nowZoned.getMonth() + 1).padStart(2, '0')}-${String(nowZoned.getDate()).padStart(2, '0')}`
  if (date < todayKey) return { available: [], slot_duration: 30 }

  const [startH, startM] = entry.startTime.split(':').map(Number)
  const [endH, endM] = entry.endTime.split(':').map(Number)
  const startMin = startH * 60 + startM
  const endMin = endH * 60 + endM
  const slotDuration = 30

  // Skip slots that have already passed, when the requested date is today —
  // compared in the clinic's own timezone, not the server's system timezone.
  const nowMin = date === todayKey ? nowZoned.getHours() * 60 + nowZoned.getMinutes() : -1

  const slots = []
  for (let m = startMin; m + slotDuration <= endMin; m += slotDuration) {
    if (m <= nowMin) continue
    const h = Math.floor(m / 60)
    const min = m % 60
    const hh = String(h).padStart(2, '0')
    const mm = String(min).padStart(2, '0')
    const ampm = h < 12 ? 'AM' : 'PM'
    const h12 = h % 12 === 0 ? 12 : h % 12
    const time12 = `${h12}:${mm} ${ampm}`
    slots.push({
      time: `${hh}:${mm}`,
      time_12h: time12,
      datetime: `${date} ${hh}:${mm}:00`,
      practitioner_id: practitionerId,
      practitioner: practitionerName,
    })
  }

  return { available: slots, slot_duration: slotDuration }
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const date = req.nextUrl.searchParams.get('date')
  console.log(`[book/availability] slug=${params.slug} date=${date}`)

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date query param required (YYYY-MM-DD)' }, { status: 400 })
  }

  const clinic = await prisma.clinic.findUnique({
    where: { slug: params.slug },
    select: { id: true, coreClinicId: true, claimedPlan: true },
  })

  console.log(`[book/availability] clinic=${JSON.stringify(clinic)}`)

  if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })

  if (!await isClinicScheduleConfigured(clinic.id)) {
    return NextResponse.json(SCHEDULE_NOT_CONFIGURED_RESPONSE, { status: 422 })
  }

  if (!clinic.coreClinicId) {
    console.log('[book/availability] no coreClinicId — returning empty')
    return NextResponse.json({ available: [], slot_duration: 30 })
  }
  if (!isCoreConfigured()) {
    console.log('[book/availability] Core not configured — returning empty')
    return NextResponse.json({ available: [], slot_duration: 30 })
  }

  try {
    const sessionToken = req.cookies.get(COOKIE_TOKEN)?.value
    console.log(`[book/availability] calling Core coreClinicId=${clinic.coreClinicId} hasToken=${!!sessionToken}`)
    const data = await getCoreAvailability(clinic.coreClinicId, date, sessionToken)
    console.log(`[book/availability] Core returned ${data.available?.length ?? 0} slots`)
    return NextResponse.json(data)
  } catch (err: unknown) {
    console.error('[book/availability] Core API error:', err)
    const status = (err as { status?: number }).status
    if (status === 404) return NextResponse.json({ available: [], slot_duration: 30 })

    // Core returned auth error or is unreachable — fall back to local schedule
    if (status === 401 || status === 403 || !status) {
      console.log('[book/availability] Core auth failed — falling back to local schedule')
      const claim = await prisma.claimRequest.findFirst({
        where: { clinicId: clinic.id, status: 'approved', scheduleConfigured: true },
        select: { scheduleJson: true, consentzUserId: true, consentzUsername: true },
        orderBy: { createdAt: 'desc' },
      })

      if (claim?.scheduleJson) {
        const practitionerId = claim.consentzUserId ?? 0
        const practitionerName = claim.consentzUsername ?? ''
        const result = computeLocalSlots(claim.scheduleJson, date, practitionerId, practitionerName)
        if (result) {
          console.log(`[book/availability] local fallback returned ${result.available.length} slots`)
          return NextResponse.json(result)
        }
      }
      return NextResponse.json({ available: [], slot_duration: 30 })
    }

    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 502 })
  }
}
