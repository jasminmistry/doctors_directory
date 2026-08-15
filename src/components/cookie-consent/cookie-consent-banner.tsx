"use client"

import { useEffect, useState } from "react"

import { Switch } from "@/components/ui/switch"
import {
  COOKIE_CONSENT_OPEN_EVENT,
  readCookieConsent,
  writeCookieConsent,
} from "@/lib/cookie-consent"
import { IconCookie, IconX } from "@tabler/icons-react"

const MARKETING_BASE_URL =
  process.env.NEXT_PUBLIC_MARKETING_BASE_URL || "https://www.consentz.com"

type View = "banner" | "preferences"

const buttonBase =
  "rounded-lg px-4 py-2.5 text-sm font-medium transition cursor-pointer"
const primaryButton = `${buttonBase} bg-[var(--dune)] text-white hover:opacity-90`
const outlineButton = `${buttonBase} border border-[var(--alto)] bg-transparent text-[var(--dune)] hover:bg-white`

export function CookieConsentBanner() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>("banner")
  // GDPR requires opt-in, not opt-out: non-essential categories default to
  // off unless the visitor previously chose otherwise.
  const [statisticsEnabled, setStatisticsEnabled] = useState(false)
  const [marketingEnabled, setMarketingEnabled] = useState(false)

  useEffect(() => {
    const existing = readCookieConsent()
    if (existing) {
      setStatisticsEnabled(existing.statistics)
      setMarketingEnabled(existing.marketing)
    } else {
      setOpen(true)
    }

    function onOpenRequest() {
      const current = readCookieConsent()
      setStatisticsEnabled(current?.statistics ?? false)
      setMarketingEnabled(current?.marketing ?? false)
      setView("preferences")
      setOpen(true)
    }

    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpenRequest)
    return () => window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpenRequest)
  }, [])

  function persist(preferences: { statistics: boolean; marketing: boolean }) {
    const previous = readCookieConsent()
    writeCookieConsent(preferences)
    setOpen(false)

    // Statistics/marketing scripts that were already granted (e.g. Microsoft
    // Clarity) can't be un-injected mid-session, so force a reload to fully
    // stop them when the visitor withdraws consent.
    const downgraded =
      (previous?.statistics && !preferences.statistics) ||
      (previous?.marketing && !preferences.marketing)
    if (downgraded) {
      window.location.reload()
    }
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Manage Consent"
      className="animate-in slide-in-from-bottom-8 fade-in-0 fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-md rounded-lg border-2 border-[var(--dune)]/20 bg-[var(--primary-bg-color)] p-6 shadow-[0_12px_40px_rgb(38_36_34_/_25%)] duration-500"
    >
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close"
        className="absolute right-4 top-4 text-[var(--dune)] opacity-70 transition hover:opacity-100 cursor-pointer"
      >
        <IconX stroke={1.5} className="size-4" />
      </button>

      {view === "banner" ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--dune)]">
              <IconCookie stroke={1.5} className="size-5 stroke-white" />
            </span>
            <h2 className="font-playfair text-xl font-semibold text-[var(--dune)]">
              Manage Consent
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-[var(--grey)]">
            To provide the best experiences, we use technologies like cookies to
            store and/or access device information. Consenting to these
            technologies will allow us to process data such as browsing behaviour
            or unique IDs on this site. Not consenting or withdrawing consent, may
            adversely affect certain features and functions. Click here to read our{" "}
            <a
              href={`${MARKETING_BASE_URL}/terms/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--dune)] underline hover:opacity-70"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href={`${MARKETING_BASE_URL}/privacy-policy/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--dune)] underline hover:opacity-70"
            >
              Privacy Policy
            </a>
            .
          </p>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => persist({ statistics: true, marketing: true })}
              className={primaryButton}
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => persist({ statistics: false, marketing: false })}
              className={outlineButton}
            >
              Deny
            </button>
            <button
              type="button"
              onClick={() => setView("preferences")}
              className={outlineButton}
            >
              View preferences
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <h2 className="font-playfair text-xl font-semibold text-[var(--dune)]">
            Cookie Preferences
          </h2>

          <div className="flex max-h-80 flex-col divide-y divide-[var(--alto)] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-[var(--dune)]">Necessary</p>
                <p className="text-sm text-[var(--grey)]">
                  Strictly necessary for the site to function, such as remembering
                  your consent choices. Always active.
                </p>
              </div>
              <Switch checked disabled className="mt-1" />
            </div>
            <div className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-[var(--dune)]">Statistics</p>
                <p className="text-sm text-[var(--grey)]">
                  Used exclusively for anonymous, aggregated statistical purposes
                  to help us understand how visitors use the site and improve it.
                </p>
              </div>
              <Switch
                checked={statisticsEnabled}
                onCheckedChange={setStatisticsEnabled}
                aria-label="Statistics cookies"
                className="mt-1"
              />
            </div>
            <div className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-[var(--dune)]">Marketing</p>
                <p className="text-sm text-[var(--grey)]">
                  Used to track visitors across sites to display adverts that are
                  relevant and engaging, and to measure their performance.
                </p>
              </div>
              <Switch
                checked={marketingEnabled}
                onCheckedChange={setMarketingEnabled}
                aria-label="Marketing cookies"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => setView("banner")} className={outlineButton}>
              Back
            </button>
            <button
              type="button"
              onClick={() =>
                persist({ statistics: statisticsEnabled, marketing: marketingEnabled })
              }
              className={primaryButton}
            >
              Save preferences
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
