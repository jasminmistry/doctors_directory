export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getPortalUser()
  if (!user || !user.clinicId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const leadId = parseInt(params.id, 10)
  if (isNaN(leadId)) {
    return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 })
  }

  const lead = await prisma.consultationLead.findFirst({
    where: { id: leadId, clinicId: user.clinicId },
  })

  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  if (lead.isUnlocked) {
    return NextResponse.json({ error: 'Lead already unlocked' }, { status: 409 })
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: user.clinicId },
    select: { claimedPlan: true, stripeCustomerId: true },
  })

  if (clinic?.claimedPlan !== 'pay_per_lead') {
    return NextResponse.json({ error: 'Unlock is only available on the Pay-Per-Lead plan' }, { status: 403 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })

  if (!clinic.stripeCustomerId) {
    // Create a customer first so we have the ID before the user goes to Stripe.
    // Stripe setup sessions don't auto-create a customer, so we must pass one.
    const customer = await stripe.customers.create({
      metadata: { clinicId: String(user.clinicId) },
    })
    await prisma.clinic.update({
      where: { id: user.clinicId },
      data: { stripeCustomerId: customer.id },
    })

    const setupSession = await stripe.checkout.sessions.create({
      mode: 'setup',
      customer: customer.id,
      payment_method_types: ['card'],
      metadata: {
        clinicId: String(user.clinicId),
        returnToLeadId: String(leadId),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/directory/portal/clinic/prospects?setup=done&lead=${leadId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/directory/portal/clinic/prospects`,
    })
    return NextResponse.json({ setupRequired: true, url: setupSession.url }, { status: 402 })
  }

  // Fetch the customer's default payment method
  const paymentMethods = await stripe.paymentMethods.list({
    customer: clinic.stripeCustomerId,
    type: 'card',
    limit: 1,
  })

  const paymentMethod = paymentMethods.data[0]
  if (!paymentMethod) {
    return NextResponse.json({ error: 'No card on file. Please update your payment method.' }, { status: 402 })
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount: 1500, // £15.00
      currency: 'gbp',
      customer: clinic.stripeCustomerId,
      payment_method: paymentMethod.id,
      confirm: true,
      off_session: true,
      description: `Lead unlock — ${lead.treatment ?? 'Consultation'} (lead #${lead.id})`,
      metadata: { clinicId: String(user.clinicId), leadId: String(lead.id) },
    })

    if (intent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment failed. Please update your card details.' }, { status: 402 })
    }

    const updated = await prisma.consultationLead.update({
      where: { id: lead.id },
      data: {
        isUnlocked: true,
        unlockedAt: new Date(),
        stripePaymentIntentId: intent.id,
        seenAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      patientName: updated.patientName,
      patientPhone: updated.patientPhone,
      patientEmail: updated.patientEmail,
    })
  } catch (err: unknown) {
    // Stripe throws StripeCardError for declined cards
    const stripeError = err as { type?: string; message?: string }
    if (stripeError?.type === 'StripeCardError') {
      return NextResponse.json({ error: stripeError.message ?? 'Card declined' }, { status: 402 })
    }
    console.error('[leads/unlock] Stripe error:', err)
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 })
  }
}
