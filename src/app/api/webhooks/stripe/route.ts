import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Stripe webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const claimId = session.metadata?.claimId ? parseInt(session.metadata.claimId, 10) : null
    const plan = session.metadata?.plan ?? null

    if (!claimId || !plan) {
      console.warn('[stripe] checkout.session.completed — no claimId/plan in metadata', session.id)
      return NextResponse.json({ received: true })
    }

    try {
      const result = await prisma.claimRequest.updateMany({
        where: { id: claimId, status: 'otp_verified' },
        data: {
          status: 'pending_approval',
          stripeCustomerId: session.customer as string | null,
          stripeSubscriptionId: session.subscription as string | null,
        },
      })

      if (result.count > 0) {
        console.info(`[stripe] Claim moved to pending_approval — claimId=${claimId} plan=${plan}`)
      }
    } catch (error) {
      console.error('[stripe] checkout.session.completed processing error:', error)
    }
  }

  return NextResponse.json({ received: true })
}
