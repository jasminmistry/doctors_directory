export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'

function getCoreLiteBase() {
  const authUrl = process.env.CONSENTZ_AUTH_API_URL
  if (!authUrl) throw new Error('CONSENTZ_AUTH_API_URL is not configured')
  return `${new URL(authUrl).origin}/api/core-lite`
}

async function handleEventBookingPayment(session: Stripe.Checkout.Session) {
  const meta = session.metadata!
  const coreClinicId = parseInt(meta.coreClinicId, 10)
  const clinicId = parseInt(meta.clinicId, 10)
  const paymentIntentId = session.payment_intent as string | null
  const amountPaid = session.amount_total ? session.amount_total / 100 : null

  try {
    const res = await fetch(`${getCoreLiteBase()}/clinics/${coreClinicId}/bookings`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: parseInt(meta.event_id, 10),
        practitioner_id: parseInt(meta.practitioner_id, 10),
        slot_start: meta.slot_start,
        slot_end: meta.slot_end,
        patient_first_name: meta.patient_first_name,
        patient_last_name: meta.patient_last_name,
        patient_email: meta.patient_email,
        ...(meta.patient_phone ? { patient_phone: meta.patient_phone } : {}),
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`[stripe/webhook] event_booking Core POST failed: HTTP ${res.status} — ${body}`)
      return
    }

    const data = await res.json() as {
      booking: {
        id: number
        slot_start: string
        slot_end: string
        video_call: { join_url: string | null } | null
      }
    }
    const booking = data.booking

    await prisma.booking.upsert({
      where: { coreBookingId: String(booking.id) },
      create: {
        clinicId,
        coreBookingId: String(booking.id),
        patientName: `${meta.patient_first_name} ${meta.patient_last_name}`,
        patientEmail: meta.patient_email,
        patientPhone: meta.patient_phone ?? '',
        treatment: meta.event_title ?? null,
        slotStart: new Date(booking.slot_start),
        slotEnd: new Date(booking.slot_end),
        status: 'confirmed',
        syncedFromCore: true,
        lastSyncedAt: new Date(),
        videoCallJoinUrl: booking.video_call?.join_url ?? null,
        ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
        ...(amountPaid !== null ? { depositAmount: amountPaid } : {}),
      },
      update: {
        status: 'confirmed',
        lastSyncedAt: new Date(),
        videoCallJoinUrl: booking.video_call?.join_url ?? null,
        ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
        ...(amountPaid !== null ? { depositAmount: amountPaid } : {}),
      },
    })

    console.info(`[stripe/webhook] event_booking created: coreBookingId=${booking.id} clinicId=${clinicId}`)
  } catch (err) {
    console.error('[stripe/webhook] event_booking handler error:', err)
  }
}

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
    // ── Event booking payment (directory patient flow) ───────────────────────
    } else if (session.metadata?.type === 'event_booking') {
      await handleEventBookingPayment(session)

    } else {
      console.warn('[stripe] checkout.session.completed — unhandled metadata', session.id, session.metadata)
    }
  }

  return NextResponse.json({ received: true })
}
