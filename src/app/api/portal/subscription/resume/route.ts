export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'
import { sendPlanChangeEmail } from '@/lib/email'

const ENTITY_SELECT = { claimedPlan: true, stripeSubscriptionStatus: true } as const

export async function POST(_req: NextRequest) {
  const user = await getPortalUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const claim = await prisma.claimRequest.findFirst({
      where: { id: user.claimId, status: 'approved' },
      select: { stripeSubscriptionId: true },
    })
    if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })

    const entity = user.entityType === 'clinic'
      ? (user.clinicId ? await prisma.clinic.findUnique({ where: { id: user.clinicId }, select: ENTITY_SELECT }) : null)
      : (user.practitionerId ? await prisma.practitioner.findUnique({ where: { id: user.practitionerId }, select: ENTITY_SELECT }) : null)

    if (!entity) return NextResponse.json({ error: 'Clinic or practitioner not found' }, { status: 404 })

    if (entity.stripeSubscriptionStatus !== 'cancel_at_period_end' || !claim.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No scheduled cancellation to resume' }, { status: 400 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })
    const subscription = await stripe.subscriptions.update(claim.stripeSubscriptionId, { cancel_at_period_end: false })

    // Write the resulting status synchronously so the portal reflects it on the very
    // next fetch, without waiting on the async customer.subscription.updated webhook.
    const updateData = { where: user.entityType === 'clinic' ? { id: user.clinicId! } : { id: user.practitionerId! } }
    const statusData = {
      downgradeToPlan: null,
      stripeSubscriptionStatus: subscription.status,
      subscriptionCancelAt: null,
    }
    if (user.entityType === 'clinic') {
      await prisma.clinic.update({ ...updateData, data: statusData })
    } else {
      await prisma.practitioner.update({ ...updateData, data: statusData })
    }

    try {
      await sendPlanChangeEmail({
        to: user.claimerEmail,
        entityName: user.entityName,
        action: 'resumed',
        fromPlan: entity.claimedPlan ?? 'free',
        toPlan: null,
        effectiveDate: null,
      })
    } catch (err) {
      console.error('[portal] Failed to send plan-resumed email:', err)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[portal] Subscription resume error:', error)
    return NextResponse.json({ error: 'Failed to resume plan' }, { status: 500 })
  }
}
