"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { getPageTypeFromPath, trackCtaClick } from "@/lib/tracking/client"

export function PageViewTracker() {
  const pathname = usePathname()
  const lastTracked = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || lastTracked.current === pathname) return
    const pageType = getPageTypeFromPath(pathname)
    if (pageType === "other" || pageType === "collection_page") return
    lastTracked.current = pathname
    trackCtaClick({ ctaLabel: 'page_view', pageType })
  }, [pathname])

  return null
}
