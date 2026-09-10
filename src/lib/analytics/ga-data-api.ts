import { createSign } from "node:crypto"

/**
 * Minimal GA4 Data API (`analyticsdata.googleapis.com`) client — service-account
 * JWT auth, no `googleapis` dependency. Mirrors the token flow in `src/lib/gsc.ts`
 * and reuses the same Google Cloud service account (fall back to the GSC creds if
 * a GA4-specific var isn't set).
 *
 * Required env: `GA4_PROPERTY_ID` (numeric, e.g. "123456789"), plus either
 * `GA4_SA_CREDENTIALS` or `GSC_SERVICE_ACCOUNT_CREDENTIALS` (service-account JSON).
 * The service account must have "Viewer" on the GA4 property.
 */

interface ServiceAccountCredentials {
  client_email: string
  private_key: string
}

const GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly"
const DATA_API_BASE = "https://analyticsdata.googleapis.com/v1beta"

export interface Ga4Config {
  propertyId: string
  credentials: ServiceAccountCredentials
}

export function getGa4Config(): Ga4Config | null {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim()
  const raw = process.env.GA4_SA_CREDENTIALS || process.env.GSC_SERVICE_ACCOUNT_CREDENTIALS
  if (!propertyId || !raw) return null
  try {
    const credentials = JSON.parse(raw) as ServiceAccountCredentials
    if (!credentials.client_email || !credentials.private_key) return null
    return { propertyId, credentials }
  } catch {
    return null
  }
}

export function isGa4Configured(): boolean {
  return getGa4Config() !== null
}

let tokenCache: { token: string; expiresAt: number } | null = null

function createJWT(email: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url")
  const payload = Buffer.from(
    JSON.stringify({
      iss: email,
      scope: GA4_SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  ).toString("base64url")
  const sign = createSign("RSA-SHA256")
  sign.update(`${header}.${payload}`)
  const sig = sign.sign(privateKey, "base64url")
  return `${header}.${payload}.${sig}`
}

async function getAccessToken(credentials: ServiceAccountCredentials): Promise<string> {
  const now = Date.now()
  if (tokenCache && tokenCache.expiresAt > now) return tokenCache.token

  const jwt = createJWT(credentials.client_email, credentials.private_key)
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  })
  if (!res.ok) throw new Error(`GA4 token exchange failed: ${res.status}`)
  const data = (await res.json()) as { access_token: string; expires_in: number }
  tokenCache = { token: data.access_token, expiresAt: now + (data.expires_in - 300) * 1000 }
  return tokenCache.token
}

// ---- Report request/response shapes (only the bits we use) --------------------

export interface GaDimension {
  name: string
}
export interface GaMetric {
  name: string
}
export interface GaStringFilter {
  fieldName: string
  stringFilter?: { value: string; matchType?: "EXACT" | "CONTAINS" | "BEGINS_WITH" }
  inListFilter?: { values: string[] }
}
export interface GaFilterExpression {
  filter?: GaStringFilter
  andGroup?: { expressions: GaFilterExpression[] }
  orGroup?: { expressions: GaFilterExpression[] }
}

export interface GaReportRequest {
  dateRanges: { startDate: string; endDate: string }[]
  dimensions?: GaDimension[]
  metrics: GaMetric[]
  dimensionFilter?: GaFilterExpression
  orderBys?: Array<
    | { metric: { metricName: string }; desc?: boolean }
    | { dimension: { dimensionName: string }; desc?: boolean }
  >
  limit?: number
  keepEmptyRows?: boolean
}

export interface GaReportRow {
  dimensionValues: { value: string }[]
  metricValues: { value: string }[]
}
export interface GaReport {
  dimensionHeaders?: { name: string }[]
  metricHeaders?: { name: string; type: string }[]
  rows?: GaReportRow[]
  rowCount?: number
}

/** Run a single report. Used as the per-request fallback when a batch 400s. */
async function runReport(
  config: Ga4Config,
  token: string,
  request: GaReportRequest,
): Promise<GaReport> {
  const res = await fetch(`${DATA_API_BASE}/properties/${config.propertyId}:runReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`GA4 runReport ${res.status}: ${detail.slice(0, 300)}`)
  }
  return (await res.json()) as GaReport
}

/** Run several reports in one HTTP round-trip (GA4 allows up to 5 per batch). */
export async function batchRunReports(requests: GaReportRequest[]): Promise<GaReport[]> {
  const config = getGa4Config()
  if (!config) throw new Error("GA4 not configured")

  const token = await getAccessToken(config.credentials)
  const results: GaReport[] = []

  for (let i = 0; i < requests.length; i += 5) {
    const slice = requests.slice(i, i + 5)
    const res = await fetch(
      `${DATA_API_BASE}/properties/${config.propertyId}:batchRunReports`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ requests: slice }),
      },
    )
    if (res.ok) {
      const data = (await res.json()) as { reports?: GaReport[] }
      results.push(...(data.reports ?? slice.map(() => ({}) as GaReport)))
      continue
    }

    const detail = await res.text().catch(() => "")
    // A 400 means one request in the batch is malformed (e.g. an unregistered
    // `customEvent:` dimension). GA4 fails the whole batch for one bad request,
    // so retry each one alone and drop only the offender — a missing widget
    // beats a dead dashboard. Other statuses (401/403/429/5xx) are batch-wide
    // and not worth re-hammering per request.
    if (res.status !== 400) {
      throw new Error(`GA4 batchRunReports ${res.status}: ${detail.slice(0, 300)}`)
    }
    const recovered = await Promise.all(
      slice.map(async (request) => {
        try {
          return await runReport(config, token, request)
        } catch (error) {
          console.error("[ga-data-api] dropping failed report:", error)
          return {} as GaReport
        }
      }),
    )
    results.push(...recovered)
  }

  return results
}

// ---- Small helpers for reading rows ------------------------------------------

/** First metric of a no-dimension report, as a number. */
export function scalar(report: GaReport | undefined, metricIndex = 0): number {
  const value = report?.rows?.[0]?.metricValues?.[metricIndex]?.value
  return value ? Number(value) || 0 : 0
}

/** `[{ key: dimensionValue, value: metricValue }]` for a single-dimension report. */
export function keyed(report: GaReport | undefined, metricIndex = 0): { key: string; value: number }[] {
  return (report?.rows ?? []).map((row) => ({
    key: row.dimensionValues?.[0]?.value ?? "(not set)",
    value: Number(row.metricValues?.[metricIndex]?.value) || 0,
  }))
}
