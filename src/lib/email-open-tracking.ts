import crypto from 'crypto'

const SECRET = process.env.EMAIL_TRACKING_SECRET ?? 'email-tracking-dev-secret-change-in-prod'

export type EmailTrackingKind = 'lead' | 'campaign'

interface EmailTrackingClaims {
  kind: EmailTrackingKind
  id: number
}

export function signEmailTrackingToken(kind: EmailTrackingKind, id: number): string {
  const data = Buffer.from(JSON.stringify({ kind, id } satisfies EmailTrackingClaims)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifyEmailTrackingToken(token: string): EmailTrackingClaims | null {
  const dot = token.lastIndexOf('.')
  if (dot === -1) return null
  const data = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  try {
    if (sig.length !== expected.length) return null
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  } catch {
    return null
  }
  try {
    const claims = JSON.parse(Buffer.from(data, 'base64url').toString()) as EmailTrackingClaims
    if (claims.kind !== 'lead' && claims.kind !== 'campaign') return null
    if (typeof claims.id !== 'number' || !Number.isInteger(claims.id)) return null
    return claims
  } catch {
    return null
  }
}
