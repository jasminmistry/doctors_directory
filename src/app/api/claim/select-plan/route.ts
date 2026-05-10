import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { selectPlanSchema } from '@/lib/schemas/claim.schema'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

const PLAN_CONFIG: Record<string, { name: string; description: string; amountPence: number }> = {
  pay_per_lead: {
    name: 'Pay-Per-Lead',
    description: 'Priority listing + Verified badge, unlimited instant leads',
    amountPence: 1500, // £15.00
  },
  subscription: {
    name: 'Subscription',
    description: 'Priority listing + Verified badge, unlimited leads at £0 each',
    amountPence: 9900, // £99.00
  },
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

    // Free plan — skip Stripe, go straight to pending_approval
    if (plan === 'free') {
      await prisma.claimRequest.update({
        where: { id: claimId },
        data: { selectedPlan: 'free', status: 'pending_approval' },
      })
      return NextResponse.json({ redirect: `/directory/claim/${entitySlug}?claimId=${claimId}&step=pending` })
    }

    // Paid plan — create Stripe Checkout session with inline price_data
    const planConfig = PLAN_CONFIG[plan]
    if (!planConfig) {
      return NextResponse.json({ error: `Unknown plan: ${plan}` }, { status: 400 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'gbp',
            recurring: { interval: 'month' },
            unit_amount: planConfig.amountPence,
            product_data: {
              name: planConfig.name,
              description: planConfig.description,
            },
          },
        },
      ],
      customer_email: claim.claimerEmail,
      metadata: { claimId: String(claimId), plan },
      // Propagate to the subscription so payment_intent.succeeded can resolve the claim
      // via: PaymentIntent → Invoice → Subscription → metadata
      subscription_data: { metadata: { claimId: String(claimId), plan } },
      success_url: `${BASE_URL}/directory/claim/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/directory/claim/${entitySlug}?claimId=${claimId}&step=plan`,
    })

    await prisma.claimRequest.update({
      where: { id: claimId },
      data: { selectedPlan: plan as 'pay_per_lead' | 'subscription', stripeSessionId: session.id },
    })

    return NextResponse.json({ redirect: session.url })
  } catch (error) {
    console.error('Select plan error:', error)
    return NextResponse.json({ error: 'Failed to process plan selection' }, { status: 500 })
  }
}
