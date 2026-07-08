import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { domainHasMailServer } from '@/lib/email-domain-check'

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/

const schema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name.').max(255),
  email: z.string().trim().min(1, 'Email is required.').email('Please enter a valid email address.').max(255),
  phone: z.string().trim().max(50).optional()
    .refine((v) => !v || UK_PHONE_RE.test(v.replace(/\s/g, '')), 'Please enter a valid UK phone number.'),
  profession: z.string().trim().min(2, 'Profession is required.').max(255),
  clinicName: z.string().trim().max(255).optional(),
  city: z.string().trim().min(2, 'City is required.').max(120),
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

    await prisma.pendingPractitioner.create({
      data: { submittedData: JSON.stringify(parsed.data) },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[register/practitioner]', err)
    return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 })
  }
}
