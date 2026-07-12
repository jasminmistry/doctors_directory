import { createSign } from 'node:crypto'

interface ServiceAccountCredentials {
  client_email: string
  private_key: string
}

export interface GSCKeyword {
  keyword: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface GSCData {
  impressions: number
  clicks: number
  avgPosition: number
  topKeywords: GSCKeyword[]
}

function getCredentials(): ServiceAccountCredentials | null {
  const raw = process.env.GSC_SERVICE_ACCOUNT_CREDENTIALS
  if (!raw) return null
  try {
    return JSON.parse(raw) as ServiceAccountCredentials
  } catch {
    return null
  }
}

let tokenCache: { token: string; expiresAt: number } | null = null

function createJWT(email: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claimsPayload = Buffer.from(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url')
  const sign = createSign('RSA-SHA256')
  sign.update(`${header}.${claimsPayload}`)
  const sig = sign.sign(privateKey, 'base64url')
  return `${header}.${claimsPayload}.${sig}`
}

async function getAccessToken(credentials: ServiceAccountCredentials): Promise<string> {
  const now = Date.now()
  if (tokenCache && tokenCache.expiresAt > now) return tokenCache.token

  const jwt = createJWT(credentials.client_email, credentials.private_key)
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  if (!res.ok) throw new Error(`GSC token exchange failed: ${res.status}`)
  const data = await res.json() as { access_token: string; expires_in: number }
  // Cache for 55 minutes (tokens are valid 60 min; 5-min buffer for clock skew)
  tokenCache = { token: data.access_token, expiresAt: now + (data.expires_in - 300) * 1000 }
  return tokenCache.token
}

interface GSCRow {
  keys?: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export async function fetchGSCMetrics(params: {
  pagePathFragment: string
  startDate: string
  endDate: string
}): Promise<GSCData | null> {
  const credentials = getCredentials()
  const siteUrl = process.env.GSC_SITE_URL
  if (!credentials || !siteUrl) return null

  try {
    const token = await getAccessToken(credentials)
    const apiBase = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`
    const authHeader = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

    const pageFilter = {
      dimension: 'page',
      operator: 'contains',
      expression: params.pagePathFragment,
    }
    const base = {
      startDate: params.startDate,
      endDate: params.endDate,
      dimensionFilterGroups: [{ filters: [pageFilter] }],
    }

    const [summaryRes, keywordsRes] = await Promise.all([
      fetch(apiBase, { method: 'POST', headers: authHeader, body: JSON.stringify({ ...base, dimensions: [] }) }),
      fetch(apiBase, {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({
          ...base,
          dimensions: ['query'],
          rowLimit: 10,
          orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }],
        }),
      }),
    ])

    const [summaryData, keywordsData] = await Promise.all([
      summaryRes.json() as Promise<{ rows?: GSCRow[] }>,
      keywordsRes.json() as Promise<{ rows?: GSCRow[] }>,
    ])

    const row = summaryData.rows?.[0]
    return {
      clicks: row?.clicks ?? 0,
      impressions: row?.impressions ?? 0,
      avgPosition: row?.position ?? 0,
      topKeywords: (keywordsData.rows ?? []).map((r) => ({
        keyword: r.keys?.[0] ?? '',
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
      })),
    }
  } catch (err) {
    console.error('[gsc] failed to fetch metrics:', err)
    return null
  }
}
