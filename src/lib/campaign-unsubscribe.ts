import crypto from 'crypto'

const SECRET = process.env.UNSUBSCRIBE_SECRET ?? 'unsubscribe-dev-secret-change-in-prod'

interface UnsubscribeClaims {
  clinicId: number
}

export function signUnsubscribeToken(clinicId: number): string {
  const data = Buffer.from(JSON.stringify({ clinicId } satisfies UnsubscribeClaims)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifyUnsubscribeToken(token: string): UnsubscribeClaims | null {
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
    return JSON.parse(Buffer.from(data, 'base64url').toString()) as UnsubscribeClaims
  } catch {
    return null
  }
}
