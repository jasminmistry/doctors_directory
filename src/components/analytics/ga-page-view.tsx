"use client"

import { useEffect } from "react"
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
 * The single source of GA4 `page_view` events. Auto page_view is disabled in the
 * gtag config (`send_page_view: false`) because App Router client navigations
 * don't trigger it — this fires on first mount and on every pathname change,
 * enriched with `source_bucket` and `page_type` so GA reports can slice by them.
 */
export function GaPageView() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || typeof window === "undefined" || typeof window.gtag !== "function") return
    try {
      window.gtag("event", "page_view", {
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title,
        source_bucket: getSourceBucket(pathname),
        page_type: getPageTypeFromPath(pathname),
        entity_slug: getEntitySlugFromPath(pathname),
      })
    } catch {
      /* never break navigation over analytics */
    }
  }, [pathname])

  return null
}
