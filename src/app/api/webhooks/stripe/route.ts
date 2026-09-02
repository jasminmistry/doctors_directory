export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { purchaseEvent, sendMpEvents } from '@/lib/analytics/measurement-protocol'
import { SUBSCRIPTION_MONTHLY_PRICE } from '@/lib/pricing'

function getCoreLiteBase() {
  const authUrl = process.env.CONSENTZ_AUTH_API_URL
  if (!authUrl) throw new Error('CONSENTZ_AUTH_API_URL is not configured')
  return `${new URL(authUrl).origin}/api/core-lite`
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Finds the clinic linked to a Stripe subscription ID via ClaimRequest.
 * Returns null if not found.
 */
async function findClinicBySubscriptionId(subscriptionId: string) {
  const claim = await prisma.claimRequest.findFirst({
    where: { stripeSubscriptionId: subscriptionId, status: 'approved' },
    select: { clinicId: true, practitionerId: true },
  })
  if (!claim) return null
  return claim
}

// ── Event handlers ────────────────────────────────────────────────────────────

async function handleEventBookingPayment(session: Stripe.Checkout.Session) {
  const meta = session.metadata!
  const coreClinicId = parseInt(meta.coreClinicId, 10)
  const clinicId = parseInt(meta.clinicId, 10)
  const paymentIntentId = session.payment_intent as string | null
  const amountPaid = session.amount_total ? session.amount_total / 100 : null

  try {
    const appId = process.env.CONSENTZ_APPLICATION_ID ?? 'admin'
    const res = await fetch(`${getCoreLiteBase()}/clinics/${coreClinicId}/bookings`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-APPLICATION-ID': appId },
      signal: AbortSignal.timeout(8000),
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

    const patientId = meta.patient_id ? parseInt(meta.patient_id, 10) : null

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
        ...(patientId ? { patientId } : {}),
      },
      update: {
        status: 'confirmed',
        lastSyncedAt: new Date(),
        videoCallJoinUrl: booking.video_call?.join_url ?? null,
        ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
        ...(amountPaid !== null ? { depositAmount: amountPaid } : {}),
        ...(patientId ? { patientId } : {}),
      },
    })

    console.info(`[stripe/webhook] event_booking created: coreBookingId=${booking.id} clinicId=${clinicId}`)

    if (amountPaid && amountPaid > 0 && paymentIntentId) {
      await sendMpEvents(meta.ga_client_id, [
        purchaseEvent({
          transactionId: paymentIntentId,
          value: amountPaid,
          itemId: 'booking_deposit',
          itemName: meta.event_title ?? 'Booking deposit',
          extra: { clinic_slug: meta.clinic_slug, booking_type: 'event' },
        }),
      ])
    }
  } catch (err) {
    console.error('[stripe/webhook] event_booking handler error:', err)
  }
}

