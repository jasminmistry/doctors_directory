import { twilioProvider } from './twilio'

const ENV_KEYS = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_MESSAGING_SERVICE_SID',
  'TWILIO_FROM_NUMBER',
] as const

describe('twilioProvider', () => {
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
      expect(twilioProvider.isConfigured()).toBe(false)
    })

    it('false with creds but no sender', () => {
      process.env.TWILIO_ACCOUNT_SID = 'AC123'
      process.env.TWILIO_AUTH_TOKEN = 'tok'
      expect(twilioProvider.isConfigured()).toBe(false)
    })

    it('true with creds + messaging service', () => {
      process.env.TWILIO_ACCOUNT_SID = 'AC123'
      process.env.TWILIO_AUTH_TOKEN = 'tok'
      process.env.TWILIO_MESSAGING_SERVICE_SID = 'MG123'
      expect(twilioProvider.isConfigured()).toBe(true)
    })

    it('true with creds + from number', () => {
      process.env.TWILIO_ACCOUNT_SID = 'AC123'
      process.env.TWILIO_AUTH_TOKEN = 'tok'
      process.env.TWILIO_FROM_NUMBER = '+441234567890'
      expect(twilioProvider.isConfigured()).toBe(true)
    })
  })

  describe('parseStatus', () => {
    it('maps a delivered callback', () => {
      expect(twilioProvider.parseStatus({ MessageSid: 'SM1', MessageStatus: 'delivered' })).toEqual({
        sid: 'SM1',
        status: 'delivered',
        raw: 'delivered',
      })
    })

    it('accepts the legacy SmsSid / SmsStatus fields', () => {
      expect(twilioProvider.parseStatus({ SmsSid: 'SM2', SmsStatus: 'sent' })).toEqual({
        sid: 'SM2',
        status: 'sent',
        raw: 'sent',
      })
    })

    it('unknown status → "unknown" but keeps raw', () => {
      expect(twilioProvider.parseStatus({ MessageSid: 'SM3', MessageStatus: 'weird' })).toEqual({
        sid: 'SM3',
        status: 'unknown',
        raw: 'weird',
      })
    })

    it('null when not a status payload', () => {
      expect(twilioProvider.parseStatus({ From: '+44123' })).toBeNull()
    })
  })

  describe('parseInbound', () => {
    it('pulls from + body', () => {
      expect(twilioProvider.parseInbound({ From: '+44123', Body: 'STOP' })).toEqual({
        from: '+44123',
        body: 'STOP',
      })
    })

    it('null without a sender', () => {
      expect(twilioProvider.parseInbound({ Body: 'STOP' })).toBeNull()
    })
  })

  describe('verifyWebhook', () => {
    it('false without a signature header', () => {
      process.env.TWILIO_AUTH_TOKEN = 'tok'
      expect(
        twilioProvider.verifyWebhook({
          url: 'https://x.test/directory/api/webhooks/sms/status',
          headers: new Headers(),
          params: {},
        }),
      ).toBe(false)
    })
  })
})
