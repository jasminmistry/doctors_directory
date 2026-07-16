import { NextRequest, NextResponse } from 'next/server'
import { generateState, encodeOAuthState } from '@/lib/oauth'
import crypto from 'crypto'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
const CALLBACK = `${BASE_URL}/directory/api/patient/auth/apple/callback`

export async function GET(req: NextRequest) {
  const next = new URL(req.url).searchParams.get('next') ?? '/account'
  const state = generateState()
  const nonce = crypto.randomBytes(32).toString('hex')
  const encoded = encodeOAuthState(state, next)

  const url = new URL('https://appleid.apple.com/auth/authorize')
  url.searchParams.set('client_id', process.env.APPLE_CLIENT_ID ?? '')
  url.searchParams.set('redirect_uri', CALLBACK)
  url.searchParams.set('response_type', 'code id_token')
  url.searchParams.set('response_mode', 'form_post')
  url.searchParams.set('scope', 'name email')
  url.searchParams.set('state', encoded)
  url.searchParams.set('nonce', nonce)

  const res = NextResponse.redirect(url)
  res.cookies.set('apple_oauth_state', state, { httpOnly: true, sameSite: 'lax', maxAge: 600, path: '/directory' })
  res.cookies.set('apple_oauth_nonce', nonce, { httpOnly: true, sameSite: 'lax', maxAge: 600, path: '/directory' })
  return res
}
