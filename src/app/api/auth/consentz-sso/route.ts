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
  consentzReturnTo?:     string | null
  exp:                   number
}

/**
 * Only allow same-origin, path-only redirects (must start with a single "/", never "//" —
 * that's protocol-relative and would send the session cookies to an attacker-controlled host).
 */
function sanitizeReturnTo(returnTo: string | null | undefined): string | null {
  if (!returnTo) return null
  if (!returnTo.startsWith('/') || returnTo.startsWith('//')) return null
  return returnTo
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
  const sigBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expected)
  // timingSafeEqual throws (rather than returning false) when the buffers differ in length,
  // e.g. a truncated/garbled signature — treat that the same as a mismatch, not an error.
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    console.error('consentz-sso: signature mismatch')
    return null
  }

  let payload: SsoPayload
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'))
  } catch {
    console.error('consentz-sso: malformed token payload')
    return null
  }

  if (!payload.exp || Date.now() / 1000 > payload.exp) {
    console.error('consentz-sso: token expired', { exp: payload.exp, now: Date.now() / 1000 })
    return null
  }

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
  } catch (err) {
    console.error('consentz-sso: unexpected error validating token', err)
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
    console.error('consentz-sso: no linked claim for consentzClinicId', payload.consentzClinicId)
    return NextResponse.redirect(new URL(`${loginUrl}?error=not_linked`, BASE_URL))
  }

  if (claim.status === 'pending_approval') {
    return NextResponse.redirect(new URL(`${loginUrl}?error=pending_approval`, BASE_URL))
  }

  // Verify the SSO token's username matches the one stored on the claim to prevent a different
  // Consentz user at the same clinic from hijacking the portal session.
  if (claim.consentzUsername && claim.consentzUsername !== payload.consentzUsername) {
    console.error('consentz-sso: username mismatch', {
      claimUsername: claim.consentzUsername,
      tokenUsername: payload.consentzUsername,
    })
    return NextResponse.redirect(new URL(`${loginUrl}?error=username_mismatch`, BASE_URL))
  }

  const landingPath = sanitizeReturnTo(payload.consentzReturnTo) ?? '/directory/portal/clinic'
  const response = NextResponse.redirect(new URL(landingPath, BASE_URL))

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
