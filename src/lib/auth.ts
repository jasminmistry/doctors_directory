import crypto from 'crypto'

/**
 * Central fetch wrapper for all Consentz API calls.
 * TLS verification is controlled by NODE_TLS_REJECT_UNAUTHORIZED in the environment
 * (set to '0' in .env.local when Consentz dev uses a self-signed cert).
 */
export function consentzFetch(url: string, init: RequestInit): Promise<Response> {
  return fetch(url, init)
}

export const COOKIE_TOKEN = 'consentz_token'
export const COOKIE_REFRESH = 'consentz_refresh_token'
// Stores the Consentz username so portal API routes can resolve the user's entity.
// Set at login alongside the session token — both cookies are httpOnly and
// were set together by our server, so presence of both is sufficient proof.
export const COOKIE_USERNAME = 'consentz_username'
// 'admin' | 'portal' — set at login to restrict route access in middleware.
export const COOKIE_ROLE = 'consentz_role'

export const COOKIE_PATH = '/directory'

export const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: COOKIE_PATH,
}


export function getConsentzAuthUrl(): string {
  const url = process.env.CONSENTZ_AUTH_API_URL
  if (!url) throw new Error('CONSENTZ_AUTH_API_URL is not configured')
  return url
}

export function getApplicationId(): string {
  return process.env.CONSENTZ_APPLICATION_ID || 'admin'
}

// Extract tokens from Consentz response — shape: { user: { sessionToken, refreshToken } }
export function extractTokens(data: Record<string, any>) {
  return {
    token: data.user.sessionToken as string,
    refreshToken: data.user.refreshToken as string,
  }
}

export function generateTempPassword(): string {
  return crypto.randomBytes(9).toString('base64url')
}

export function splitName(fullName: string): { firstName: string; lastName: string } {
  const stripped = fullName.trim().replace(/^(Dr|Mr|Mrs|Ms|Prof|Miss)\.?\s+/i, '')
  const parts = stripped.split(/\s+/)
  return {
    firstName: parts[0] ?? fullName.trim(),
    lastName: parts.slice(1).join(' ') || parts[0] || fullName.trim(),
  }
}

export async function refreshConsentzToken(
  refreshToken: string,
): Promise<{ token: string; refreshToken: string } | null> {
  try {
    const authApiUrl = getConsentzAuthUrl()
    const res = await consentzFetch(`${authApiUrl}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-APPLICATION-ID': getApplicationId(),
      },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return null
    const data = await res.json()
    // Refresh endpoint returns tokens at the top level (not nested under `user`)
    const token: string = data.sessionToken ?? data.user?.sessionToken
    const newRefreshToken: string = data.refreshToken ?? data.user?.refreshToken
    if (!token) return null
    return { token, refreshToken: newRefreshToken }
  } catch {
    return null
  }
}

export async function registerConsentzClinic(
  data: {
    name: string
    email: string
    phone?: string | null
    contactName?: string
  },
  authToken?: string,
): Promise<{ id: number; name: string; email: string }> {
  console.log(authToken )
  const authApiUrl = getConsentzAuthUrl()
  console.log(JSON.stringify({
      name: data.name,
      email: data.email,
      timezone: 'Europe/London',
      currency: 'GBP',
      ...(data.phone ? { phone: data.phone } : {}),
      ...(data.contactName ? { contactName: data.contactName } : {}),
    }));
  console.log(`Registering clinic "${data.name}" with Consentz at ${authApiUrl}/register/clinic...`)
  const res = await consentzFetch(`${authApiUrl}/register/clinic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-APPLICATION-ID': getApplicationId(),
      ...(authToken ? { 'X-SESSION-TOKEN': `${authToken}` } : {}),
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      timezone: 'Europe/London',
      currency: 'GBP',
      ...(data.phone ? { phone: data.phone } : {}),
      ...(data.contactName ? { contactName: data.contactName } : {}),
    }),
  })

  const json: Record<string, any> = await res.json().catch(() => ({}))
  if (res.status === 409 && json.clinic?.id) {
    return json.clinic as { id: number; name: string; email: string }
  }
  if (!res.ok) {
    throw Object.assign(new Error(`Consentz clinic registration failed ${res.status}`), { status: res.status, data: json })
  }
  return json.clinic as { id: number; name: string; email: string }
}

export async function registerConsentzPractitioner(
  data: {
    clinicId: number
    firstName: string
    lastName: string
    email: string
    password: string
  },
  authToken?: string,
): Promise<{ id: number; username: string; email: string }> {
  const authApiUrl = getConsentzAuthUrl()
  const res = await consentzFetch(`${authApiUrl}/register/practitioner`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-APPLICATION-ID': getApplicationId(),
      ...(authToken ? { 'X-SESSION-TOKEN': `${authToken}` } : {}),
    },
    body: JSON.stringify(data),
  })

  const json: Record<string, any> = await res.json().catch(() => ({}))
  if (res.status === 409 && json.practitioner?.id) {
    return json.practitioner as { id: number; username: string; email: string }
  }
  if (!res.ok) {
    throw Object.assign(new Error(`Consentz practitioner registration failed ${res.status}`), { status: res.status, data: json })
  }
  return json.practitioner as { id: number; username: string; email: string }
}
