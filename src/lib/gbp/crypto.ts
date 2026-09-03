import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

// AES-256-GCM encryption at rest for GBP OAuth refresh tokens. This is the first
// encryption-at-rest mechanism in the codebase — refresh tokens for the restricted
// `business.manage` scope must not be stored in plaintext the way Consentz tokens are.
//
// GBP_TOKEN_ENC_KEY is 32 bytes, base64-encoded. Validation is lazy (on first
// encrypt/decrypt) so the app still boots when the GBP connector is not configured.

let cachedKey: Buffer | null = null

function getKey(): Buffer {
  if (cachedKey) return cachedKey
  const raw = process.env.GBP_TOKEN_ENC_KEY
  if (!raw) {
    throw new Error('GBP_TOKEN_ENC_KEY is not set — cannot encrypt/decrypt GBP tokens')
  }
  const key = Buffer.from(raw, 'base64')
  if (key.length !== 32) {
    throw new Error(`GBP_TOKEN_ENC_KEY must decode to 32 bytes (got ${key.length})`)
  }
  cachedKey = key
  return key
}

export interface EncryptedToken {
  cipher: string // base64
  iv: string // base64, 12 bytes
  tag: string // base64, 16 bytes
}

export function encryptToken(plain: string): EncryptedToken {
  const iv = randomBytes(12)
  const c = createCipheriv('aes-256-gcm', getKey(), iv)
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()])
  return {
    cipher: enc.toString('base64'),
    iv: iv.toString('base64'),
    tag: c.getAuthTag().toString('base64'),
  }
}

export function decryptToken(p: EncryptedToken): string {
  const d = createDecipheriv('aes-256-gcm', getKey(), Buffer.from(p.iv, 'base64'))
  d.setAuthTag(Buffer.from(p.tag, 'base64'))
  return Buffer.concat([d.update(Buffer.from(p.cipher, 'base64')), d.final()]).toString('utf8')
}

export function isGbpCryptoConfigured(): boolean {
  try {
    getKey()
    return true
  } catch {
    return false
  }
}
