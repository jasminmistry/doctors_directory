export type CookieConsentPreferences = {
  necessary: true
  statistics: boolean
  marketing: boolean
}

export const COOKIE_CONSENT_NAME = "cookie_consent"
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180

/** Fired on `window` whenever consent is written, so scripts already on the
 * page can react without a full reload. Detail is `{ statistics, marketing }`. */
export const COOKIE_CONSENT_CHANGE_EVENT = "cookie-consent-change"

/** Fired to ask the banner to reopen (e.g. a "Cookie settings" footer link),
 * so consent can be withdrawn or changed after the first visit. */
export const COOKIE_CONSENT_OPEN_EVENT = "cookie-consent-open"

export function parseCookieConsent(raw: string): CookieConsentPreferences | null {
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed?.statistics === "boolean" && typeof parsed?.marketing === "boolean") {
      return { necessary: true, statistics: parsed.statistics, marketing: parsed.marketing }
    }
    // Legacy shape written before the marketing category existed.
    if (typeof parsed?.analytics === "boolean") {
      return { necessary: true, statistics: parsed.analytics, marketing: false }
    }
  } catch {
    return null
  }
  return null
}

export function readCookieConsent(): CookieConsentPreferences | null {
  if (typeof document === "undefined") return null

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_CONSENT_NAME}=([^;]*)`)
  )
  if (!match) return null

  return parseCookieConsent(decodeURIComponent(match[1]))
}

export function writeCookieConsent(preferences: {
  statistics: boolean
  marketing: boolean
}): void {
  if (typeof document === "undefined") return

  const value = encodeURIComponent(JSON.stringify(preferences))
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${COOKIE_CONSENT_NAME}=${value}; max-age=${COOKIE_MAX_AGE_SECONDS}; path=/directory; SameSite=Lax${secure}`

  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT, { detail: preferences })
  )
}

/** Reopens the cookie banner so a user can review or withdraw consent. */
export function openCookieConsentPreferences(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT))
}
