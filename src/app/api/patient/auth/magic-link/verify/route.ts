import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { setPatientCookie } from '@/lib/patient-auth'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawToken = searchParams.get('token')
  const next = searchParams.get('next') ?? '/account'

  const redirectError = (msg: string) => {
    const url = new URL('/directory/account/login', BASE_URL)
    url.searchParams.set('error', msg)
    return NextResponse.redirect(url)
  }

  if (!rawToken) return redirectError('invalid_link')

  try {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const link = await prisma.patientMagicLink.findUnique({ where: { tokenHash } })

    if (!link) return redirectError('invalid_link')
    if (link.usedAt) return redirectError('link_used')
    if (link.expiresAt < new Date()) return redirectError('link_expired')

    await prisma.patientMagicLink.update({ where: { id: link.id }, data: { usedAt: new Date() } })

    const patient = await prisma.patient.upsert({
      where: { email: link.email },
      update: { emailVerified: true },
      create: { email: link.email, emailVerified: true },
    })

    const destination = next.startsWith('/') ? `${BASE_URL}/directory${next}` : next
    const res = NextResponse.redirect(destination)
    setPatientCookie(res, { id: patient.id, email: patient.email })
    return res
  } catch (err) {
    console.error('magic-link verify error', err)
    return redirectError('server_error')
  }
}
