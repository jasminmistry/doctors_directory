/**
 * Thin, typed wrapper over GA4 (`gtag`) plus a `dataLayer` push so a later move
 * to Google Tag Manager is lift-and-shift. Every custom analytics event in the
 * app should go through `track()` rather than calling `window.gtag` directly.
 *
 * Consent is already handled upstream by Google Consent Mode v2 (see
 * `consent-scripts.tsx`) — gtag holds storage-backed hits until `analytics_storage`
 * is granted, so callers don't need to check consent themselves.
 */

import { ATTR_COOKIE_NAME, parseAttrCookie } from "@/lib/attribution"

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/** The closed set of custom events the app emits. Add here before using. */
export type AnalyticsEvent =
  | "cta_click"
  | "lead_submitted"
  | "search"
  | "form_start"
  | "form_submit"
  | "generate_lead"
  | "sign_up_start"
  | "sign_up_otp_verified"
  | "sign_up_plan_selected"
  | "sign_up"
  | "chat_open"
  | "chat_message_sent"
  | "booking_start"
  | "booking_slot_select"
  | "booking_complete"
  | "call_booking_start"
  | "call_booking_complete"

export function track(event: AnalyticsEvent, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return

  // Drop null/undefined so GA doesn't record empty custom dimensions.
  const clean: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") clean[key] = value
  }

  try {
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, ...clean })
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", event, clean)
    }
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("[analytics]", event, clean)
    }
  } catch {
    /* analytics must never throw into the app */
  }
}

/**
 * Fire an event at most once per browser session for a given `key`. Guards
 * conversion events (e.g. `sign_up`) against a page refresh re-firing them when
 * the component that emits them remounts. Falls back to firing normally if
 * `sessionStorage` is unavailable.
 */
export function trackOnce(
  key: string,
  event: AnalyticsEvent,
  params: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return
  try {
    const storeKey = `analytics:once:${key}`
    if (window.sessionStorage.getItem(storeKey)) return
    window.sessionStorage.setItem(storeKey, "1")
  } catch {
    /* sessionStorage blocked — fall through and fire anyway */
  }
  track(event, params)
}

/**
 * First-touch attribution params for events that want acquisition context
 * (the sign-up funnel especially). Reads the `dd_attr` cookie the
 * AttributionTracker wrote on the visitor's first page load.
 */
export function attributionParams(): {
  source_bucket: string | null
  landing_page: string | null
} {
  if (typeof document === "undefined") return { source_bucket: null, landing_page: null }
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${ATTR_COOKIE_NAME}=`))
    ?.slice(ATTR_COOKIE_NAME.length + 1)
  const a = parseAttrCookie(raw)
  return { source_bucket: a?.source ?? null, landing_page: a?.landingPage ?? null }
}

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-QTXQ1H7HG2"

/**
 * Resolve the GA4 client id for the current browser so server-side events
 * (Measurement Protocol) can be stitched to the same user. Tries the official
 * `gtag('get', …)` first, then falls back to parsing the `_ga` cookie.
 * Resolves `null` if GA hasn't loaded / no cookie yet.
 */
export function getGaClientId(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(null)
    try {
      if (typeof window.gtag === "function") {
        let done = false
        window.gtag("get", GA_MEASUREMENT_ID, "client_id", (id: unknown) => {
          done = true
          resolve(typeof id === "string" && id ? id : gaClientIdFromCookie())
        })
        // gtag('get') never calls back if the tag isn't ready — don't hang.
        setTimeout(() => {
          if (!done) resolve(gaClientIdFromCookie())
        }, 800)
        return
      }
    } catch {
      /* fall through to cookie */
    }
    resolve(gaClientIdFromCookie())
  })
}

function gaClientIdFromCookie(): string | null {
  if (typeof document === "undefined") return null
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith("_ga="))
    ?.slice(4)
  if (!raw) return null
  // Format: GA1.1.XXXXXXXXXX.YYYYYYYYYY  →  client_id is "XXXXXXXXXX.YYYYYYYYYY"
  const parts = raw.split(".")
  return parts.length >= 4 ? `${parts[2]}.${parts[3]}` : null
}
