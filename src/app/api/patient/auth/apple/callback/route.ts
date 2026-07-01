export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { decodeOAuthState, verifyAppleToken, buildAppleClientSecret } from '@/lib/oauth'
import { prisma } from '@/lib/db'
import { setPatientCookie } from '@/lib/patient-auth'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
const CALLBACK = `${BASE_URL}/directory/api/patient/auth/apple/callback`

export async function POST(req: NextRequest) {
  const redirectError = (msg: string) => {
    const url = new URL('/directory/account/login', BASE_URL)
    url.searchParams.set('error', msg)
    return NextResponse.redirect(url, { status: 303 })
  }

  try {
    const body = await req.text()
    const params = new URLSearchParams(body)
    const idToken = params.get('id_token')
    const encodedState = params.get('state')
    const userJson = params.get('user')

    const storedState = req.cookies.get('apple_oauth_state')?.value
    const storedNonce = req.cookies.get('apple_oauth_nonce')?.value

    if (!idToken || !encodedState || !storedState || !storedNonce) return redirectError('oauth_failed')

    const decoded = decodeOAuthState(encodedState)
    if (!decoded || decoded.s !== storedState) return redirectError('state_mismatch')

    const claims = await verifyAppleToken(idToken, storedNonce)
    const sub = claims.sub
    const email = claims.email?.toLowerCase()

    let firstName: string | null = null
    let lastName: string | null = null
    if (userJson) {
      try {
        const u = JSON.parse(userJson) as { name?: { firstName?: string; lastName?: string } }
        firstName = u.name?.firstName ?? null
        lastName = u.name?.lastName ?? null
      } catch { /* Apple sends user only on first login */ }
    }

    const patient = await prisma.$transaction(async (tx) => {
      const existing = await tx.patientOAuthAccount.findUnique({
        where: { provider_providerAccountId: { provider: 'apple', providerAccountId: sub } },
        include: { patient: true },
      })
      if (existing) {
        await tx.patient.update({ where: { id: existing.patientId }, data: { emailVerified: true } })
        return existing.patient
      }

      const createData: Parameters<typeof tx.patient.upsert>[0]['create'] = {
        email: email ?? `apple.${sub}@private.consentz.com`,
        emailVerified: true,
        firstName,
        lastName,
      }
      const p = email
        ? await tx.patient.upsert({
            where: { email },
            update: { emailVerified: true, firstName: firstName ?? undefined, lastName: lastName ?? undefined },
            create: createData,
          })
        : await tx.patient.create({ data: createData })

      await tx.patientOAuthAccount.create({
        data: { patientId: p.id, provider: 'apple', providerAccountId: sub, email: email ?? null },
      })
      return p
    })

    // Exchange code for token (required by Apple even if we don't use it)
    const clientSecret = buildAppleClientSecret()
    const code = params.get('code')
    if (code) {
      await fetch('https://appleid.apple.com/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.APPLE_CLIENT_ID ?? '',
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: CALLBACK,
        }),
      }).catch(() => null)
    }

    const next = decoded.n ?? '/account'
    const destination = next.startsWith('/') ? `${BASE_URL}/directory${next}` : next
    const res = NextResponse.redirect(destination, { status: 303 })
    res.cookies.delete('apple_oauth_state')
    res.cookies.delete('apple_oauth_nonce')
    setPatientCookie(res, { id: patient.id, email: patient.email })
    return res
  } catch (err) {
    console.error('apple callback error', err)
    return redirectError('server_error')
  }
}
