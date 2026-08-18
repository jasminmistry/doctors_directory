export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'
import { sendPlanChangeEmail } from '@/lib/email'

const PLAN_ORDER: Record<string, number> = { free: 0, pay_per_lead: 1, subscription: 2 }

type Target = 'free' | 'pay_per_lead'

const ENTITY_SELECT = {
  claimedPlan: true,
  stripeCustomerId: true,
  stripeSubscriptionStatus: true,
} as const

export async function POST(req: NextRequest) {
  const user = await getPortalUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { target } = (await req.json()) as { target?: Target }
    if (target !== 'free' && target !== 'pay_per_lead') {
      return NextResponse.json({ error: 'Invalid target plan' }, { status: 400 })
    }

    const claim = await prisma.claimRequest.findFirst({
      where: { id: user.claimId, status: 'approved' },
      select: { id: true, clinicId: true, practitionerId: true, stripeSubscriptionId: true },
    })
    if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })

    const entity = user.entityType === 'clinic'
      ? (user.clinicId ? await prisma.clinic.findUnique({ where: { id: user.clinicId }, select: ENTITY_SELECT }) : null)
      : (user.practitionerId ? await prisma.practitioner.findUnique({ where: { id: user.practitionerId }, select: ENTITY_SELECT }) : null)

    if (!entity) return NextResponse.json({ error: 'Clinic or practitioner not found' }, { status: 404 })

    const currentPlan = entity.claimedPlan ?? 'free'
    if (currentPlan === 'free') {
      return NextResponse.json({ error: 'Nothing to cancel — already on the Free plan' }, { status: 400 })
    }
    if (PLAN_ORDER[target] >= PLAN_ORDER[currentPlan]) {
      return NextResponse.json({ error: 'Target must be a lower plan than your current plan' }, { status: 400 })
    }
    if (entity.stripeSubscriptionStatus === 'cancel_at_period_end') {
      return NextResponse.json(
        { error: 'A cancellation is already scheduled — resume your plan first if you want to change it' },
        { status: 400 },
      )
    }

    const updateData = { where: user.entityType === 'clinic' ? { id: user.clinicId! } : { id: user.practitionerId! } }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })

    let effectiveDate: Date | null = null
    let action: 'scheduled_cancel' | 'immediate_downgrade'

    if (currentPlan === 'pay_per_lead') {
      // Pay-per-lead has no recurring Stripe subscription (card-on-file only) — this is
      // an immediate downgrade, nothing to wait out.
      action = 'immediate_downgrade'

      // Defend against legacy data from before the PPL checkout mode fix, where a PPL
      // entity could have a real recurring subscription — cancel it too so they stop
      // being billed, but don't attempt any further reconciliation.
      if (claim.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.update(claim.stripeSubscriptionId, { cancel_at_period_end: true })
          console.warn(
            `[portal] Cancelled legacy PPL subscription ${claim.stripeSubscriptionId} for claimId=${claim.id} during immediate downgrade to free`,
          )
        } catch (err) {
          console.error('[portal] Failed to cancel legacy PPL subscription:', err)
        }
      }

      if (user.entityType === 'clinic') {
        await prisma.clinic.update({ ...updateData, data: { claimedPlan: 'free', downgradeToPlan: null } })
      } else {
        await prisma.practitioner.update({ ...updateData, data: { claimedPlan: 'free', downgradeToPlan: null } })
      }
    } else {
      // Subscription plan — schedule the Stripe subscription to cancel at period end.
      if (!claim.stripeSubscriptionId) {
        return NextResponse.json({ error: 'No active subscription found — contact support' }, { status: 409 })
      }

      const subscription = await stripe.subscriptions.update(claim.stripeSubscriptionId, {
        cancel_at_period_end: true,
      })
      effectiveDate = subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null
      action = 'scheduled_cancel'

      // Write the resulting status synchronously from Stripe's response so the portal
      // reflects it on the very next fetch, without waiting on the async
      // customer.subscription.updated webhook round-trip (which will also write the
      // same values moments later — harmless, idempotent).
      const statusData = {
        downgradeToPlan: target,
        stripeSubscriptionStatus: 'cancel_at_period_end',
        subscriptionCancelAt: effectiveDate,
      }
      if (user.entityType === 'clinic') {
        await prisma.clinic.update({ ...updateData, data: statusData })
      } else {
        await prisma.practitioner.update({ ...updateData, data: statusData })
      }
    }

    try {
      await sendPlanChangeEmail({
        to: user.claimerEmail,
        entityName: user.entityName,
        action,
        fromPlan: currentPlan,
        toPlan: target,
        effectiveDate,
      })
    } catch (err) {
      console.error('[portal] Failed to send plan-change email:', err)
    }

    return NextResponse.json({ success: true, action, effectiveDate })
  } catch (error) {
    console.error('[portal] Subscription cancel error:', error)
    return NextResponse.json({ error: 'Failed to cancel/downgrade plan' }, { status: 500 })
  }
}
