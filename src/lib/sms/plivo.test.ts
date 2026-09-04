import { plivoProvider } from './plivo'

const ENV_KEYS = [
  'PLIVO_AUTH_ID',
  'PLIVO_AUTH_TOKEN',
  'PLIVO_POWERPACK_UUID',
  'PLIVO_FROM_NUMBER',
] as const

describe('plivoProvider', () => {
  const saved: Record<string, string | undefined> = {}

  beforeEach(() => {
    for (const k of ENV_KEYS) {
      saved[k] = process.env[k]
      delete process.env[k]
    }
  })

  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (saved[k] === undefined) delete process.env[k]
      else process.env[k] = saved[k]
    }
  })

  describe('isConfigured', () => {
    it('false with no env', () => {
      expect(plivoProvider.isConfigured()).toBe(false)
    })

    it('false with creds but no sender', () => {
      process.env.PLIVO_AUTH_ID = 'MA123'
      process.env.PLIVO_AUTH_TOKEN = 'tok'
      expect(plivoProvider.isConfigured()).toBe(false)
    })

    it('true with creds + powerpack', () => {
      process.env.PLIVO_AUTH_ID = 'MA123'
      process.env.PLIVO_AUTH_TOKEN = 'tok'
      process.env.PLIVO_POWERPACK_UUID = 'pp-123'
      expect(plivoProvider.isConfigured()).toBe(true)
    })

    it('true with creds + from number', () => {
      process.env.PLIVO_AUTH_ID = 'MA123'
      process.env.PLIVO_AUTH_TOKEN = 'tok'
      process.env.PLIVO_FROM_NUMBER = '+441234567890'
      expect(plivoProvider.isConfigured()).toBe(true)
    })
  })

  describe('parseStatus', () => {
    it('maps a delivered report', () => {
      expect(plivoProvider.parseStatus({ MessageUUID: 'uuid-1', Status: 'delivered' })).toEqual({
        sid: 'uuid-1',
        status: 'delivered',
        raw: 'delivered',
      })
    })

    it('maps "rejected" onto failed', () => {
      expect(plivoProvider.parseStatus({ MessageUUID: 'uuid-2', Status: 'rejected' })).toEqual({
        sid: 'uuid-2',
        status: 'failed',
        raw: 'rejected',
      })
    })

    it('unknown status → "unknown" but keeps raw', () => {
      expect(plivoProvider.parseStatus({ MessageUUID: 'uuid-3', Status: 'weird' })).toEqual({
        sid: 'uuid-3',
        status: 'unknown',
        raw: 'weird',
      })
    })

    it('null when not a status payload', () => {
      expect(plivoProvider.parseStatus({ From: '+44123' })).toBeNull()
    })
  })

  describe('parseInbound', () => {
    it('pulls from + text', () => {
      expect(plivoProvider.parseInbound({ From: '+44123', Text: 'STOP' })).toEqual({
        from: '+44123',
        body: 'STOP',
      })
    })

    it('null without a sender', () => {
      expect(plivoProvider.parseInbound({ Text: 'STOP' })).toBeNull()
    })
  })

  describe('verifyWebhook', () => {
    it('false without the v3 signature headers', () => {
      process.env.PLIVO_AUTH_TOKEN = 'tok'
      expect(
        plivoProvider.verifyWebhook({
          url: 'https://x.test/directory/api/webhooks/sms/status',
          headers: new Headers(),
          params: {},
        }),
      ).toBe(false)
    })
  })
})
