export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'
import { PPL_LEAD_PRICE_PENCE, SUBSCRIPTION_MONTHLY_PRICE_PENCE } from '@/lib/pricing'

function resolveDirectoryBaseUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_DIRECTORY_BASE_URL,
    process.env.DIRECTORY_BASE_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
  ]

  for (const candidate of candidates) {
    const trimmed = candidate?.trim()
    if (!trimmed) continue

    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

    try {
      return new URL(normalized).origin
    } catch {
      continue
    }
  }

  return 'http://localhost:3000'
}

const DIRECTORY_BASE_URL = resolveDirectoryBaseUrl()

const PLAN_ORDER: Record<string, number> = { free: 0, pay_per_lead: 1, subscription: 2 }

const PLAN_CONFIG: Record<string, { name: string; description: string; amountPence: number }> = {
  pay_per_lead: {
    name: 'Pay-Per-Lead',
    description: 'Priority listing + Verified badge, unlimited instant leads',
    amountPence: PPL_LEAD_PRICE_PENCE,
  },
  subscription: {
    name: 'Subscription',
    description: 'Priority listing + Verified badge, unlimited leads at £0 each',
    amountPence: SUBSCRIPTION_MONTHLY_PRICE_PENCE,
  },
}

const ENTITY_SELECT = { claimedPlan: true, stripeCustomerId: true, stripeSubscriptionStatus: true } as const

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
      select: { id: true, claimerEmail: true },
    })

    if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })

    const entity = user.entityType === 'clinic'
      ? (user.clinicId ? await prisma.clinic.findUnique({ where: { id: user.clinicId }, select: ENTITY_SELECT }) : null)
      : (user.practitionerId ? await prisma.practitioner.findUnique({ where: { id: user.practitionerId }, select: ENTITY_SELECT }) : null)

    if (!entity) return NextResponse.json({ error: 'Clinic or practitioner not found' }, { status: 404 })

    // A scheduled cancellation/downgrade must be resumed before a new upgrade can start,
    // otherwise the pending change (applied later by the webhook) would race this one.
    if (entity.stripeSubscriptionStatus === 'cancel_at_period_end') {
      return NextResponse.json(
        { error: 'You have a scheduled plan change. Resume your current plan before upgrading.' },
        { status: 400 },
      )
    }

    const currentPlanRank = PLAN_ORDER[entity.claimedPlan ?? 'free'] ?? 0
    const newPlanRank = PLAN_ORDER[plan] ?? 0

    if (newPlanRank <= currentPlanRank) {
      return NextResponse.json({ error: 'Can only upgrade to a higher plan' }, { status: 400 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })
    const customerOpts = {
      customer: entity.stripeCustomerId ?? undefined,
      customer_email: entity.stripeCustomerId ? undefined : claim.claimerEmail,
    }
    const successUrl = `${DIRECTORY_BASE_URL}/directory/portal/upgrade/success?plan=${plan}&entityType=${user.entityType}`
    const cancelUrl = `${DIRECTORY_BASE_URL}/directory/portal/${user.entityType}`

    // Pay-per-lead — card-on-file only (SetupIntent), no recurring charge. Billed per
    // lead unlock via src/app/api/portal/leads/[id]/unlock, matching the claim-time flow
    // in src/app/api/claim/select-plan/route.ts.
    if (plan === 'pay_per_lead') {
      const session = await stripe.checkout.sessions.create({
        mode: 'setup',
        payment_method_types: ['card'],
        ...customerOpts,
        metadata: { claimId: String(claim.id), plan },
        success_url: successUrl,
        cancel_url: cancelUrl,
      })
      return NextResponse.json({ redirect: session.url })
    }

    // Subscription — recurring monthly charge
    const planConfig = PLAN_CONFIG[plan]
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      ...customerOpts,
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
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    return NextResponse.json({ redirect: session.url })
  } catch (error) {
    console.error('[portal] Upgrade error:', error)
    return NextResponse.json({ error: 'Failed to create upgrade session' }, { status: 500 })
  }
}
