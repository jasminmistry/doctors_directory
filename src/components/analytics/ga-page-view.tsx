"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

import { getSourceBucket } from "@/lib/attribution"
import { getPageTypeFromPath } from "@/lib/tracking/client"

/** `/london/clinic/glow-aesthetics/` → `glow-aesthetics`; profile pages likewise. */
function getEntitySlugFromPath(pathname: string): string | undefined {
  const m = pathname.toLowerCase().match(/\/(?:clinic|profile)\/([a-z0-9-]+)/)
  return m?.[1]
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * GA4 `page_view` for App Router client-side navigations.
 *
 * The initial hard-load page_view is still sent by `gtag('config', …)` itself —
 * resilient, with no dependency on this component mounting. This only covers the
 * SPA navigations that `config` misses, enriched with `source_bucket` /
 * `page_type` / `entity_slug`. On first mount it `gtag('set', …)`s those
 * dimensions (best-effort) so the config-sent page_view and later events carry
 * them too. `page_title` is deliberately omitted — App Router hasn't applied the
 * new <title> yet when this effect runs, so GA reading it at send time is more
 * accurate than a stale value from here.
 */
export function GaPageView() {
  const pathname = usePathname()
  const isFirst = useRef(true)

  useEffect(() => {
    if (!pathname || typeof window === "undefined" || typeof window.gtag !== "function") return

    const params = {
      source_bucket: getSourceBucket(pathname),
      page_type: getPageTypeFromPath(pathname),
      entity_slug: getEntitySlugFromPath(pathname),
    }

    try {
      if (isFirst.current) {
        isFirst.current = false
        // `config` already sent (or queued) the first page_view — just make the
        // enrichment dimensions available rather than sending a duplicate.
        window.gtag("set", params)
        return
      }
      window.gtag("event", "page_view", {
        ...params,
        page_path: pathname,
        page_location: window.location.href,
      })
    } catch {
      /* never break navigation over analytics */
    }
  }, [pathname])

  return null
}
