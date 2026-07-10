import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getPatientClaims } from '@/lib/patient-auth'
import { domainHasMailServer } from '@/lib/email-domain-check'
import { sendGhostLeadHook, sendLeadNotificationEmail, sendPplLeadTeaserEmail } from '@/lib/email'

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/

const schema = z.object({
  clinicSlug: z.string().trim().min(1),
  firstName: z.string().trim().min(1, 'First name is required.').max(100),
  lastName: z.string().trim().min(1, 'Last name is required.').max(100),
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Please check the form and try again.'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { clinicSlug, firstName, lastName, email, phone, treatment, dateOfBirth, location, source } = parsed.data

    const cleanPhone = phone ? phone.replace(/\s/g, '') : ''
    if (phone && !UK_PHONE_RE.test(cleanPhone)) {
      return NextResponse.json({ error: 'Please enter a valid UK phone number.' }, { status: 400 })
    }

    if (dateOfBirth && !isOver18(dateOfBirth)) {
      return NextResponse.json({ error: 'You must be 18 or over to use this service.' }, { status: 400 })
    }

    if (!(await domainHasMailServer(email))) {
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
    const claims = getPatientClaims(req)
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
        patientEmail: email,
        treatment,
        location,
        isGhostLead,
        ...(source ? { source } : {}),
        ...(patientId ? { patientId } : {}),
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

    if (isGhostLead) {
      if (clinic.email) {
        const pendingCount = await prisma.consultationLead.count({
          where: { clinicId: clinic.id, isGhostLead: true, isUnlocked: false },
        })
        sendGhostLeadHook({
          to: clinic.email,
          clinicName: clinic.name ?? clinicSlug,
          patientFirstName: firstName,
          location: location ?? '',
          pendingCount,
          claimUrl: `${baseUrl}/directory/claim/${clinicSlug}`,
        }).catch((err) => console.error('[leads] ghost hook email error:', err))
      }
    } else if (clinic.email) {
      const portalUrl = `${baseUrl}/directory/portal/clinic/prospects`
      if (clinic.claimedPlan === 'subscription') {
        sendLeadNotificationEmail({
          to: clinic.email,
          clinicName: clinic.name ?? clinicSlug,
          patientName,
          contact: email,
          treatment,
          location,
          portalUrl,
        }).catch((err) => console.error('[leads] notification email error:', err))
      } else {
        sendPplLeadTeaserEmail({
          to: clinic.email,
          clinicName: clinic.name ?? clinicSlug,
          treatment,
          location,
          portalUrl,
        }).catch((err) => console.error('[leads] ppl teaser email error:', err))
      }
    }

    return NextResponse.json({ success: true, leadId: lead.id })
  } catch (error) {
    console.error('[leads] submission error:', error)
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 })
  }
}
