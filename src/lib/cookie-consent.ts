export type CookieConsentPreferences = {
  necessary: true
  analytics: boolean
}

const COOKIE_NAME = "cookie_consent"
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180

export function readCookieConsent(): CookieConsentPreferences | null {
  if (typeof document === "undefined") return null

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`)
  )
  if (!match) return null

  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]))
    if (typeof parsed?.analytics === "boolean") {
      return { necessary: true, analytics: parsed.analytics }
    }
  } catch {
    return null
  }

  return null
}

export function writeCookieConsent(analytics: boolean): void {
  if (typeof document === "undefined") return

  const value = encodeURIComponent(JSON.stringify({ analytics }))
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${COOKIE_MAX_AGE_SECONDS}; path=/directory; SameSite=Lax`
}
