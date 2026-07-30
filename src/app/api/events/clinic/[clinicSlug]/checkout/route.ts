import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requirePatient } from '@/lib/patient-auth'
import { domainHasMailServer } from '@/lib/email-domain-check'

export const dynamic = 'force-dynamic'

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/

function resolveDirectoryBaseUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_DIRECTORY_BASE_URL,
    process.env.DIRECTORY_BASE_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
  ]
  for (const candidate of candidates) {
    const trimmed = candidate?.trim()
    if (!trimmed) continue
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    try { return new URL(normalized).origin } catch { continue }
  }
  return 'http://localhost:3000'
}

const bodySchema = z.object({
  event_id: z.number().int().positive(),
  practitioner_id: z.number().int().positive(),
  event_title: z.string().min(1).max(255),
  event_price: z.string().min(1),
  slot_start: z.string().min(1),
  slot_end: z.string().min(1),
  patient_first_name: z.string().trim().min(1, 'First name is required.').max(100),
  patient_last_name: z.string().trim().min(1, 'Last name is required.').max(100),
  patient_email: z.string().trim().min(1, 'Email address is required.').email('Please enter a valid email address.'),
  patient_phone: z.string().trim().max(30).optional()
    .refine((v) => !v || UK_PHONE_RE.test(v.replace(/\s/g, '')), 'Please enter a valid UK phone number.'),
  cancel_url: z.string().url().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { clinicSlug: string } },
) {
  const { patient, error: authError } = await requirePatient(req)
  if (authError) return authError

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Please check the form and try again.'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (!(await domainHasMailServer(parsed.data.patient_email))) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const {
    event_id, practitioner_id, event_title, event_price,
    slot_start, slot_end,
    patient_first_name, patient_last_name, patient_email, patient_phone,
    cancel_url,
  } = parsed.data

  const pricePence = Math.round(parseFloat(event_price) * 100)
  if (isNaN(pricePence) || pricePence <= 0) {
    return NextResponse.json({ error: 'Invalid event price' }, { status: 400 })
  }

  const clinic = await prisma.clinic.findUnique({
    where: { slug: params.clinicSlug },
    select: { id: true, coreClinicId: true },
  })

  if (!clinic?.coreClinicId) {
    return NextResponse.json({ error: 'Online booking not available for this clinic' }, { status: 422 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })
  const baseUrl = resolveDirectoryBaseUrl()
  const safeCancel = cancel_url ?? `${baseUrl}/directory/clinics`

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: patient_email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'gbp',
            unit_amount: pricePence,
            product_data: {
              name: event_title,
              description: `Online consultation — ${slot_start.slice(0, 10)}`,
            },
          },
        },
      ],
      metadata: {
        type: 'event_booking',
        clinicSlug: params.clinicSlug,
        coreClinicId: String(clinic.coreClinicId),
        clinicId: String(clinic.id),
        patient_id: String(patient.id),
        event_id: String(event_id),
        practitioner_id: String(practitioner_id),
        event_title,
        slot_start,
        slot_end,
        patient_first_name,
        patient_last_name,
        patient_email,
        ...(patient_phone ? { patient_phone } : {}),
      },
      success_url: `${baseUrl}/directory/events/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: safeCancel,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[events/clinic/checkout] Stripe error:', err)
    return NextResponse.json({ error: 'Failed to create payment session' }, { status: 502 })
  }
}
