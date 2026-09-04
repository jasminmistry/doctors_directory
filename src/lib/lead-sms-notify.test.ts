const mockSendLeadNotificationSms = jest.fn()
const mockSendLeadTeaserSms = jest.fn()
const mockSendGhostLeadSms = jest.fn()
const mockUpdateMany = jest.fn()
const mockSendMpEvents = jest.fn()

// This repo's jest config doesn't apply the `@/` alias inside jest.mock() — use
// relative paths here (they resolve to the same files the SUT imports via `@/`).
jest.mock('./sms', () => ({
  sendLeadNotificationSms: (...a: unknown[]) => mockSendLeadNotificationSms(...a),
  sendLeadTeaserSms: (...a: unknown[]) => mockSendLeadTeaserSms(...a),
  sendGhostLeadSms: (...a: unknown[]) => mockSendGhostLeadSms(...a),
}))
jest.mock('./db', () => ({
  prisma: { consultationLead: { updateMany: (...a: unknown[]) => mockUpdateMany(...a) } },
}))
jest.mock('./analytics/measurement-protocol', () => ({
  sendMpEvents: (...a: unknown[]) => mockSendMpEvents(...a),
  syntheticClientId: (seed: string) => `srv.${seed}`,
}))

import { notifyClinicBySms, resolveSmsSendMode } from '@/lib/lead-sms-notify'

const baseClinic = {
  id: 7,
  name: 'Glow Clinic',
  slug: 'glow-clinic',
  claimed: true,
  claimedPlan: 'subscription' as string | null,
  email: 'hi@glow.example',
  gmapsPhone: '020 7946 0000',
  smsNotifyMode: null as string | null,
  gaClientId: null as string | null,
}

const okResult = { sid: 'SM123', status: 'queued' }

beforeEach(() => {
  jest.clearAllMocks()
  delete process.env.SMS_SEND_MODE
  mockSendLeadNotificationSms.mockResolvedValue(okResult)
  mockSendLeadTeaserSms.mockResolvedValue(okResult)
  mockSendGhostLeadSms.mockResolvedValue(okResult)
  mockUpdateMany.mockResolvedValue({ count: 1 })
  mockSendMpEvents.mockResolvedValue(undefined)
})

const call = (over: Partial<Parameters<typeof notifyClinicBySms>[0]> = {}) =>
  notifyClinicBySms({
    leadId: 100,
    clinic: baseClinic,
    leadSource: 'consultation',
    emailAvailable: true,
    emailFailed: false,
    ghostEligible: false,
    baseUrl: 'https://x.test',
    ...over,
  })

describe('resolveSmsSendMode', () => {
  it('prefers the clinic override, falls back to env, defaults to fallback', () => {
    expect(resolveSmsSendMode('always')).toBe('always')
    expect(resolveSmsSendMode('off')).toBe('off')
    process.env.SMS_SEND_MODE = 'always'
    expect(resolveSmsSendMode(null)).toBe('always')
    process.env.SMS_SEND_MODE = 'nonsense'
    expect(resolveSmsSendMode(null)).toBe('fallback')
  })
})

describe('notifyClinicBySms', () => {
  it('fallback mode: does not send when email is available and succeeded', async () => {
    await call()
    expect(mockSendLeadNotificationSms).not.toHaveBeenCalled()
  })

  it('fallback mode: sends when the clinic has no email', async () => {
    await call({ clinic: { ...baseClinic, email: null }, emailAvailable: false })
    expect(mockSendLeadNotificationSms).toHaveBeenCalledTimes(1)
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: 100, notificationSmsSentAt: null },
      data: expect.objectContaining({ notificationSmsSid: 'SM123', notificationSmsTo: '+442079460000' }),
    })
  })

  it('fallback mode: sends when the email failed', async () => {
    await call({ emailFailed: true })
    expect(mockSendLeadNotificationSms).toHaveBeenCalledTimes(1)
  })

  it('always mode: sends even when the email succeeded', async () => {
    await call({ clinic: { ...baseClinic, smsNotifyMode: 'always' } })
    expect(mockSendLeadNotificationSms).toHaveBeenCalledTimes(1)
    expect(mockSendMpEvents).toHaveBeenCalledTimes(1)
  })

  it('off mode: never sends', async () => {
    await call({ clinic: { ...baseClinic, smsNotifyMode: 'off' }, emailFailed: true })
    expect(mockSendLeadNotificationSms).not.toHaveBeenCalled()
  })

  it('does nothing when no usable phone exists', async () => {
    await call({ clinic: { ...baseClinic, gmapsPhone: 'call reception', smsNotifyMode: 'always' } })
    expect(mockSendLeadNotificationSms).not.toHaveBeenCalled()
  })

  it('prefers the claim phone over the scraped gmaps phone', async () => {
    await call({ clinic: { ...baseClinic, smsNotifyMode: 'always' }, claimPhone: '07700 900123' })
    expect(mockSendLeadNotificationSms).toHaveBeenCalledWith(
      expect.objectContaining({ to: '+447700900123' }),
    )
  })

  it('uses the teaser template for non-subscription plans', async () => {
    await call({ clinic: { ...baseClinic, claimedPlan: 'pay_per_lead', smsNotifyMode: 'always' } })
    expect(mockSendLeadTeaserSms).toHaveBeenCalledTimes(1)
    expect(mockSendLeadNotificationSms).not.toHaveBeenCalled()
  })

  it('uses the ghost template for unclaimed clinics and respects ghostEligible', async () => {
    await call({ clinic: { ...baseClinic, claimed: false }, ghostEligible: false, emailFailed: true })
    expect(mockSendGhostLeadSms).not.toHaveBeenCalled()

    await call({ clinic: { ...baseClinic, claimed: false, email: null }, emailAvailable: false, ghostEligible: true })
    expect(mockSendGhostLeadSms).toHaveBeenCalledTimes(1)
  })

  it('does not record a send when the SMS provider is not configured (null result)', async () => {
    mockSendLeadNotificationSms.mockResolvedValue(null)
    await call({ emailFailed: true })
    expect(mockUpdateMany).not.toHaveBeenCalled()
    expect(mockSendMpEvents).not.toHaveBeenCalled()
  })

  it('swallows send errors', async () => {
    mockSendLeadNotificationSms.mockRejectedValue(new Error('twilio down'))
    await expect(call({ emailFailed: true })).resolves.toBeUndefined()
  })
})
