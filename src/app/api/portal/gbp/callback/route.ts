import { NextRequest, NextResponse } from 'next/server'
import { decodeOAuthState } from '@/lib/oauth'
import { prisma } from '@/lib/db'
import { guardGbpPortal } from '@/lib/gbp/portal-guard'
import { exchangeCode, fetchGoogleEmail } from '@/lib/gbp/oauth'
import { encryptToken } from '@/lib/gbp/crypto'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
const back = (q: string) => NextResponse.redirect(`${BASE_URL}/directory/portal/clinic/google?${q}`)

export async function GET(req: NextRequest) {
  const guard = await guardGbpPortal()
  if (!guard.ok) return guard.response

  const code = req.nextUrl.searchParams.get('code')
  const stateParam = req.nextUrl.searchParams.get('state')
  const oauthError = req.nextUrl.searchParams.get('error')
  const storedState = req.cookies.get('gbp_oauth_state')?.value

  if (oauthError) return back(`gbp_error=${encodeURIComponent(oauthError)}`)
  if (!code || !stateParam || !storedState) return back('gbp_error=state_missing')

  const decoded = decodeOAuthState(stateParam)
  if (!decoded || decoded.s !== storedState) return back('gbp_error=state_mismatch')

  try {
    const tokens = await exchangeCode(code)
    if (!tokens.refreshToken) {
      // Google only returns a refresh token on the first consent; force re-consent.
      return back('gbp_error=no_refresh_token')
    }
    const enc = encryptToken(tokens.refreshToken)
    const email = await fetchGoogleEmail(tokens.accessToken)

    await prisma.gbpConnection.upsert({
      where: { clinicId: guard.clinicId },
      create: {
        clinicId: guard.clinicId,
        accessToken: tokens.accessToken,
        accessTokenExpiresAt: new Date(Date.now() + (tokens.expiresInSec - 300) * 1000),
        refreshTokenCipher: enc.cipher,
        refreshTokenIv: enc.iv,
        refreshTokenTag: enc.tag,
        scope: tokens.scope,
        googleEmail: email,
        status: 'pending_location',
      },
      update: {
        accessToken: tokens.accessToken,
        accessTokenExpiresAt: new Date(Date.now() + (tokens.expiresInSec - 300) * 1000),
        refreshTokenCipher: enc.cipher,
        refreshTokenIv: enc.iv,
        refreshTokenTag: enc.tag,
        scope: tokens.scope,
        googleEmail: email,
        status: 'pending_location',
        lastSyncError: null,
      },
    })

    const res = back('connected=1')
    res.cookies.set('gbp_oauth_state', '', { path: '/directory', maxAge: 0 })
    return res
  } catch (err) {
    console.error('[gbp/callback] failed:', err)
    return back('gbp_error=exchange_failed')
  }
}
