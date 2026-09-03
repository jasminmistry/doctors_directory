import { isSendablePhone, toE164 } from '@/lib/phone'

describe('toE164', () => {
  it('normalises a UK national number', () => {
    expect(toE164('020 7946 0000')).toBe('+442079460000')
    expect(toE164('0161 496 0000')).toBe('+441614960000')
    expect(toE164('07700 900123')).toBe('+447700900123')
  })

  it('keeps an already-international number', () => {
    expect(toE164('+44 20 7946 0000')).toBe('+442079460000')
    expect(toE164('+447700900123')).toBe('+447700900123')
  })

  it('handles the 00 international prefix', () => {
    expect(toE164('0044 7700 900123')).toBe('+447700900123')
  })

  it('extracts the first number from messy scraped text', () => {
    expect(toE164('Tel: 020 7946 0000 / Mobile 07700 900123')).toBe('+442079460000')
    expect(toE164('Call us on (0207) 946-0000 today')).toBe('+442079460000')
  })

  it('rejects junk and too-short numbers', () => {
    expect(toE164('')).toBeNull()
    expect(toE164(null)).toBeNull()
    expect(toE164('no phone here')).toBeNull()
    expect(toE164('12345')).toBeNull()
    expect(toE164('020 7946')).toBeNull()
  })

  it('drives isSendablePhone', () => {
    expect(isSendablePhone('020 7946 0000')).toBe(true)
    expect(isSendablePhone('nope')).toBe(false)
  })
})
