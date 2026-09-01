import crypto from 'crypto'

// Per-patient review-collection links. Same token model as PatientMagicLink:
// a random token is handed out; only its SHA-256 hash is stored; links expire and
// are single-use.

const DWELL_SECRET =
  process.env.UNSUBSCRIBE_SECRET ?? 'unsubscribe-dev-secret-change-in-prod'

export const REVIEW_REQUEST_TTL_DAYS = 60

export function generateReviewToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashReviewToken(rawToken)
  return { rawToken, tokenHash }
}

export function hashReviewToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex')
}

export function reviewRequestExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + REVIEW_REQUEST_TTL_DAYS * 24 * 60 * 60 * 1000)
}

// --- Anti-bot dwell-time signature -------------------------------------------------
// The public feedback form embeds a signed render timestamp; the submit handler rejects
// submissions that arrive implausibly fast (bot) or implausibly late (stale/replayed).

export function signDwellToken(issuedAtMs: number = Date.now()): string {
  const data = String(issuedAtMs)
  const sig = crypto.createHmac('sha256', DWELL_SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifyDwellToken(
  token: string,
  opts: { minMs?: number; maxMs?: number } = {},
): boolean {
  const { minMs = 2_000, maxMs = 60 * 60 * 1000 } = opts
  const dot = token.lastIndexOf('.')
  if (dot === -1) return false
  const data = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = crypto.createHmac('sha256', DWELL_SECRET).update(data).digest('base64url')
  try {
    if (sig.length !== expected.length) return false
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false
  } catch {
    return false
  }
  const issuedAt = Number(data)
  if (!Number.isFinite(issuedAt)) return false
  const elapsed = Date.now() - issuedAt
  return elapsed >= minMs && elapsed <= maxMs
}

export function hashIp(ip: string): string {
  const salt = process.env.UNSUBSCRIBE_SECRET ?? 'ip-hash-salt'
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}
