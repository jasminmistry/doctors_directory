import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isTodayEnabledInPortalSchedule } from '@/lib/schedule-check'

export const dynamic = 'force-dynamic'

const PRESENCE_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

const DOW_MAP: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        claimed: true,
        presence: { select: { lastSeenAt: true } },
        hours: { select: { dayOfWeek: true, hours: true } },
        claimRequests: {
          where: { status: 'approved', scheduleConfigured: true },
          select: { scheduleJson: true },
          orderBy: { approvedAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!clinic) {
      return NextResponse.json({ online: false }, { status: 404 })
    }

    if (!clinic.claimed) {
      return NextResponse.json({ online: false })
    }

    // Check portal presence (logged-in within last 5 min)
    const lastSeen = clinic.presence?.lastSeenAt
    if (!lastSeen || Date.now() - lastSeen.getTime() > PRESENCE_TIMEOUT_MS) {
      return NextResponse.json({ online: false })
    }

    // Business hours for today — prefer the portal-configured booking schedule over
    // the legacy ClinicHour mirror, same priority as the public profile's Hours display
    // (see formatPortalScheduleForDisplay). Only gate on either if one is configured.
    const scheduleToday = isTodayEnabledInPortalSchedule(clinic.claimRequests[0]?.scheduleJson)
    if (scheduleToday !== null) {
      if (!scheduleToday) {
        return NextResponse.json({ online: false })
      }
    } else if (clinic.hours.length > 0) {
      const today = DOW_MAP[new Date().getDay()]
      const todayHours = clinic.hours.find((h) => h.dayOfWeek === today)
      if (!todayHours?.hours) {
        return NextResponse.json({ online: false })
      }
    }

    return NextResponse.json({ online: true })
  } catch (err) {
    console.error('[chat/status]', err)
    return NextResponse.json({ online: false }, { status: 500 })
  }
}
