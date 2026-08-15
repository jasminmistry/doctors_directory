import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { domainHasMailServer } from '@/lib/email-domain-check'
import { sendMagicLinkEmail } from '@/lib/email'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

const magicLinkSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.'),
  next: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = magicLinkSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
    const { email, next } = parsed.data
    const normalised = email.trim().toLowerCase()

    if (!(await domainHasMailServer(normalised))) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    // Invalidate any previously issued, still-outstanding links for this email —
    // only the most recently generated link should be usable.
    await prisma.patientMagicLink.updateMany({
      where: { email: normalised, usedAt: null },
      data: { usedAt: new Date() },
    })

    await prisma.patientMagicLink.create({
      data: { tokenHash, email: normalised, expiresAt, next: next ?? null },
    })

    const verifyUrl = new URL('/directory/api/patient/auth/magic-link/verify', BASE_URL)
    verifyUrl.searchParams.set('token', rawToken)
    if (next) verifyUrl.searchParams.set('next', next)

    await sendMagicLinkEmail({ to: normalised, magicLink: verifyUrl.toString() })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('magic-link POST error', err)
    return NextResponse.json({ ok: true }) // never reveal internal errors
  }
}
