import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'

// Called on return from Stripe setup. The customer was already created and stored
// before the user went to Stripe, so we just need to find the payment method and charge.
export async function GET(req: NextRequest) {
  const user = await getPortalUser()
  if (!user?.clinicId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const leadId = req.nextUrl.searchParams.get('lead')
    ? parseInt(req.nextUrl.searchParams.get('lead')!, 10)
    : null

  const clinic = await prisma.clinic.findUnique({
    where: { id: user.clinicId },
    select: { stripeCustomerId: true },
  })

  if (!clinic?.stripeCustomerId) {
    return NextResponse.json({ error: 'No customer on file' }, { status: 400 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })

  const pms = await stripe.paymentMethods.list({
    customer: clinic.stripeCustomerId,
    type: 'card',
    limit: 1,
  })
  const pm = pms.data[0]

  if (!pm) {
    // Card setup completed but Stripe hasn't attached the method yet — tell client to retry
    return NextResponse.json({ error: 'Payment method not ready yet', retry: true }, { status: 202 })
  }

  // Auto-unlock the original lead if provided
  let autoUnlocked: number | null = null
  if (leadId && !isNaN(leadId)) {
    const lead = await prisma.consultationLead.findFirst({
      where: { id: leadId, clinicId: user.clinicId, isUnlocked: false },
    })
    if (lead) {
      const intent = await stripe.paymentIntents.create({
        amount: 1500,
        currency: 'gbp',
        customer: clinic.stripeCustomerId,
        payment_method: pm.id,
        confirm: true,
        off_session: true,
        description: `Lead unlock — ${lead.treatment ?? 'Consultation'} (lead #${lead.id})`,
        metadata: { clinicId: String(user.clinicId), leadId: String(lead.id) },
      }).catch((err: unknown) => {
        console.error('[activate-card] PaymentIntent failed:', (err as { message?: string })?.message)
        return null
      })

      if (intent?.status === 'succeeded') {
        await prisma.consultationLead.update({
          where: { id: lead.id },
          data: { isUnlocked: true, unlockedAt: new Date(), stripePaymentIntentId: intent.id, seenAt: new Date() },
        })
        autoUnlocked = lead.id
      }
    }
  }

  return NextResponse.json({ success: true, autoUnlocked })
}
