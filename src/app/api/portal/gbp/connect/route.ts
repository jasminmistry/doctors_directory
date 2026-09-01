import { NextResponse } from 'next/server'
import { generateState, encodeOAuthState } from '@/lib/oauth'
import { guardGbpPortal } from '@/lib/gbp/portal-guard'
import { GBP_ENABLED, isGbpOAuthConfigured } from '@/lib/gbp/config'
import { buildAuthUrl } from '@/lib/gbp/oauth'
import { isGbpCryptoConfigured } from '@/lib/gbp/crypto'
import { GBP_MOCK } from '@/lib/gbp/config'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

export async function GET() {
  const guard = await guardGbpPortal()
  if (!guard.ok) return guard.response

  if (!GBP_ENABLED || !isGbpOAuthConfigured() || (!GBP_MOCK && !isGbpCryptoConfigured())) {
    return NextResponse.redirect(`${BASE_URL}/directory/portal/clinic/google?gbp_error=not_configured`)
  }

  const state = generateState()
  const encoded = encodeOAuthState(state, '/portal/clinic/google')
  const res = NextResponse.redirect(buildAuthUrl(encoded))
  res.cookies.set('gbp_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/directory',
    maxAge: 600,
  })
  return res
}
