import crypto from 'crypto'

/**
 * Signed tokens for the tracked link embedded in lead-notification SMS messages.
 * When the clinic taps the link, `GET /api/track/sms-click/[token]` verifies the
 * token, stamps `notificationSmsReadAt`, and redirects on — this is the SMS
 * analogue of the email open-tracking pixel (see `email-open-tracking.ts`).
 */

const SECRET = process.env.SMS_TRACKING_SECRET ?? 'sms-tracking-dev-secret-change-in-prod'

export type SmsTrackingKind = 'lead'

interface SmsTrackingClaims {
  kind: SmsTrackingKind
  id: number
}

export function signSmsTrackingToken(kind: SmsTrackingKind, id: number): string {
  const data = Buffer.from(JSON.stringify({ kind, id } satisfies SmsTrackingClaims)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifySmsTrackingToken(token: string): SmsTrackingClaims | null {
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
    const claims = JSON.parse(Buffer.from(data, 'base64url').toString()) as SmsTrackingClaims
    if (claims.kind !== 'lead') return null
    if (typeof claims.id !== 'number' || !Number.isInteger(claims.id)) return null
    return claims
  } catch {
    return null
  }
}
