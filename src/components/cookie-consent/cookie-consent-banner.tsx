"use client"

import { useEffect, useState } from "react"
import { Cookie, X } from "lucide-react"

import { Switch } from "@/components/ui/switch"
import { readCookieConsent, writeCookieConsent } from "@/lib/cookie-consent"

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
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)

  useEffect(() => {
    if (!readCookieConsent()) {
      setOpen(true)
    }
  }, [])

  function persist(analytics: boolean) {
    writeCookieConsent(analytics)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Manage Consent"
      className="animate-in slide-in-from-bottom-8 fade-in-0 fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-md rounded-2xl border-2 border-[var(--dune)]/20 bg-[var(--primary-bg-color)] p-6 shadow-[0_12px_40px_rgb(38_36_34_/_25%)] duration-500"
    >
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close"
        className="absolute right-4 top-4 text-[var(--dune)] opacity-70 transition hover:opacity-100 cursor-pointer"
      >
        <X className="size-4" />
      </button>

      {view === "banner" ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--dune)]">
              <Cookie className="size-5 text-[var(--primary-bg-color)]" />
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
            <button type="button" onClick={() => persist(true)} className={primaryButton}>
              Accept
            </button>
            <button type="button" onClick={() => persist(false)} className={outlineButton}>
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

          <div className="flex flex-col divide-y divide-[var(--alto)]">
            <div className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-[var(--dune)]">Necessary</p>
                <p className="text-sm text-[var(--grey)]">
                  Required for the site to function. Always active.
                </p>
              </div>
              <Switch checked disabled className="mt-1" />
            </div>
            <div className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-[var(--dune)]">Analytics</p>
                <p className="text-sm text-[var(--grey)]">
                  Helps us understand how visitors use the site so we can improve
                  it.
                </p>
              </div>
              <Switch
                checked={analyticsEnabled}
                onCheckedChange={setAnalyticsEnabled}
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
              onClick={() => persist(analyticsEnabled)}
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
