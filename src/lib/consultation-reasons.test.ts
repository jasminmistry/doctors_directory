import {
  CONTACT_REASONS,
  contactReasonLabel,
  isValidContactReason,
} from '@/lib/consultation-reasons'

describe('consultation-reasons', () => {
  test('every reason has a non-empty value and label', () => {
    for (const reason of CONTACT_REASONS) {
      expect(reason.value).toMatch(/^[a-z0-9_]+$/)
      expect(reason.label.length).toBeGreaterThan(0)
    }
  })

  test('reason values are unique', () => {
    const values = CONTACT_REASONS.map((r) => r.value)
    expect(new Set(values).size).toBe(values.length)
  })

  test('isValidContactReason accepts known values only', () => {
    expect(isValidContactReason('consultation')).toBe(true)
    expect(isValidContactReason('consultation_24h')).toBe(true)
    expect(isValidContactReason('not-a-reason')).toBe(false)
    expect(isValidContactReason('')).toBe(false)
    expect(isValidContactReason(null)).toBe(false)
    expect(isValidContactReason(42)).toBe(false)
  })

  test('contactReasonLabel maps values to labels, falls back to the raw value', () => {
    expect(contactReasonLabel('consultation')).toBe('Consultation')
    expect(contactReasonLabel('consultation_24h')).toBe('Consultation within 24 hours')
    expect(contactReasonLabel('unknown_value')).toBe('unknown_value')
  })
})
