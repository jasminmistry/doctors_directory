import crypto from 'crypto'

export const COOKIE_TOKEN = 'consentz_token'
export const COOKIE_REFRESH = 'consentz_refresh_token'
export const COOKIE_USERNAME = 'consentz_username'
export const COOKIE_ROLE = 'consentz_role'
export const COOKIE_PATH = '/directory'

export const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: COOKIE_PATH,
}

export function getConsentzAuthUrl(): string {
  const url = process.env.CONSENTZ_AUTH_API_URL
  if (!url) throw new Error('CONSENTZ_AUTH_API_URL is not configured')
  return url.replace(/\/$/, '')
}

export function getApplicationId(): string {
  return process.env.CONSENTZ_APPLICATION_ID || 'admin'
}

/**
 * Central fetch wrapper for every Consentz API call.
 * Automatically injects Content-Type, X-APPLICATION-ID, and (when provided) X-SESSION-TOKEN.
 * Callers pass a path relative to CONSENTZ_AUTH_API_URL, e.g. "/login".
 */
export async function consentzApi(
  path: string,
  options: {
    method?: string
    body?: unknown
    sessionToken?: string
    extraHeaders?: Record<string, string>
  } = {},
): Promise<Response> {
  const base = getConsentzAuthUrl()
  const { method = 'GET', body, sessionToken, extraHeaders } = options

  return fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-APPLICATION-ID': getApplicationId(),
      ...(sessionToken ? { 'X-SESSION-TOKEN': sessionToken } : {}),
      ...extraHeaders,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
}

/** Legacy alias kept for callers that pass a full URL — wraps fetch unchanged. */
export function consentzFetch(url: string, init: RequestInit): Promise<Response> {
  return fetch(url, init)
}

export function extractTokens(data: Record<string, unknown>) {
  const user = data.user as Record<string, unknown>
  return {
    token: user.sessionToken as string,
    refreshToken: user.refreshToken as string,
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
    const res = await consentzApi('/refresh-token', {
      method: 'POST',
      body: { refreshToken },
    })
    if (!res.ok) return null
    const data = await res.json()
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
  sessionToken?: string,
): Promise<{ id: number; name: string; email: string }> {
  const res = await consentzApi('/register/clinic', {
    method: 'POST',
    sessionToken,
    body: {
      name: data.name,
      email: data.email,
      timezone: 'Europe/London',
      currency: 'GBP',
      ...(data.phone ? { phone: data.phone } : {}),
      ...(data.contactName ? { contactName: data.contactName } : {}),
    },
  })

  const json: Record<string, unknown> = await res.json().catch(() => ({}))
  if (res.status === 409 && (json.clinic as Record<string, unknown>)?.id) {
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
  sessionToken?: string,
): Promise<{ id: number; username: string; email: string }> {
  const res = await consentzApi('/register/practitioner', {
    method: 'POST',
    sessionToken,
    body: data,
  })

  const json: Record<string, unknown> = await res.json().catch(() => ({}))
  if (res.status === 409 && (json.practitioner as Record<string, unknown>)?.id) {
    return json.practitioner as { id: number; username: string; email: string }
  }
  if (!res.ok) {
    throw Object.assign(new Error(`Consentz practitioner registration failed ${res.status}`), { status: res.status, data: json })
  }
  return json.practitioner as { id: number; username: string; email: string }
}
