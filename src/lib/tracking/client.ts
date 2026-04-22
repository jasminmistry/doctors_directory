"use client"

import type { CtaClickPayload, DirectoryPageType, LeadPayload } from "@/lib/tracking/types"

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

const PREV_PATH_KEY = "directory:previous-path"

export function getPageTypeFromPath(pathname: string): DirectoryPageType {
  const normalized = pathname.toLowerCase()

  if (normalized.includes("/practitioners/") && normalized.includes("/profile/")) {
    return "practitioner_page"
  }

  if (normalized.includes("/clinics/") && normalized.includes("/clinic/")) {
    return "clinic_page"
  }

  const isCollection =
    normalized.includes("/search") ||
    normalized.includes("/clinics") ||
    normalized.includes("/practitioners") ||
    normalized.includes("/products") ||
    normalized.includes("/treatments") ||
    normalized.includes("/accredited")

  return isCollection ? "collection_page" : "other"
}

function getApiPath(path: string): string {
  if (typeof window === "undefined") return path
  const withSlash = path.startsWith("/") ? path : `/${path}`
  const basePrefix = window.location.pathname.startsWith("/directory") ? "/directory" : ""
  return `${basePrefix}${withSlash}`
}

function getReferrer(): string {
  if (typeof window === "undefined") return "unknown"

  const previousPath = window.sessionStorage.getItem(PREV_PATH_KEY)
  if (previousPath) return previousPath

  return document.referrer || "direct"
}

export function rememberCurrentPath(pathname: string): void {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(PREV_PATH_KEY, pathname)
}

function fireGaEvent(eventName: "cta_click" | "lead_submitted", params: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return

  window.gtag("event", eventName, params)
}

export async function trackCtaClick({
  ctaLabel,
  ctaTargetUrl,
  pageUrl,
  pageType,
}: {
  ctaLabel: string
  ctaTargetUrl?: string
  pageUrl?: string
  pageType?: DirectoryPageType
}): Promise<void> {
  if (typeof window === "undefined") return

  const resolvedUrl = pageUrl || window.location.href
  const resolvedType = pageType || getPageTypeFromPath(window.location.pathname)

  const payload: CtaClickPayload = {
    timestamp: new Date().toISOString(),
    pageUrl: resolvedUrl,
    pageType: resolvedType,
    referrer: getReferrer(),
    ctaLabel,
    ctaTargetUrl,
  }

  fireGaEvent("cta_click", {
    cta_label: ctaLabel,
    page_type: resolvedType,
    page_url: resolvedUrl,
  })

  try {
    await fetch(getApiPath("/api/tracking/events"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  } catch {
    // Non-blocking: analytics failures should not affect UX.
  }
}

export async function submitLead(input: {
  name: string
  contact: string
  treatment?: string
  location?: string
  budget?: string
  pageUrl?: string
  pageType?: DirectoryPageType
}): Promise<boolean> {
  if (typeof window === "undefined") return false

  const resolvedUrl = input.pageUrl || window.location.href
  const resolvedType = input.pageType || getPageTypeFromPath(window.location.pathname)

  const payload: LeadPayload = {
    timestamp: new Date().toISOString(),
    pageUrl: resolvedUrl,
    pageType: resolvedType,
    referrer: getReferrer(),
    name: input.name.trim(),
    contact: input.contact.trim(),
    treatment: input.treatment?.trim() || undefined,
    location: input.location?.trim() || undefined,
    budget: input.budget?.trim() || undefined,
  }

  fireGaEvent("lead_submitted", {
    page_type: resolvedType,
    page_url: resolvedUrl,
    treatment: payload.treatment || "",
    location: payload.location || "",
  })

  try {
    const response = await fetch(getApiPath("/api/tracking/leads"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    return response.ok
  } catch {
    return false
  }
}
