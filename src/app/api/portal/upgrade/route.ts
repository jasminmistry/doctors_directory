export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

const PLAN_ORDER: Record<string, number> = { free: 0, pay_per_lead: 1, subscription: 2 }

const PLAN_CONFIG: Record<string, { name: string; description: string; amountPence: number }> = {
  pay_per_lead: {
    name: 'Pay-Per-Lead',
    description: 'Priority listing + Verified badge, unlimited instant leads',
    amountPence: 1500,
  },
  subscription: {
    name: 'Subscription',
    description: 'Priority listing + Verified badge, unlimited leads at £0 each',
    amountPence: 9900,
  },
}

export async function POST(req: NextRequest) {
  const user = await getPortalUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { plan } = await req.json()
    if (!plan || !PLAN_CONFIG[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const claim = await prisma.claimRequest.findFirst({
      where: {
        id: user.claimId,
        status: 'approved',
      },
      select: {
        id: true,
        selectedPlan: true,
        stripeSubscriptionId: true,
        stripeCustomerId: true,
        claimerEmail: true,
      },
    })

    if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })

    const currentPlanRank = PLAN_ORDER[claim.selectedPlan ?? 'free'] ?? 0
    const newPlanRank = PLAN_ORDER[plan] ?? 0

    if (newPlanRank <= currentPlanRank) {
      return NextResponse.json({ error: 'Can only upgrade to a higher plan' }, { status: 400 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })
    const planConfig = PLAN_CONFIG[plan]

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: claim.stripeCustomerId ?? undefined,
      customer_email: claim.stripeCustomerId ? undefined : claim.claimerEmail,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'gbp',
          recurring: { interval: 'month' },
          unit_amount: planConfig.amountPence,
          product_data: { name: planConfig.name, description: planConfig.description },
        },
      }],
      metadata: { claimId: String(claim.id), plan },
      subscription_data: { metadata: { claimId: String(claim.id), plan } },
      success_url: `${BASE_URL}/directory/portal/upgrade/success?plan=${plan}`,
      cancel_url: `${BASE_URL}/directory/portal/${user.entityType}`,
    })

    return NextResponse.json({ redirect: session.url })
  } catch (error) {
    console.error('[portal] Upgrade error:', error)
    return NextResponse.json({ error: 'Failed to create upgrade session' }, { status: 500 })
  }
}
