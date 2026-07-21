export const dynamic = 'force-dynamic'

import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { COOKIE_TOKEN, COOKIE_USERNAME, COOKIE_ROLE, COOKIE_REFRESH, COOKIE_OPTS } from '@/lib/auth'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

interface SsoPayload {
  consentzClinicId:      number
  consentzUserId:        number
  consentzUsername:      string
  consentzSessionToken:  string | null
  consentzRefreshToken:  string | null | undefined
  exp:                   number
}

function getSecret(): string {
  const s = process.env.DIRECTORY_LINK_SECRET
  if (!s) throw new Error('DIRECTORY_LINK_SECRET is not configured')
  return s
}

function validateToken(raw: string): SsoPayload | null {
  const dotIndex = raw.lastIndexOf('.')
  if (dotIndex === -1) return null

  const encoded   = raw.slice(0, dotIndex)
  const signature = raw.slice(dotIndex + 1)

  const expected = crypto.createHmac('sha256', getSecret()).update(encoded).digest('hex')
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null
  }

  let payload: SsoPayload
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'))
  } catch {
    return null
  }

  if (!payload.exp || Date.now() / 1000 > payload.exp) return null

  return payload
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawToken = searchParams.get('token')

  const loginUrl = '/directory/portal/login'

  if (!rawToken) {
    return NextResponse.redirect(new URL(loginUrl, BASE_URL))
  }

  let payload: SsoPayload | null
  try {
    payload = validateToken(rawToken)
  } catch {
    return NextResponse.redirect(new URL(loginUrl, BASE_URL))
  }

  if (!payload) {
    return NextResponse.redirect(new URL(`${loginUrl}?error=invalid_sso`, BASE_URL))
  }

  // Find a ClaimRequest linked to this Consentz clinic
  const claim = await prisma.claimRequest.findFirst({
    where: {
      consentzClinicId: payload.consentzClinicId,
      status: { in: ['approved', 'pending_approval'] },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!claim) {
    return NextResponse.redirect(new URL(`${loginUrl}?error=not_linked`, BASE_URL))
  }

  if (claim.status === 'pending_approval') {
    return NextResponse.redirect(new URL(`${loginUrl}?error=pending_approval`, BASE_URL))
  }

  // Verify the SSO token's username matches the one stored on the claim to prevent a different
  // Consentz user at the same clinic from hijacking the portal session.
  if (claim.consentzUsername && claim.consentzUsername !== payload.consentzUsername) {
    return NextResponse.redirect(new URL(`${loginUrl}?error=username_mismatch`, BASE_URL))
  }

  const response = NextResponse.redirect(new URL('/directory/portal/clinic', BASE_URL))

  response.cookies.set(COOKIE_USERNAME, payload.consentzUsername, COOKIE_OPTS)
  response.cookies.set(COOKIE_ROLE, 'portal', COOKIE_OPTS)
  if (payload.consentzSessionToken) {
    response.cookies.set(COOKIE_TOKEN, payload.consentzSessionToken, COOKIE_OPTS)
  }
  if (payload.consentzRefreshToken) {
    response.cookies.set(COOKIE_REFRESH, payload.consentzRefreshToken, COOKIE_OPTS)
  }

  return response
}
