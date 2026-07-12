import { NextRequest, NextResponse } from 'next/server'
import { decodeOAuthState } from '@/lib/oauth'
import { prisma } from '@/lib/db'
import { setPatientCookie } from '@/lib/patient-auth'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
const CALLBACK = `${BASE_URL}/directory/api/patient/auth/google/callback`

export async function GET(req: NextRequest) {
  const redirectError = (msg: string) => {
    const url = new URL('/directory/account/login', BASE_URL)
    url.searchParams.set('error', msg)
    return NextResponse.redirect(url)
  }

  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const encodedState = searchParams.get('state')
  const storedState = req.cookies.get('oauth_state')?.value

  if (!code || !encodedState || !storedState) return redirectError('oauth_failed')

  const decoded = decodeOAuthState(encodedState)
  if (!decoded || decoded.s !== storedState) return redirectError('state_mismatch')

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID ?? '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        redirect_uri: CALLBACK,
        grant_type: 'authorization_code',
      }),
    })
    if (!tokenRes.ok) return redirectError('token_exchange_failed')
    const tokens = await tokenRes.json() as { access_token: string }

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    if (!profileRes.ok) return redirectError('profile_fetch_failed')
    const profile = await profileRes.json() as { id: string; email: string; given_name?: string; family_name?: string }

    const patient = await prisma.$transaction(async (tx) => {
      let existing = await tx.patientOAuthAccount.findUnique({
        where: { provider_providerAccountId: { provider: 'google', providerAccountId: profile.id } },
        include: { patient: true },
      })
      if (existing) {
        await tx.patient.update({ where: { id: existing.patientId }, data: { emailVerified: true } })
        return existing.patient
      }

      const p = await tx.patient.upsert({
        where: { email: profile.email.toLowerCase() },
        update: { emailVerified: true },
        create: {
          email: profile.email.toLowerCase(),
          firstName: profile.given_name ?? null,
          lastName: profile.family_name ?? null,
          emailVerified: true,
        },
      })
      await tx.patientOAuthAccount.create({
        data: { patientId: p.id, provider: 'google', providerAccountId: profile.id, email: profile.email.toLowerCase() },
      })
      return p
    })

    const next = decoded.n ?? '/account'
    const destination = next.startsWith('/') ? `${BASE_URL}/directory${next}` : next
    const res = NextResponse.redirect(destination)
    res.cookies.delete('oauth_state')
    setPatientCookie(res, { id: patient.id, email: patient.email })
    return res
  } catch (err) {
    console.error('google callback error', err)
    return redirectError('server_error')
  }
}
