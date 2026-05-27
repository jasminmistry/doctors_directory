import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

    // Check business hours for today — only gate on hours if the clinic has any configured
    if (clinic.hours.length > 0) {
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
