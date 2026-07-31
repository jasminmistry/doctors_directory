export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'
import {
  SUBSCRIPTION_MONTHLY_PRICE,
  PPL_LEAD_PRICE,
  commissionRate,
} from '@/lib/pricing'

function round2(n: number) { return Math.round(n * 100) / 100 }

export async function GET() {
  const role = (await cookies()).get('consentz_role')?.value
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const thisMonthStart = startOfMonth(now)
  const thisMonthEnd   = endOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd   = endOfMonth(subMonths(now, 1))

  const [
    planCounts,
    pplLeads,
    allBookings,
    newSubsThisMonth,
    newSubsLastMonth,
  ] = await Promise.all([
    // Plan distribution
    prisma.clinic.groupBy({
      by: ['claimedPlan'],
      _count: { claimedPlan: true },
    }),

    // All paid lead unlocks (PPL)
    prisma.consultationLead.findMany({
      where: { isUnlocked: true, stripePaymentIntentId: { not: null } },
      select: { unlockedAt: true },
    }),

    // All paid bookings with deposit — include id and plan for audit
    prisma.booking.findMany({
      where: { depositAmount: { not: null, gt: 0 }, status: { not: 'cancelled' } },
      select: {
        id: true,
        depositAmount: true,
        slotStart: true,
        clinic: { select: { claimedPlan: true } },
      },
    }),

    // Subscription approvals this month (proxy for new MRR added)
    prisma.claimRequest.count({
      where: {
        selectedPlan: 'subscription',
        status: 'approved',
        approvedAt: { gte: thisMonthStart, lte: thisMonthEnd },
      },
    }),

    // Subscription approvals last month
    prisma.claimRequest.count({
      where: {
        selectedPlan: 'subscription',
        status: 'approved',
        approvedAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
    }),
  ])

  // Plan distribution map
  const planMap: Record<string, number> = { free: 0, pay_per_lead: 0, subscription: 0 }
  for (const row of planCounts) {
    if (row.claimedPlan) planMap[row.claimedPlan] = row._count.claimedPlan
  }
  const activeSubs = planMap.subscription

  // PPL totals
  const pplAll       = pplLeads.length
  const pplThisMonth = pplLeads.filter((l) => l.unlockedAt && l.unlockedAt >= thisMonthStart && l.unlockedAt <= thisMonthEnd).length
  const pplLastMonth = pplLeads.filter((l) => l.unlockedAt && l.unlockedAt >= lastMonthStart && l.unlockedAt <= lastMonthEnd).length

  // Booking deposit totals + commission split
  let depAll = 0, depThisMonth = 0, depLastMonth = 0
  let commAll = 0, commThisMonth = 0, commLastMonth = 0
  let commPplAll = 0, commSubAll = 0
  let commBookingCount = 0, commGrossTotal = 0

  // Per-plan gross deposit totals (for audit breakdown)
  const depByPlan: Record<string, number> = { pay_per_lead: 0, subscription: 0, free: 0, unknown: 0 }
  const countByPlan: Record<string, number> = { pay_per_lead: 0, subscription: 0, free: 0, unknown: 0 }

  for (const b of allBookings) {
    const amt  = Number(b.depositAmount)
    const plan = b.clinic?.claimedPlan ?? null
    const rate = commissionRate(plan)
    const comm = amt * rate

    depAll  += amt
    commAll += comm

    const planKey = plan ?? 'unknown'
    depByPlan[planKey]   = (depByPlan[planKey]   ?? 0) + amt
    countByPlan[planKey] = (countByPlan[planKey] ?? 0) + 1

    if (rate > 0) {
      commBookingCount++
      commGrossTotal += amt
    }
    if (plan === 'pay_per_lead') commPplAll += comm
    if (plan === 'subscription') commSubAll += comm

    if (b.slotStart >= thisMonthStart && b.slotStart <= thisMonthEnd) {
      depThisMonth  += amt
      commThisMonth += comm
    }
    if (b.slotStart >= lastMonthStart && b.slotStart <= lastMonthEnd) {
      depLastMonth  += amt
      commLastMonth += comm
    }
  }

  return NextResponse.json({
    planBreakdown: {
      free:         planMap.free,
      pay_per_lead: planMap.pay_per_lead,
      subscription: planMap.subscription,
    },
    subscription: {
      activeCount:  activeSubs,
      mrr:          round2(activeSubs * SUBSCRIPTION_MONTHLY_PRICE),
      newThisMonth: newSubsThisMonth,
      newLastMonth: newSubsLastMonth,
    },
    payPerLead: {
      allTimeCount:   pplAll,
      allTimeRevenue: round2(pplAll * PPL_LEAD_PRICE),
      thisMonthCount: pplThisMonth,
      thisMonthRev:   round2(pplThisMonth * PPL_LEAD_PRICE),
      lastMonthCount: pplLastMonth,
      lastMonthRev:   round2(pplLastMonth * PPL_LEAD_PRICE),
    },
    bookingDeposits: {
      allTimeRevenue: round2(depAll),
      allTimeCount:   allBookings.length,
      thisMonthRev:   round2(depThisMonth),
      lastMonthRev:   round2(depLastMonth),
      // Breakdown by clinic plan — useful for validating commission
      byPlan: {
        pay_per_lead: { count: countByPlan.pay_per_lead ?? 0, gross: round2(depByPlan.pay_per_lead ?? 0) },
        subscription: { count: countByPlan.subscription ?? 0, gross: round2(depByPlan.subscription ?? 0) },
        free:         { count: countByPlan.free ?? 0,         gross: round2(depByPlan.free ?? 0) },
        unknown:      { count: countByPlan.unknown ?? 0,      gross: round2(depByPlan.unknown ?? 0) },
      },
    },
    commission: {
      allTime:          round2(commAll),
      thisMonth:        round2(commThisMonth),
      lastMonth:        round2(commLastMonth),
      fromPpl:          round2(commPplAll),
      fromSub:          round2(commSubAll),
      // Audit fields — how many bookings contributed and at what gross amount
      bookingCount:     commBookingCount,
      grossTotal:       round2(commGrossTotal),
    },
    totals: {
      mrr:       round2(activeSubs * SUBSCRIPTION_MONTHLY_PRICE),
      allTime:   round2(pplAll * PPL_LEAD_PRICE + depAll),
      thisMonth: round2(pplThisMonth * PPL_LEAD_PRICE + depThisMonth),
      lastMonth: round2(pplLastMonth * PPL_LEAD_PRICE + depLastMonth),
    },
  })
}
