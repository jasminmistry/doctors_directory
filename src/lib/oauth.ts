import crypto from 'crypto'

export function generateState(): string {
  return crypto.randomBytes(16).toString('hex')
}

export function encodeOAuthState(state: string, next: string): string {
  return Buffer.from(JSON.stringify({ s: state, n: next })).toString('base64url')
}

export function decodeOAuthState(encoded: string): { s: string; n: string } | null {
  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString())
  } catch {
    return null
  }
}
