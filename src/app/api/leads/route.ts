import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getPatientClaims } from '@/lib/patient-auth'
import { domainHasMailServer } from '@/lib/email-domain-check'
import { sendGhostLeadHook, sendLeadNotificationEmail, sendPplLeadTeaserEmail } from '@/lib/email'
import { signEmailTrackingToken } from '@/lib/email-open-tracking'
import { getClaimState } from '@/lib/claim-utils'
import { CONSENT_FORM_VERSION, consentCheckboxWording } from '@/lib/consent'

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/
const NAME_RE = /^[A-Za-z]+(?:[-' ][A-Za-z]+)*$/
const NAME_ERROR = 'Enter a valid name (letters only, no numbers or symbols).'

// Collapses internal double/triple spaces (e.g. "William  Arthur") before validating,
// so stray extra whitespace doesn't trip the letters-only regex below.
function nameField(requiredError: string) {
  return z.string()
    .transform((v) => v.trim().replace(/\s+/g, ' '))
    .pipe(z.string().min(1, requiredError).max(50, NAME_ERROR).regex(NAME_RE, NAME_ERROR))
}

const schema = z.object({
  clinicSlug: z.string().trim().min(1),
  firstName: nameField('First name is required.'),
  lastName: nameField('Last name is required.'),
  email: z.string().trim().min(1, 'Email address is required.').email('Please enter a valid email address.').max(255),
  phone: z.string().trim().max(20).optional(),
  treatment: z.string().trim().max(255).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  location: z.string().trim().max(255).optional(),
  source: z.enum(['consultation', 'pricing']).optional(),
})

function isOver18(dob: string): boolean {
  const birth = new Date(dob)
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - 18)
  return birth <= cutoff
}

export async function GET(req: NextRequest) {
  try {
    const claims = getPatientClaims(req)
    if (!claims) {
      return NextResponse.json({ exists: false })
    }

    const { searchParams } = new URL(req.url)
    const clinicSlug = searchParams.get('clinicSlug')
    const source = searchParams.get('source')
    if (!clinicSlug || (source !== 'consultation' && source !== 'pricing')) {
      return NextResponse.json({ error: 'clinicSlug and source are required' }, { status: 400 })
    }

    const clinic = await prisma.clinic.findUnique({ where: { slug: clinicSlug }, select: { id: true } })
    if (!clinic) {
      return NextResponse.json({ exists: false })
    }

    const lead = await prisma.consultationLead.findFirst({
      where: { clinicId: clinic.id, patientId: claims.id, source },
      orderBy: { createdAt: 'desc' },
      select: { patientEmail: true },
    })

    return NextResponse.json({ exists: !!lead, email: lead?.patientEmail ?? null })
  } catch (error) {
    console.error('[leads] lookup error:', error)
    return NextResponse.json({ exists: false })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Please check the form and try again.'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { clinicSlug, firstName, lastName, email, phone, treatment, dateOfBirth, location, source } = parsed.data

    // A logged-in patient's email is never taken from the client-submitted form — that
    // field is only a display prefill in the UI. The verified email on the signed
    // session cookie is what's stored and what the clinic is told to contact, so a
    // patient can't associate a lead with an email address they don't own.
    const claims = getPatientClaims(req)
    const patientEmail = claims?.email ?? email

    const cleanPhone = phone ? phone.replace(/\s/g, '') : ''
    if (phone && !UK_PHONE_RE.test(cleanPhone)) {
      return NextResponse.json({ error: 'Please enter a valid UK phone number.' }, { status: 400 })
    }

    if (dateOfBirth && !isOver18(dateOfBirth)) {
      return NextResponse.json({ error: 'You must be 18 or over to use this service.' }, { status: 400 })
    }

    if (!(await domainHasMailServer(patientEmail))) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const patientName = `${firstName} ${lastName}`.trim()

    const clinic = await prisma.clinic.findUnique({
      where: { slug: clinicSlug },
      select: { id: true, name: true, claimed: true, claimedPlan: true, email: true, gmapsPhone: true },
    })

    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }

    const isGhostLead = !clinic.claimed

    // Resolve patient from session — link lead and autosave profile fields
    let patientId: number | undefined

    if (claims) {
      const dobDate = dateOfBirth ? new Date(dateOfBirth) : undefined
      const updated = await prisma.patient.update({
        where: { id: claims.id },
        data: {
          firstName,
          lastName,
          ...(cleanPhone ? { phone: cleanPhone } : {}),
          ...(dobDate ? { dateOfBirth: dobDate } : {}),
        },
        select: { id: true },
      }).catch(() => null)

      if (updated) patientId = updated.id
    }

    const lead = await prisma.consultationLead.create({
      data: {
        clinicId: clinic.id,
        patientName,
        patientPhone: cleanPhone,
        patientEmail,
        treatment,
        location,
        isGhostLead,
        ...(source ? { source } : {}),
        ...(patientId ? { patientId } : {}),
      },
    })

    if (patientId) {
      const wording = consentCheckboxWording(clinic.name ?? clinicSlug)
      await prisma.patientConsent.createMany({
        data: (['share', 'privacy', 'age', 'terms'] as const).map((checkbox) => ({
          patientId,
          checkbox,
          ticked: true,
          wordingShown: wording[checkbox],
          formVersion: CONSENT_FORM_VERSION,
        })),
      }).catch((err) => console.error('[leads] failed to record consent:', err))
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    const trackingPixelUrl = `${baseUrl}/directory/api/track/email-open/${signEmailTrackingToken('lead', lead.id)}/`
    const recordEmailSent = () =>
      prisma.consultationLead.update({
        where: { id: lead.id },
        data: { notificationEmailTo: clinic.email, notificationEmailSentAt: new Date() },
      })

    // Notify the clinic. The lead is already persisted, so a send failure must not
    // fail the request — log and move on. Awaited (not fire-and-forget) so the
    // "email sent" timestamp is committed before we respond: a worker restart
    // between the send and the DB write can no longer lose it.
    try {
      if (isGhostLead) {
        if (clinic.email) {
          // Skip the "claim your profile" email if a claim is already in flight or
          // approved — the clinic already knows, no need to nag them again.
          const claimState = await getClaimState({ claimed: false, entityType: 'clinic', slug: clinicSlug })
          if (claimState === 'unclaimed') {
            const pendingCount = await prisma.consultationLead.count({
              where: { clinicId: clinic.id, isGhostLead: true, isUnlocked: false },
            })
            await sendGhostLeadHook({
              to: clinic.email,
              clinicName: clinic.name ?? clinicSlug,
              patientFirstName: firstName,
              location: location ?? '',
              pendingCount,
              claimUrl: `${baseUrl}/directory/claim/${clinicSlug}`,
              trackingPixelUrl,
            })
            await recordEmailSent()
          }
        }
      } else if (clinic.email) {
        const portalUrl = `${baseUrl}/directory/portal/clinic/prospects`
        if (clinic.claimedPlan === 'subscription') {
          await sendLeadNotificationEmail({
            to: clinic.email,
            clinicName: clinic.name ?? clinicSlug,
            patientName,
            contact: patientEmail,
            treatment,
            location,
            portalUrl,
            trackingPixelUrl,
          })
        } else {
          await sendPplLeadTeaserEmail({
            to: clinic.email,
            clinicName: clinic.name ?? clinicSlug,
            treatment,
            location,
            portalUrl,
            trackingPixelUrl,
          })
        }
        await recordEmailSent()
      }
    } catch (err) {
      console.error('[leads] clinic notification email error:', err)
    }

    return NextResponse.json({ success: true, leadId: lead.id })
  } catch (error) {
    console.error('[leads] submission error:', error)
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 })
  }
}
