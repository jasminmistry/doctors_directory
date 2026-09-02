/**
 * First-touch attribution for Consentz business sign-ups.
 *
 * A visitor's first page load writes the `dd_attr` cookie (see
 * `src/components/tracking/attribution-tracker.tsx`). When they later claim or
 * register a listing, the claim wizard reads it back and sends it to
 * `/api/claim/initiate`, which persists it on the `ClaimRequest` and — on admin
 * approval — forwards the source bucket to Consentz Core.
 *
 * This module is isomorphic: the bucket rule and cookie codec are shared by the
 * client tracker, the server-side fallback in the initiate route, and the admin
 * dashboards. No browser-only APIs here.
 */

export const ATTR_COOKIE_NAME = "dd_attr"
export const ATTR_COOKIE_PATH = "/directory"
export const ATTR_MAX_AGE_SECONDS = 180 * 24 * 60 * 60 // 180 days, first-touch

export const SOURCE_BUCKETS = ["home", "blog", "business_hub", "directory"] as const
export type SourceBucket = (typeof SOURCE_BUCKETS)[number]

export interface Attribution {
  source: SourceBucket | null
  landingPage: string | null
  referrer: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
}

/** Compact on-the-wire shape actually stored in the cookie (keeps it small). */
interface AttrCookie {
  s?: string
  lp?: string
  rf?: string
  us?: string
  um?: string
  uc?: string
  t?: string
}

function clamp(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : null
}

/**
 * Strip the `/directory` base path and any trailing slash, lower-case, so the
 * bucket rule works whether it's handed a raw `window.location.pathname`
 * (which includes `/directory`) or an already-clean app path.
 */
export function normalizeAppPath(pathname: string): string {
  let p = (pathname || "/").toLowerCase().split("?")[0].split("#")[0]
  if (p === "/directory") return "/"
  if (p.startsWith("/directory/")) p = p.slice("/directory".length)
  if (!p.startsWith("/")) p = `/${p}`
  if (p.length > 1) p = p.replace(/\/+$/, "") || "/"
  return p
}

/** Map a landing path to one of the four source buckets. Single source of truth. */
export function getSourceBucket(pathname: string): SourceBucket {
  const p = normalizeAppPath(pathname)

  if (p === "/" || p === "/features" || p === "/register" || p.startsWith("/register/")) {
    return "home"
  }
  if (p === "/business" || p.startsWith("/business/")) {
    return "business_hub"
  }
  if (p.startsWith("/blog") || p.startsWith("/guides") || p.startsWith("/articles")) {
    return "blog"
  }
  return "directory"
}

function isSourceBucket(value: unknown): value is SourceBucket {
  return typeof value === "string" && (SOURCE_BUCKETS as readonly string[]).includes(value)
}

/** Decode the `dd_attr` cookie value into a normalised {@link Attribution}. */
export function parseAttrCookie(raw: string | null | undefined): Attribution | null {
  if (!raw) return null
  let decoded: string
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    decoded = raw
  }
  let obj: AttrCookie
  try {
    obj = JSON.parse(decoded) as AttrCookie
  } catch {
    return null
  }
  if (!obj || typeof obj !== "object") return null

  return {
    source: isSourceBucket(obj.s) ? obj.s : null,
    landingPage: clamp(obj.lp, 512),
    referrer: clamp(obj.rf, 512),
    utmSource: clamp(obj.us, 128),
    utmMedium: clamp(obj.um, 128),
    utmCampaign: clamp(obj.uc, 191),
  }
}

/** Serialise an {@link Attribution} to the compact cookie value (URI-encoded). */
export function serializeAttrCookie(a: Attribution): string {
  const obj: AttrCookie = { t: new Date().toISOString() }
  if (a.source) obj.s = a.source
  if (a.landingPage) obj.lp = a.landingPage.slice(0, 512)
  if (a.referrer) obj.rf = a.referrer.slice(0, 512)
  if (a.utmSource) obj.us = a.utmSource.slice(0, 128)
  if (a.utmMedium) obj.um = a.utmMedium.slice(0, 128)
  if (a.utmCampaign) obj.uc = a.utmCampaign.slice(0, 191)
  return encodeURIComponent(JSON.stringify(obj))
}

/** DB column shape — `null` for every field when there's nothing to record. */
export interface AttributionColumns {
  attributionSource: string | null
  attributionLandingPage: string | null
  attributionReferrer: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
}

export function toAttributionColumns(a: Attribution | null): AttributionColumns {
  return {
    attributionSource: a?.source ?? null,
    attributionLandingPage: a?.landingPage ?? null,
    attributionReferrer: a?.referrer ?? null,
    utmSource: a?.utmSource ?? null,
    utmMedium: a?.utmMedium ?? null,
    utmCampaign: a?.utmCampaign ?? null,
  }
}

const SOURCE_LABELS: Record<SourceBucket, string> = {
  home: "Home",
  blog: "Blog / guides",
  business_hub: "Business Hub",
  directory: "Directory",
}

export function sourceBucketLabel(value: string | null | undefined): string {
  if (isSourceBucket(value)) return SOURCE_LABELS[value]
  return "Unknown"
}
