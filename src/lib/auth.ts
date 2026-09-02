import crypto from 'crypto'

export const COOKIE_TOKEN = 'consentz_token'
export const COOKIE_REFRESH = 'consentz_refresh_token'
export const COOKIE_USERNAME = 'consentz_username'
export const COOKIE_ROLE = 'consentz_role'
export const COOKIE_ACTIVE_CLINIC = 'consentz_active_clinic_id'
export const COOKIE_PATH = '/directory'

export const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: COOKIE_PATH,
  maxAge: 7 * 24 * 60 * 60, // 7 days
}

export function clearPortalCookies(res: { cookies: { set: (name: string, value: string, opts: { path: string; maxAge: number }) => void } }): void {
  res.cookies.set(COOKIE_TOKEN, '', { path: COOKIE_PATH, maxAge: 0 })
  res.cookies.set(COOKIE_REFRESH, '', { path: COOKIE_PATH, maxAge: 0 })
  res.cookies.set(COOKIE_USERNAME, '', { path: COOKIE_PATH, maxAge: 0 })
  res.cookies.set(COOKIE_ROLE, '', { path: COOKIE_PATH, maxAge: 0 })
  res.cookies.set(COOKIE_ACTIVE_CLINIC, '', { path: COOKIE_PATH, maxAge: 0 })
}

export function getConsentzAuthUrl(): string {
  const url = process.env.CONSENTZ_AUTH_API_URL
  if (!url) throw new Error('CONSENTZ_AUTH_API_URL is not configured')
  return url.replace(/\/$/, '')
}

export function getConsentzV1Url(): string {
  return `${new URL(getConsentzAuthUrl()).origin}/api/v1`
}

export function getApplicationId(): string {
  return process.env.CONSENTZ_APPLICATION_ID || 'admin'
}

/**
 * Consentz has no role that maps to "directory admin team member" — ROLE_SUPER_CLINIC_ADMIN
 * is a per-clinic owner role shared by hundreds of real clinics, not a platform-admin role.
 * So directory admin access is gated by an explicit username allowlist instead.
 */
export function isAdminUsername(username: string): boolean {
  const allowlist = (process.env.ADMIN_USERNAMES || '')
    .split(',')
    .map((u) => u.trim().toLowerCase())
    .filter(Boolean)
  return allowlist.includes(username.trim().toLowerCase())
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
    cache: 'no-store',
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
  return fetch(url, { ...init, cache: 'no-store' })
}

/**
 * Consentz's API error handler (ExceptionListener::onKernelException) currently
 * returns HTTP 200 for every application-level error — the real status only shows
 * up as `error.code` in the JSON body. So `res.ok`/`res.status` alone cannot be
 * trusted to detect a failed call; every Consentz response body must also be
 * checked for an `error` envelope. See CONSENTZ_AUTH_API_URL callers below.
 */
export function extractApiErrorCode(json: Record<string, unknown>): number | undefined {
  const error = json.error as Record<string, unknown> | undefined
  return typeof error?.code === 'number' ? error.code : undefined
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
    /** First-touch attribution — which directory surface this sign-up came from. */
    source?: string | null
    sourceLandingPage?: string | null
    sourceReferrer?: string | null
    sourceUtm?: { source?: string | null; medium?: string | null; campaign?: string | null } | null
  },
  sessionToken?: string,
): Promise<{ id: number; name: string; email: string; isNew: boolean }> {
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
      ...(data.source ? { source: data.source } : {}),
      ...(data.sourceLandingPage ? { sourceLandingPage: data.sourceLandingPage } : {}),
      ...(data.sourceReferrer ? { sourceReferrer: data.sourceReferrer } : {}),
      ...(data.sourceUtm && (data.sourceUtm.source || data.sourceUtm.medium || data.sourceUtm.campaign)
        ? { sourceUtm: data.sourceUtm }
        : {}),
    },
  })

  const json: Record<string, unknown> = await res.json().catch(() => ({}))
  const errorCode = extractApiErrorCode(json)
  if ((res.status === 409 || errorCode === 409) && (json.clinic as Record<string, unknown>)?.id) {
    return { ...(json.clinic as { id: number; name: string; email: string }), isNew: false }
  }
  if (!res.ok || errorCode !== undefined || !(json.clinic as Record<string, unknown>)?.id) {
    const status = errorCode ?? res.status
    throw Object.assign(new Error(`Consentz clinic registration failed ${status}`), { status, data: json })
  }
  return { ...(json.clinic as { id: number; name: string; email: string }), isNew: true }
}

export async function registerConsentzPractitioner(
  data: {
    clinicId: number
    firstName: string
    lastName: string
    email: string
    password: string
    role: 'ROLE_PRACTITIONER' | 'ROLE_CLINIC_ADMIN'
  },
  sessionToken?: string,
): Promise<{ id: number; username: string; email: string; isNew: boolean }> {
  const res = await consentzApi('/register/practitioner', {
    method: 'POST',
    sessionToken,
    body: data,
  })

  const json: Record<string, unknown> = await res.json().catch(() => ({}))
  const errorCode = extractApiErrorCode(json)
  if ((res.status === 409 || errorCode === 409) && (json.practitioner as Record<string, unknown>)?.id) {
    return { ...(json.practitioner as { id: number; username: string; email: string }), isNew: false }
  }
  if (!res.ok || errorCode !== undefined || !(json.practitioner as Record<string, unknown>)?.id) {
    const status = errorCode ?? res.status
    throw Object.assign(new Error(`Consentz practitioner registration failed ${status}`), { status, data: json })
  }
  return { ...(json.practitioner as { id: number; username: string; email: string }), isNew: true }
}
