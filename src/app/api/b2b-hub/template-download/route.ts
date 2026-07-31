export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { domainHasMailServer } from '@/lib/email-domain-check'
import { sendTemplateDownloadRequestEmail } from '@/lib/email'

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/

const templateDownloadSchema = z.object({
  clinicName: z.string().trim().min(2, 'Clinic Name is required.'),
  contactName: z.string().trim().min(2, 'Please enter your full name.'),
  email: z.string().trim().min(1, 'Business Email is required.').email('Please enter a valid email address.'),
  phone: z.string().trim().min(1, 'Phone Number is required.')
    .refine((v) => UK_PHONE_RE.test(v.replace(/\s/g, '')), 'Please enter a valid UK phone number.'),
  address: z.string().trim().min(2, 'Address is required.'),
  city: z.string().trim().min(2, 'City is required.'),
  website: z.string().trim().url('Enter a valid URL').optional().or(z.literal('')),
  category: z.string().trim().optional(),
  about: z.string().trim().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = templateDownloadSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Please check the form and try again.'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const data = parsed.data

    if (!(await domainHasMailServer(data.email))) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    await sendTemplateDownloadRequestEmail({
      clinicName: data.clinicName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      website: data.website || undefined,
      category: data.category || undefined,
      templateTitle: data.about,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Template download request error:', error)
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
  }
}
