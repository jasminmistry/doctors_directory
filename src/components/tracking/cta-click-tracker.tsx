"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { rememberCurrentPath, trackCtaClick, getPageTypeFromPath } from "@/lib/tracking/client"

const CTA_KEYWORDS = [
  "request",
  "book",
  "contact",
  "learn more",
  "see all",
  "view all",
  "read all",
]

function normalizeLabel(text: string): string {
  return text.replace(/\s+/g, " ").trim()
}

function shouldTrackElement(pathname: string, element: HTMLElement): boolean {
  const pageType = getPageTypeFromPath(pathname)
  if (pageType === "other") return false

  if (element.dataset.trackCta === "true") return true

  const label = normalizeLabel(element.textContent || "").toLowerCase()
  if (!label) return false

  return CTA_KEYWORDS.some((keyword) => label.includes(keyword))
}

export function CtaClickTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return

      const clickable = target.closest("button, a") as HTMLElement | null
      if (!clickable || !shouldTrackElement(pathname, clickable)) return

      const label = normalizeLabel(clickable.textContent || "cta_click")
      const href =
        clickable instanceof HTMLAnchorElement ? clickable.href : clickable.getAttribute("href") || undefined

      trackCtaClick({
        ctaLabel: label,
        ctaTargetUrl: href,
      })
    }

    document.addEventListener("click", onClick)
    return () => {
      document.removeEventListener("click", onClick)
    }
  }, [pathname])

  useEffect(() => {
    if (pathname) {
      rememberCurrentPath(pathname)
    }
  }, [pathname])

  return null
}
