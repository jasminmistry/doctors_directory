import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { sendGhostLeadHook, sendLeadNotificationEmail, sendPplLeadTeaserEmail } from '@/lib/email'

const schema = z.object({
  clinicSlug: z.string().min(1),
  patientName: z.string().min(1).max(200),
  contact: z.string().min(1).max(255), // email or phone — auto-detected
  treatment: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
})

function parseContact(contact: string) {
  const isEmail = contact.includes('@')
  return {
    patientEmail: isEmail ? contact : undefined,
    patientPhone: isEmail ? '' : contact,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { clinicSlug, patientName, contact, treatment, location } = parsed.data
    const { patientEmail, patientPhone } = parseContact(contact)

    const clinic = await prisma.clinic.findUnique({
      where: { slug: clinicSlug },
      select: { id: true, name: true, claimed: true, claimedPlan: true, email: true, gmapsPhone: true },
    })

    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }

    const isGhostLead = !clinic.claimed

    const lead = await prisma.consultationLead.create({
      data: {
        clinicId: clinic.id,
        patientName,
        patientPhone,
        patientEmail,
        treatment,
        location,
        isGhostLead,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

    if (isGhostLead) {
      // FOMO email for unclaimed clinics
      if (clinic.email) {
        const pendingCount = await prisma.consultationLead.count({
          where: { clinicId: clinic.id, isGhostLead: true, isUnlocked: false },
        })
        sendGhostLeadHook({
          to: clinic.email,
          clinicName: clinic.name ?? clinicSlug,
          patientFirstName: patientName.split(' ')[0],
          location: location ?? '',
          pendingCount,
          claimUrl: `${baseUrl}/directory/claim/${clinicSlug}`,
        }).catch((err) => console.error('[leads] ghost hook email error:', err))
      }
    } else if (clinic.email) {
      const portalUrl = `${baseUrl}/directory/portal/clinic/prospects`
      if (clinic.claimedPlan === 'subscription') {
        // Subscription: full details in email — leads are instant access
        sendLeadNotificationEmail({
          to: clinic.email,
          clinicName: clinic.name ?? clinicSlug,
          patientName,
          contact,
          treatment,
          location,
          portalUrl,
        }).catch((err) => console.error('[leads] notification email error:', err))
      } else {
        // PPL (or free): teaser only — no patient PII until they pay to unlock
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
