export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { selectPlanSchema } from '@/lib/schemas/claim.schema'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

const SUBSCRIPTION_CONFIG = {
  name: 'Verified Subscription',
  description: 'Priority listing + Verified badge, unlimited leads at £0 each',
  amountPence: 9900, // £99.00/month
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = selectPlanSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { claimId, plan } = parsed.data

    const claim = await prisma.claimRequest.findUnique({
      where: { id: claimId },
      include: {
        clinic: { select: { name: true, slug: true } },
        practitioner: { select: { displayName: true, slug: true } },
      },
    })

    if (!claim) {
      return NextResponse.json({ error: 'Claim request not found' }, { status: 404 })
    }

    if (claim.status !== 'otp_verified') {
      return NextResponse.json({ error: 'Email must be verified before selecting a plan' }, { status: 400 })
    }

    const entitySlug =
      claim.entityType === 'practitioner'
        ? `practitioner/${claim.practitionerSlug}`
        : claim.clinicSlug

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })

    // Free plan — skip Stripe, go straight to pending_approval
    if (plan === 'free') {
      await prisma.claimRequest.update({
        where: { id: claimId },
        data: { selectedPlan: 'free', status: 'pending_approval' },
      })
      return NextResponse.json({ redirect: `/directory/claim/${entitySlug}?claimId=${claimId}&step=pending` })
    }

    // PPL — SetupIntent to capture card with no upfront charge (£15 charged per-lead unlock)
    if (plan === 'pay_per_lead') {
      const session = await stripe.checkout.sessions.create({
        mode: 'setup',
        payment_method_types: ['card'],
        customer_email: claim.claimerEmail,
        metadata: { claimId: String(claimId), plan },
        success_url: `${BASE_URL}/directory/claim/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/directory/claim/${entitySlug}?claimId=${claimId}&step=plan`,
      })
      await prisma.claimRequest.update({
        where: { id: claimId },
        data: { selectedPlan: 'pay_per_lead', stripeSessionId: session.id },
      })
      return NextResponse.json({ redirect: session.url })
    }

    // Subscription — £99/month recurring
    if (plan === 'subscription') {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'gbp',
              recurring: { interval: 'month' },
              unit_amount: SUBSCRIPTION_CONFIG.amountPence,
              product_data: {
                name: SUBSCRIPTION_CONFIG.name,
                description: SUBSCRIPTION_CONFIG.description,
              },
            },
          },
        ],
        customer_email: claim.claimerEmail,
        metadata: { claimId: String(claimId), plan },
        subscription_data: { metadata: { claimId: String(claimId), plan } },
        success_url: `${BASE_URL}/directory/claim/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/directory/claim/${entitySlug}?claimId=${claimId}&step=plan`,
      })
      await prisma.claimRequest.update({
        where: { id: claimId },
        data: { selectedPlan: 'subscription', stripeSessionId: session.id },
      })
      return NextResponse.json({ redirect: session.url })
    }

    return NextResponse.json({ error: `Unknown plan: ${plan}` }, { status: 400 })
  } catch (error) {
    console.error('Select plan error:', error)
    return NextResponse.json({ error: 'Failed to process plan selection' }, { status: 500 })
  }
}
