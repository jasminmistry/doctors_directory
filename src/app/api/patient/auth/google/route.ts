import { NextRequest, NextResponse } from 'next/server'
import { generateState, encodeOAuthState } from '@/lib/oauth'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
const CALLBACK = `${BASE_URL}/directory/api/patient/auth/google/callback`

export async function GET(req: NextRequest) {
  const next = new URL(req.url).searchParams.get('next') ?? '/account'
  const state = generateState()
  const encoded = encodeOAuthState(state, next)

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID ?? '')
  url.searchParams.set('redirect_uri', CALLBACK)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid email profile')
  url.searchParams.set('state', encoded)
  url.searchParams.set('prompt', 'select_account')

  const res = NextResponse.redirect(url)
  res.cookies.set('oauth_state', state, { httpOnly: true, sameSite: 'lax', maxAge: 600, path: '/directory' })
  return res
}
