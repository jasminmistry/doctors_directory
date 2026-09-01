import { prisma } from '@/lib/db'
import { decryptToken } from '@/lib/gbp/crypto'
import { refreshAccessToken } from '@/lib/gbp/oauth'
import { GBP_MOCK } from '@/lib/gbp/config'
import { mockDispatch } from '@/lib/gbp/mock'

// Per-connection access-token manager + authed fetch. Mirrors the refresh-then-persist
// pattern in src/lib/patient-consentz.ts (getConsentzToken).

export class GbpReauthError extends Error {
  constructor(message = 'Google connection needs to be re-authorised') {
    super(message)
    this.name = 'GbpReauthError'
  }
}

export class GbpApiError extends Error {
  status: number
  body: string
  constructor(status: number, body: string) {
    super(`GBP API error ${status}: ${body.slice(0, 300)}`)
    this.name = 'GbpApiError'
    this.status = status
    this.body = body
  }
}

const EXPIRY_BUFFER_MS = 60_000

export async function getGbpAccessToken(connectionId: number): Promise<string> {
  const conn = await prisma.gbpConnection.findUnique({ where: { id: connectionId } })
  if (!conn) throw new Error(`GbpConnection ${connectionId} not found`)
  if (conn.status === 'needs_reauth' || conn.status === 'revoked') throw new GbpReauthError()

  if (
    conn.accessToken &&
    conn.accessTokenExpiresAt &&
    conn.accessTokenExpiresAt.getTime() - Date.now() > EXPIRY_BUFFER_MS
  ) {
    return conn.accessToken
  }

  if (GBP_MOCK) {
    const token = 'mock-access-token'
    await prisma.gbpConnection.update({
      where: { id: connectionId },
      data: { accessToken: token, accessTokenExpiresAt: new Date(Date.now() + 3600_000) },
    })
    return token
  }

  if (!conn.refreshTokenCipher || !conn.refreshTokenIv || !conn.refreshTokenTag) {
    await markReauth(connectionId)
    throw new GbpReauthError()
  }

  let refreshToken: string
  try {
    refreshToken = decryptToken({
      cipher: conn.refreshTokenCipher,
      iv: conn.refreshTokenIv,
      tag: conn.refreshTokenTag,
    })
  } catch {
    await markReauth(connectionId)
    throw new GbpReauthError('Stored Google credentials could not be read')
  }

  try {
    const { accessToken, expiresInSec } = await refreshAccessToken(refreshToken)
    await prisma.gbpConnection.update({
      where: { id: connectionId },
      data: {
        accessToken,
        accessTokenExpiresAt: new Date(Date.now() + (expiresInSec - 300) * 1000),
      },
    })
    return accessToken
  } catch (err) {
    if ((err as { invalidGrant?: boolean }).invalidGrant) {
      await markReauth(connectionId)
      throw new GbpReauthError()
    }
    throw err
  }
}

async function markReauth(connectionId: number) {
  await prisma.gbpConnection
    .update({ where: { id: connectionId }, data: { status: 'needs_reauth' } })
    .catch(() => {})
}

/** Authenticated fetch against a Google API, with one automatic retry on 401. */
export async function gbpFetch(
  connectionId: number,
  url: string,
  init: RequestInit = {},
): Promise<unknown> {
  const doFetch = async (token: string) => {
    if (GBP_MOCK) return mockDispatch(url, init)
    return fetch(url, {
      ...init,
      cache: 'no-store',
      headers: {
        ...(init.headers ?? {}),
        Authorization: `Bearer ${token}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
    })
  }

  let token = await getGbpAccessToken(connectionId)
  let res = await doFetch(token)

  if (res.status === 401) {
    await prisma.gbpConnection.update({
      where: { id: connectionId },
      data: { accessTokenExpiresAt: new Date(0) },
    })
    token = await getGbpAccessToken(connectionId)
    res = await doFetch(token)
  }

  const text = await res.text()
  if (!res.ok) throw new GbpApiError(res.status, text)
  return text ? JSON.parse(text) : {}
}
