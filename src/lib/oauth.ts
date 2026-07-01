import crypto from 'crypto'
import { createRemoteJWKSet, jwtVerify } from 'jose'

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

const APPLE_JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'))

export async function verifyAppleToken(idToken: string, nonce: string) {
  const { payload } = await jwtVerify(idToken, APPLE_JWKS, {
    issuer: 'https://appleid.apple.com',
    audience: process.env.APPLE_CLIENT_ID,
  })
  if (payload.nonce !== nonce) throw new Error('nonce mismatch')
  return payload as { sub: string; email?: string; email_verified?: boolean | string }
}

export function buildAppleClientSecret(): string {
  const privateKeyPem = Buffer.from(
    process.env.APPLE_PRIVATE_KEY ?? '',
    'base64',
  ).toString('utf8')

  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: process.env.APPLE_KEY_ID })).toString('base64url')
  const claims = Buffer.from(JSON.stringify({
    iss: process.env.APPLE_TEAM_ID,
    iat: now,
    exp: now + 300,
    aud: 'https://appleid.apple.com',
    sub: process.env.APPLE_CLIENT_ID,
  })).toString('base64url')

  const unsigned = `${header}.${claims}`
  const sign = crypto.createSign('SHA256')
  sign.update(unsigned)
  const sig = sign.sign({ key: privateKeyPem, dsaEncoding: 'ieee-p1363' }, 'base64url')
  return `${unsigned}.${sig}`
}
