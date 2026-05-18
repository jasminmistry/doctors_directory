export const dynamic = 'force-dynamic'

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
    const customerId = session.customer as string | null
    const claimId = session.metadata?.claimId ? parseInt(session.metadata.claimId, 10) : null
    const plan = session.metadata?.plan ?? null

    // ── Claim-based checkout (PPL setup or subscription) ──────────────────────
    if (claimId && plan) {
      try {
        await prisma.claimRequest.updateMany({
          where: { id: claimId, status: 'otp_verified' },
          data: {
            status: 'pending_approval',
            stripeCustomerId: customerId,
            stripeSubscriptionId: session.mode === 'subscription'
              ? (session.subscription as string | null)
              : null,
          },
        })

        // PPL setup: also store stripeCustomerId directly on the Clinic
        if (plan === 'pay_per_lead' && session.mode === 'setup' && customerId) {
          const claim = await prisma.claimRequest.findUnique({
            where: { id: claimId },
            select: { clinicId: true },
          })
          if (claim?.clinicId) {
            await prisma.clinic.update({
              where: { id: claim.clinicId },
              data: { stripeCustomerId: customerId },
            })
            console.info(`[stripe] Stored stripeCustomerId on clinic ${claim.clinicId} for PPL`)
          }
        }
      } catch (error) {
        console.error('[stripe] checkout.session.completed (claim) processing error:', error)
      }

    // ── Add-card setup from the unlock flow (no claimId, just clinicId) ───────
    } else if (session.mode === 'setup' && customerId && session.metadata?.clinicId) {
      const clinicId = parseInt(session.metadata.clinicId, 10)
      if (!isNaN(clinicId)) {
        await prisma.clinic.update({
          where: { id: clinicId },
          data: { stripeCustomerId: customerId },
        }).catch(err => console.error('[stripe] Failed to store stripeCustomerId from unlock setup:', err))
        console.info(`[stripe] Stored stripeCustomerId on clinic ${clinicId} from unlock setup flow`)
      }
    } else {
      console.warn('[stripe] checkout.session.completed — unhandled metadata', session.id, session.metadata)
    }
  }

  return NextResponse.json({ received: true })
}
