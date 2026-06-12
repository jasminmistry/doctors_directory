export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export async function GET(req: NextRequest) {
  const user = await getPortalUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Resolve which clinic(s) to scope earnings to
  let clinicIds: number[] = []

  if (user.entityType === 'clinic' && user.clinicId) {
    clinicIds = [user.clinicId]
  } else if (user.entityType === 'practitioner' && user.practitionerId) {
    const associations = await prisma.practitionerClinicAssociation.findMany({
      where: { practitionerId: user.practitionerId },
      select: { clinicId: true },
    })
    clinicIds = associations.map((a) => a.clinicId)
  }

  if (clinicIds.length === 0) {
    return NextResponse.json({ summary: zeroed(), bookings: [], claimedPlan: null })
  }

  const primaryClinic = await prisma.clinic.findUnique({
    where: { id: clinicIds[0] },
    select: { claimedPlan: true },
  })

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? 'all' // 'all' | 'this_month' | 'last_month'

  const now = new Date()
  let dateFilter: { gte?: Date; lte?: Date } = {}
  if (period === 'this_month') {
    dateFilter = { gte: startOfMonth(now), lte: endOfMonth(now) }
  } else if (period === 'last_month') {
    const last = subMonths(now, 1)
    dateFilter = { gte: startOfMonth(last), lte: endOfMonth(last) }
  }

  const bookings = await prisma.booking.findMany({
    where: {
      clinicId: { in: clinicIds },
      depositAmount: { not: null, gt: 0 },
      status: { not: 'cancelled' },
      ...(Object.keys(dateFilter).length ? { slotStart: dateFilter } : {}),
    },
    orderBy: { slotStart: 'desc' },
    select: {
      id: true,
      patientName: true,
      patientEmail: true,
      treatment: true,
      slotStart: true,
      slotEnd: true,
      status: true,
      depositAmount: true,
      stripePaymentIntentId: true,
      coreBookingId: true,
    },
  })

  // Summary totals (always over full history regardless of period filter)
  const allPaid = await prisma.booking.findMany({
    where: {
      clinicId: { in: clinicIds },
      depositAmount: { not: null, gt: 0 },
      status: { not: 'cancelled' },
    },
    select: { depositAmount: true, slotStart: true },
  })

  const thisMonthStart = startOfMonth(now)
  const thisMonthEnd = endOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  let totalAll = 0
  let totalThisMonth = 0
  let totalLastMonth = 0

  for (const b of allPaid) {
    const amt = Number(b.depositAmount)
    totalAll += amt
    if (b.slotStart >= thisMonthStart && b.slotStart <= thisMonthEnd) totalThisMonth += amt
    if (b.slotStart >= lastMonthStart && b.slotStart <= lastMonthEnd) totalLastMonth += amt
  }

  return NextResponse.json({
    summary: {
      total: round2(totalAll),
      thisMonth: round2(totalThisMonth),
      lastMonth: round2(totalLastMonth),
      bookingCount: allPaid.length,
    },
    bookings: bookings.map((b) => ({
      ...b,
      depositAmount: Number(b.depositAmount),
    })),
    claimedPlan: primaryClinic?.claimedPlan ?? null,
  })
}

function round2(n: number) { return Math.round(n * 100) / 100 }

function zeroed() {
  return { total: 0, thisMonth: 0, lastMonth: 0, bookingCount: 0 }
}
