import crypto from 'crypto'

function freshCrypto() {
  let mod!: typeof import('./crypto')
  jest.isolateModules(() => {
    mod = require('./crypto')
  })
  return mod
}

describe('gbp crypto (AES-256-GCM)', () => {
  test('round-trips a token', () => {
    process.env.GBP_TOKEN_ENC_KEY = crypto.randomBytes(32).toString('base64')
    const { encryptToken, decryptToken } = freshCrypto()
    const enc = encryptToken('1//refresh-token-value')
    expect(enc.cipher).not.toContain('refresh-token-value')
    expect(decryptToken(enc)).toBe('1//refresh-token-value')
  })

  test('a tampered auth tag throws', () => {
    process.env.GBP_TOKEN_ENC_KEY = crypto.randomBytes(32).toString('base64')
    const { encryptToken, decryptToken } = freshCrypto()
    const enc = encryptToken('secret')
    const badTag = Buffer.from(enc.tag, 'base64')
    badTag[0] ^= 0xff
    expect(() => decryptToken({ ...enc, tag: badTag.toString('base64') })).toThrow()
  })

  test('a wrong-length key throws on use', () => {
    process.env.GBP_TOKEN_ENC_KEY = Buffer.from('too-short').toString('base64')
    const { encryptToken } = freshCrypto()
    expect(() => encryptToken('x')).toThrow(/32 bytes/)
  })

  test('a missing key throws on use', () => {
    delete process.env.GBP_TOKEN_ENC_KEY
    const { isGbpCryptoConfigured } = freshCrypto()
    expect(isGbpCryptoConfigured()).toBe(false)
  })
})
