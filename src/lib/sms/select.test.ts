import { activeProviderName, getActiveProvider, isSmsConfigured, smsStatusCallbackUrl } from './index'

const ENV_KEYS = [
  'SMS_PROVIDER',
  'NEXT_PUBLIC_BASE_URL',
  'PLIVO_AUTH_ID',
  'PLIVO_AUTH_TOKEN',
  'PLIVO_POWERPACK_UUID',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_FROM_NUMBER',
] as const

describe('provider selection', () => {
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

  it('defaults to plivo when SMS_PROVIDER is unset', () => {
    expect(activeProviderName()).toBe('plivo')
    expect(getActiveProvider()?.name).toBe('plivo')
  })

  it('honours an explicit twilio selection', () => {
    process.env.SMS_PROVIDER = 'twilio'
    expect(activeProviderName()).toBe('twilio')
    expect(getActiveProvider()?.name).toBe('twilio')
  })

  it('is case-insensitive and trims', () => {
    process.env.SMS_PROVIDER = '  Twilio '
    expect(activeProviderName()).toBe('twilio')
  })

  it('"off" disables SMS entirely', () => {
    process.env.SMS_PROVIDER = 'off'
    expect(activeProviderName()).toBeNull()
    expect(getActiveProvider()).toBeNull()
    expect(isSmsConfigured()).toBe(false)
  })

  it('an unknown value falls back to the default', () => {
    process.env.SMS_PROVIDER = 'nexmo'
    expect(activeProviderName()).toBe('plivo')
  })

  it('isSmsConfigured reflects the active provider only', () => {
    // Twilio fully set, but plivo is active (default) and unconfigured.
    process.env.TWILIO_ACCOUNT_SID = 'AC1'
    process.env.TWILIO_AUTH_TOKEN = 'tok'
    process.env.TWILIO_FROM_NUMBER = '+441234567890'
    expect(isSmsConfigured()).toBe(false)

    process.env.SMS_PROVIDER = 'twilio'
    expect(isSmsConfigured()).toBe(true)

    process.env.SMS_PROVIDER = 'plivo'
    process.env.PLIVO_AUTH_ID = 'MA1'
    process.env.PLIVO_AUTH_TOKEN = 'tok'
    process.env.PLIVO_POWERPACK_UUID = 'pp1'
    expect(isSmsConfigured()).toBe(true)
  })

  it('smsStatusCallbackUrl is null for a local base URL, set for a public one', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
    expect(smsStatusCallbackUrl()).toBeNull()

    process.env.NEXT_PUBLIC_BASE_URL = 'https://consentz.com'
    expect(smsStatusCallbackUrl()).toBe('https://consentz.com/directory/api/webhooks/sms/status')
  })
})
