"use client"

import Script from "next/script"
import { useEffect, useState } from "react"

import {
  COOKIE_CONSENT_CHANGE_EVENT,
  readCookieConsent,
  type CookieConsentPreferences,
} from "@/lib/cookie-consent"

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-QTXQ1H7HG2"

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function consentState(granted: boolean) {
  return granted ? "granted" : "denied"
}

/**
 * Owns every third-party tracking script for the site. Nothing here fires
 * until it is allowed to under Google Consent Mode v2 (`analytics_storage`,
 * `ad_storage`, ...), which starts at "denied" by default. Microsoft Clarity
 * has no consent-mode equivalent, so it's only injected once statistics
 * consent has actually been granted.
 */
export function ConsentScripts({
  initialConsent,
}: {
  initialConsent: CookieConsentPreferences | null
}) {
  const [consent, setConsent] = useState<CookieConsentPreferences | null>(initialConsent)

  useEffect(() => {
    function onChange(event: Event) {
      const detail = (event as CustomEvent<{ statistics: boolean; marketing: boolean }>).detail
      setConsent(detail ? { necessary: true, ...detail } : readCookieConsent())
    }

    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, onChange)
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, onChange)
  }, [])

  useEffect(() => {
    if (typeof window.gtag !== "function") return
    window.gtag("consent", "update", {
      analytics_storage: consentState(!!consent?.statistics),
      ad_storage: consentState(!!consent?.marketing),
      ad_user_data: consentState(!!consent?.marketing),
      ad_personalization: consentState(!!consent?.marketing),
    })
  }, [consent])

  return (
    <>
      {/* Default consent state must be declared before gtag.js loads so no
          storage is used ahead of an explicit choice. */}
      <Script id="consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            analytics_storage: '${consentState(!!initialConsent?.statistics)}',
            ad_storage: '${consentState(!!initialConsent?.marketing)}',
            ad_user_data: '${consentState(!!initialConsent?.marketing)}',
            ad_personalization: '${consentState(!!initialConsent?.marketing)}',
            wait_for_update: 500
          });
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          gtag('js', new Date());
          // App Router is a SPA — auto page_view only fires on hard loads and
          // misses client navigations. <GaPageView> sends an enriched page_view
          // on every route change instead (source_bucket, page_type).
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
      {consent?.statistics ? (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "t3kivscorp");
          `}
        </Script>
      ) : null}
    </>
  )
}
