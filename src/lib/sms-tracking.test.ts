import { signSmsTrackingToken, verifySmsTrackingToken } from '@/lib/sms-tracking'

describe('sms tracking token', () => {
  it('round-trips a signed token', () => {
    const token = signSmsTrackingToken('lead', 4321)
    expect(verifySmsTrackingToken(token)).toEqual({ kind: 'lead', id: 4321 })
  })

  it('rejects a tampered payload', () => {
    const token = signSmsTrackingToken('lead', 1)
    const [data, sig] = token.split('.')
    const forged = `${Buffer.from(JSON.stringify({ kind: 'lead', id: 999 })).toString('base64url')}.${sig}`
    expect(verifySmsTrackingToken(forged)).toBeNull()
    expect(verifySmsTrackingToken(`${data}.deadbeef`)).toBeNull()
  })

  it('rejects malformed tokens', () => {
    expect(verifySmsTrackingToken('')).toBeNull()
    expect(verifySmsTrackingToken('no-dot')).toBeNull()
    expect(verifySmsTrackingToken('a.b.c')).toBeNull()
  })
})
