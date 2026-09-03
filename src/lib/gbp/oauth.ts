import { GBP_MOCK, GBP_REDIRECT_URI, GBP_SCOPE, gbpClientId, gbpClientSecret } from '@/lib/gbp/config'

// Google OAuth 2.0 flow for the GBP connector. Native fetch, mirroring
// src/app/api/patient/auth/google/callback/route.ts. Unlike patient login this requests
// offline access (refresh token) and forces the consent prompt.

const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const REVOKE_ENDPOINT = 'https://oauth2.googleapis.com/revoke'
const USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v2/userinfo'

export interface TokenBundle {
  accessToken: string
  refreshToken: string | null
  expiresInSec: number
  scope: string
}

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: gbpClientId(),
    redirect_uri: GBP_REDIRECT_URI,
    response_type: 'code',
    scope: GBP_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  })
  return `${AUTH_ENDPOINT}?${params.toString()}`
}

export async function exchangeCode(code: string): Promise<TokenBundle> {
  if (GBP_MOCK) {
    return { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', expiresInSec: 3600, scope: GBP_SCOPE }
  }
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: gbpClientId(),
      client_secret: gbpClientSecret(),
      redirect_uri: GBP_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) {
    throw new Error(`GBP token exchange failed (${res.status}): ${await res.text()}`)
  }
  const json = (await res.json()) as {
    access_token: string
    refresh_token?: string
    expires_in: number
    scope: string
  }
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? null,
    expiresInSec: json.expires_in,
    scope: json.scope,
  }
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; expiresInSec: number }> {
  if (GBP_MOCK) {
    return { accessToken: 'mock-access-token-refreshed', expiresInSec: 3600 }
  }
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: gbpClientId(),
      client_secret: gbpClientSecret(),
      grant_type: 'refresh_token',
    }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(`GBP token refresh failed (${res.status})`) as Error & { invalidGrant?: boolean }
    err.invalidGrant = (body as { error?: string }).error === 'invalid_grant'
    throw err
  }
  const json = body as { access_token: string; expires_in: number }
  return { accessToken: json.access_token, expiresInSec: json.expires_in }
}

export async function revokeToken(token: string): Promise<void> {
  if (GBP_MOCK || !token) return
  try {
    await fetch(`${REVOKE_ENDPOINT}?token=${encodeURIComponent(token)}`, { method: 'POST' })
  } catch (err) {
    console.error('[gbp/oauth] revoke failed:', err)
  }
}

export async function fetchGoogleEmail(accessToken: string): Promise<string | null> {
  if (GBP_MOCK) return 'clinic-owner@example.com'
  try {
    const res = await fetch(USERINFO_ENDPOINT, { headers: { Authorization: `Bearer ${accessToken}` } })
    if (!res.ok) return null
    const json = (await res.json()) as { email?: string }
    return json.email ?? null
  } catch {
    return null
  }
}
