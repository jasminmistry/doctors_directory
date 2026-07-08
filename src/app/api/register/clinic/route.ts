import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { domainHasMailServer } from '@/lib/email-domain-check'

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/

const schema = z.object({
  clinicName: z.string().trim().min(2, 'Clinic Name is required.').max(255),
  contactName: z.string().trim().min(2, 'Please enter your full name.').max(255),
  email: z.string().trim().min(1, 'Business Email is required.').email('Please enter a valid email address.').max(255),
  phone: z.string().trim().min(6, 'Phone Number is required.').max(50)
    .refine((v) => UK_PHONE_RE.test(v.replace(/\s/g, '')), 'Please enter a valid UK phone number.'),
  address: z.string().trim().min(2, 'Address is required.').max(500),
  city: z.string().trim().min(2, 'City is required.').max(120),
  website: z.string().trim().url().max(500).optional().or(z.literal('')),
  category: z.string().trim().max(100).optional(),
  about: z.string().trim().max(2000).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Please check the form and try again.'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    if (!(await domainHasMailServer(parsed.data.email))) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    await prisma.pendingClinic.create({
      data: { submittedData: JSON.stringify(parsed.data) },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[register/clinic]', err)
    return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 })
  }
}
