import { cookies } from "next/headers"

import {
  COOKIE_CONSENT_NAME,
  parseCookieConsent,
  type CookieConsentPreferences,
} from "@/lib/cookie-consent"

/** Server-side read of the consent cookie, used to render tracking scripts
 * with the correct default consent state on first paint (no flash of
 * unconsented tracking before client JS runs). */
export async function readCookieConsentFromRequest(): Promise<CookieConsentPreferences | null> {
  const store = await cookies()
  const raw = store.get(COOKIE_CONSENT_NAME)?.value
  if (!raw) return null

  try {
    return parseCookieConsent(decodeURIComponent(raw))
  } catch {
    return null
  }
}
