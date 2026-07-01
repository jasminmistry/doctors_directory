import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendMagicLinkEmail } from '@/lib/email'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

export async function POST(req: NextRequest) {
  try {
    const { email, next } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalised = email.trim().toLowerCase()
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

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
