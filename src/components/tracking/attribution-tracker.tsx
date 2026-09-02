"use client"

import { useEffect } from "react"

import {
  ATTR_COOKIE_NAME,
  ATTR_COOKIE_PATH,
  ATTR_MAX_AGE_SECONDS,
  getSourceBucket,
  normalizeAppPath,
  serializeAttrCookie,
} from "@/lib/attribution"

/**
 * Writes the `dd_attr` first-touch attribution cookie on the visitor's first
 * page load and never again (first touch wins). Mounted once in the root layout,
 * so it covers every route including the Business Hub. Best-effort — any failure
 * is swallowed so it can never break the page.
 *
 * Holds no PII: source bucket, landing path, referrer host, `utm_*`, timestamp.
 */
export function AttributionTracker() {
  useEffect(() => {
    try {
      const alreadySet = document.cookie
        .split("; ")
        .some((c) => c.startsWith(`${ATTR_COOKIE_NAME}=`))
      if (alreadySet) return

      const { pathname, search, origin } = window.location
      const params = new URLSearchParams(search)

      let referrer = "direct"
      if (document.referrer) {
        try {
          const ref = new URL(document.referrer)
          referrer = ref.origin === origin ? "direct" : ref.host
        } catch {
          /* unparseable referrer — leave as "direct" */
        }
      }

      const value = serializeAttrCookie({
        source: getSourceBucket(pathname),
        landingPage: normalizeAppPath(pathname),
        referrer,
        utmSource: params.get("utm_source"),
        utmMedium: params.get("utm_medium"),
        utmCampaign: params.get("utm_campaign"),
      })

      const secure = window.location.protocol === "https:" ? "; Secure" : ""
      document.cookie =
        `${ATTR_COOKIE_NAME}=${value}; Max-Age=${ATTR_MAX_AGE_SECONDS}; ` +
        `Path=${ATTR_COOKIE_PATH}; SameSite=Lax${secure}`
    } catch {
      /* attribution is non-essential — never surface an error to the user */
    }
  }, [])

  return null
}