/**
 * customer.subscription.updated
 *
 * Handles three sub-cases:
 *  1. cancel_at_period_end = true  → scheduled cancellation, keep plan but record cancel date
 *  2. cancel_at_period_end = false → cancellation reversed; clear cancel date
 *  3. status = past_due / unpaid   → payment failing; record status so portal can warn
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const claim = await findClinicBySubscriptionId(subscription.id)
  if (!claim?.clinicId && !claim?.practitionerId) {
    console.warn(`[stripe/webhook] subscription.updated — no clinic/practitioner found for sub ${subscription.id}`)
    return
  }

  const cancelAt = subscription.cancel_at
    ? new Date(subscription.cancel_at * 1000)
    : null

  // Determine the status label to store
  let statusLabel: string = subscription.status // active | past_due | unpaid | canceled | ...
  if (subscription.cancel_at_period_end && subscription.status === 'active') {
    statusLabel = 'cancel_at_period_end'
  }

  const data = { stripeSubscriptionStatus: statusLabel, subscriptionCancelAt: cancelAt }

  if (claim.clinicId) {
    await prisma.clinic.update({ where: { id: claim.clinicId }, data })
  } else if (claim.practitionerId) {
    await prisma.practitioner.update({ where: { id: claim.practitionerId }, data })
  }

  console.info(
    `[stripe/webhook] subscription.updated: clinicId=${claim.clinicId ?? '-'} practitionerId=${claim.practitionerId ?? '-'} status=${statusLabel} cancelAt=${cancelAt?.toISOString() ?? 'none'}`,
  )
}

/**
 * customer.subscription.deleted
 *
 * The subscription has actually ended (either immediately cancelled or period ended
 * after cancel_at_period_end). Downgrade the clinic to the free plan.
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const claim = await findClinicBySubscriptionId(subscription.id)
  if (!claim?.clinicId && !claim?.practitionerId) {
    console.warn(`[stripe/webhook] subscription.deleted — no clinic/practitioner found for sub ${subscription.id}`)
    return
  }

  if (claim.clinicId) {
    const clinic = await prisma.clinic.findUnique({ where: { id: claim.clinicId }, select: { downgradeToPlan: true } })
    const targetPlan = clinic?.downgradeToPlan ?? 'free'
    await prisma.clinic.update({
      where: { id: claim.clinicId },
      data: {
        claimedPlan: targetPlan,
        stripeSubscriptionStatus: 'canceled',
        subscriptionCancelAt: null,
        downgradeToPlan: null,
      },
    })
    console.info(`[stripe/webhook] subscription.deleted: clinicId=${claim.clinicId} → downgraded to ${targetPlan}`)
  } else if (claim.practitionerId) {
    const practitioner = await prisma.practitioner.findUnique({ where: { id: claim.practitionerId }, select: { downgradeToPlan: true } })
    const targetPlan = practitioner?.downgradeToPlan ?? 'free'
    await prisma.practitioner.update({
      where: { id: claim.practitionerId },
      data: {
        claimedPlan: targetPlan,
        stripeSubscriptionStatus: 'canceled',
        subscriptionCancelAt: null,
        downgradeToPlan: null,
      },
    })
    console.info(`[stripe/webhook] subscription.deleted: practitionerId=${claim.practitionerId} → downgraded to ${targetPlan}`)
  }
}

/**
 * invoice.payment_failed
 *
 * Card declined on a subscription renewal. Mark status as past_due so the
 * portal can surface a "please update your card" warning. Stripe will retry
 * automatically; if all retries fail it fires subscription.deleted.
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const parentSub = invoice.parent?.subscription_details?.subscription
  const subscriptionId = typeof parentSub === 'string'
    ? parentSub
    : (parentSub as Stripe.Subscription | undefined)?.id ?? null

  if (!subscriptionId) return

  const claim = await findClinicBySubscriptionId(subscriptionId)
  if (!claim?.clinicId && !claim?.practitionerId) return

  if (claim.clinicId) {
    await prisma.clinic.update({ where: { id: claim.clinicId }, data: { stripeSubscriptionStatus: 'past_due' } })
  } else if (claim.practitionerId) {
    await prisma.practitioner.update({ where: { id: claim.practitionerId }, data: { stripeSubscriptionStatus: 'past_due' } })
  }

  console.warn(`[stripe/webhook] invoice.payment_failed: clinicId=${claim.clinicId ?? '-'} practitionerId=${claim.practitionerId ?? '-'} subscription=${subscriptionId}`)
}

// ── Main webhook handler ──────────────────────────────────────────────────────

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

  switch (event.type) {
    // ── Checkout completed ─────────────────────────────────────────────────
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = session.customer as string | null
      const claimId = session.metadata?.claimId ? parseInt(session.metadata.claimId, 10) : null
      const plan = session.metadata?.plan ?? null

      if (claimId && plan) {
        try {
          // Persist Stripe identifiers unconditionally — covers both the claim-time checkout
          // (status still otp_verified) and a later portal-upgrade checkout (status already
          // approved), so findClinicBySubscriptionId() can always locate the entity for the
          // subscription lifecycle webhooks below.
          await prisma.claimRequest.updateMany({
            where: { id: claimId },
            data: {
              stripeCustomerId: customerId,
              stripeSubscriptionId: session.mode === 'subscription'
                ? (session.subscription as string | null)
                : null,
            },
          })

          // Claim-time flow only: move into the admin approval queue. claimedPlan is set
          // when admin approves (src/app/api/admin/claims/[id]/route.ts), not here.
          const statusFlip = await prisma.claimRequest.updateMany({
            where: { id: claimId, status: 'otp_verified' },
            data: { status: 'pending_approval' },
          })

          const claim = await prisma.claimRequest.findUnique({
            where: { id: claimId },
            select: { clinicId: true, practitionerId: true, status: true, gaClientId: true },
          })

          // A portal upgrade happens against an already-approved claim — the status flip
          // above matches nothing in that case, so this checkout must apply the plan
          // change directly instead of waiting on an admin approval step that already happened.
          const isPortalUpgrade = claim?.status === 'approved' && statusFlip.count === 0

          if (claim && plan === 'pay_per_lead' && session.mode === 'setup' && customerId) {
            const data = {
              stripeCustomerId: customerId,
              ...(isPortalUpgrade ? { claimedPlan: 'pay_per_lead' as const, downgradeToPlan: null } : {}),
            }
            if (claim.clinicId) {
              await prisma.clinic.update({ where: { id: claim.clinicId }, data })
            } else if (claim.practitionerId) {
              await prisma.practitioner.update({ where: { id: claim.practitionerId }, data })
            }
            console.info(
              `[stripe] PPL setup stored: clinicId=${claim.clinicId ?? '-'} practitionerId=${claim.practitionerId ?? '-'} portalUpgrade=${isPortalUpgrade}`,
            )
          }

          // When a new subscription activates, record the status as active
          if (claim && plan === 'subscription' && session.mode === 'subscription') {
            const data = {
              stripeSubscriptionStatus: 'active',
              subscriptionCancelAt: null,
              ...(isPortalUpgrade ? { claimedPlan: 'subscription' as const, downgradeToPlan: null } : {}),
            }
            if (claim.clinicId) {
              await prisma.clinic.update({ where: { id: claim.clinicId }, data })
            } else if (claim.practitionerId) {
              await prisma.practitioner.update({ where: { id: claim.practitionerId }, data })
            }
            console.info(
              `[stripe] Subscription activated: clinicId=${claim.clinicId ?? '-'} practitionerId=${claim.practitionerId ?? '-'} portalUpgrade=${isPortalUpgrade}`,
            )

            const subscriptionId = session.subscription as string | null
            await sendMpEvents(session.metadata?.ga_client_id ?? claim.gaClientId, [
              purchaseEvent({
                transactionId: subscriptionId ?? session.id,
                value: SUBSCRIPTION_MONTHLY_PRICE,
                itemId: 'subscription',
                itemName: 'Verified Subscription',
                extra: {
                  plan: 'subscription',
                  billing_period: 'month',
                  portal_upgrade: isPortalUpgrade,
                  entity_type: claim.clinicId ? 'clinic' : 'practitioner',
                },
              }),
            ])
          }
        } catch (error) {
          console.error('[stripe] checkout.session.completed (claim) processing error:', error)
        }

      } else if (session.mode === 'setup' && customerId && session.metadata?.clinicId) {
        const clinicId = parseInt(session.metadata.clinicId, 10)
        if (!isNaN(clinicId)) {
          await prisma.clinic.update({
            where: { id: clinicId },
            data: { stripeCustomerId: customerId },
          }).catch(err => console.error('[stripe] Failed to store stripeCustomerId from unlock setup:', err))
          console.info(`[stripe] Stored stripeCustomerId on clinic ${clinicId} from unlock setup flow`)
        }

      } else if (session.metadata?.type === 'event_booking') {
        await handleEventBookingPayment(session)

      } else {
        console.warn('[stripe] checkout.session.completed — unhandled metadata', session.id, session.metadata)
      }
      break
    }

    // ── Subscription lifecycle ─────────────────────────────────────────────
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break

    // ── Payment failures ───────────────────────────────────────────────────
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
      break

    default:
      // Silently ignore unhandled event types
      break
  }

  return NextResponse.json({ received: true })
}
