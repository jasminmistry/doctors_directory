/**
 * Phone-number normalisation for outbound SMS.
 *
 * Clinic phone data comes from two places, both untrustworthy:
 *   - `Clinic.gmapsPhone` — scraped free text, e.g. "020 7946 0000", "+44 20 7946 0000 / 07700 900123"
 *   - `ClaimRequest.clinicPhone` / `claimerPhone` — user-typed at claim time
 *
 * `toE164()` pulls the first plausible number out of that text and returns it in
 * E.164 (`+441…`) form, or `null` when nothing usable is found. UK is the only
 * assumed default region — a bare `0…` national number is treated as GB.
 */

/** Matches the first phone-shaped run of characters in a messy string. */
const PHONE_TOKEN_RE = /\+?\d[\d\s().-]{6,}\d/

/** E.164: leading "+", country code, up to 15 digits total. */
const E164_RE = /^\+[1-9]\d{7,14}$/

/**
 * Normalise a raw phone string to E.164, defaulting bare national numbers to the
 * given region (only `GB` is supported). Returns `null` if no valid number is found.
 */
export function toE164(raw: string | null | undefined, region: 'GB' = 'GB'): string | null {
  if (!raw) return null

  const token = raw.match(PHONE_TOKEN_RE)?.[0]
  if (!token) return null

  const hadPlus = token.trimStart().startsWith('+')
  let digits = token.replace(/\D/g, '')
  if (!digits) return null

  let e164: string

  if (hadPlus) {
    e164 = `+${digits}`
  } else if (digits.startsWith('00')) {
    // International prefix written the European way.
    e164 = `+${digits.slice(2)}`
  } else if (region === 'GB' && digits.startsWith('0')) {
    e164 = `+44${digits.slice(1)}`
  } else if (digits.startsWith('44')) {
    e164 = `+${digits}`
  } else if (region === 'GB') {
    e164 = `+44${digits}`
  } else {
    e164 = `+${digits}`
  }

  if (!E164_RE.test(e164)) return null

  // UK numbers are +44 followed by 9–10 national digits (10–11 total after the CC).
  if (e164.startsWith('+44')) {
    const national = e164.slice(3)
    if (national.length < 9 || national.length > 10) return null
  }

  return e164
}

/** True when `raw` yields a sendable E.164 number. */
export function isSendablePhone(raw: string | null | undefined): boolean {
  return toE164(raw) !== null
}
