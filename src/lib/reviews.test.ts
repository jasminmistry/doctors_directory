import {
  generateReviewToken,
  hashReviewToken,
  reviewRequestExpiry,
  signDwellToken,
  verifyDwellToken,
} from '@/lib/reviews'

describe('review tokens', () => {
  test('generateReviewToken produces a matching hash', () => {
    const { rawToken, tokenHash } = generateReviewToken()
    expect(rawToken).toHaveLength(64)
    expect(hashReviewToken(rawToken)).toBe(tokenHash)
  })

  test('expiry is ~60 days out', () => {
    const now = new Date('2026-01-01T00:00:00Z')
    const exp = reviewRequestExpiry(now)
    expect(exp.getTime() - now.getTime()).toBe(60 * 24 * 60 * 60 * 1000)
  })
})

describe('dwell token', () => {
  test('rejects a submission that arrives too fast', () => {
    expect(verifyDwellToken(signDwellToken(Date.now()))).toBe(false)
  })

  test('accepts a plausible dwell window', () => {
    const issued = Date.now() - 10_000
    expect(verifyDwellToken(signDwellToken(issued))).toBe(true)
  })

  test('rejects a stale token', () => {
    const issued = Date.now() - 2 * 60 * 60 * 1000
    expect(verifyDwellToken(signDwellToken(issued))).toBe(false)
  })

  test('rejects a tampered signature', () => {
    const token = signDwellToken(Date.now() - 10_000)
    expect(verifyDwellToken(token.slice(0, -2) + 'xx')).toBe(false)
  })
})
