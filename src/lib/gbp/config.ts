// Central config + feature flags for the Google Business Profile connector.

export const GBP_ENABLED = process.env.GBP_ENABLED === 'true'
export const GBP_MOCK = process.env.GBP_MOCK === 'true'
export const GBP_REGION_CODE = process.env.GBP_REGION_CODE || 'GB'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
// Trailing slash required: next.config.js sets `trailingSlash: true`, and the OAuth
// client's Authorized redirect URIs are all registered with the slash (localhost +
// staging + prod). Any difference → OAuth error 400 redirect_uri_mismatch.
export const GBP_REDIRECT_URI = `${BASE_URL}/directory/api/portal/gbp/callback/`
console.log(`GBP_REDIRECT_URI=${GBP_REDIRECT_URI} (NB: must match OAuth client config)`)

export const GBP_SCOPE = 'https://www.googleapis.com/auth/business.manage'

export function gbpClientId(): string {
  const id = process.env.GBP_GOOGLE_CLIENT_ID
  if (!id) throw new Error('GBP_GOOGLE_CLIENT_ID is not set')
  return id
}

export function gbpClientSecret(): string {
  const secret = process.env.GBP_GOOGLE_CLIENT_SECRET
  if (!secret) throw new Error('GBP_GOOGLE_CLIENT_SECRET is not set')
  return secret
}

/** True when OAuth env is present (or mock mode is on). Used to gate the connect flow. */
export function isGbpOAuthConfigured(): boolean {
  if (GBP_MOCK) return true
  return !!process.env.GBP_GOOGLE_CLIENT_ID && !!process.env.GBP_GOOGLE_CLIENT_SECRET
}

// Google Business Profile API hosts
export const GBP_ACCOUNT_MGMT_BASE = 'https://mybusinessaccountmanagement.googleapis.com/v1'
export const GBP_BUSINESS_INFO_BASE = 'https://mybusinessbusinessinformation.googleapis.com/v1'
export const GBP_V4_BASE = 'https://mybusiness.googleapis.com/v4'
export const GBP_PLACE_ACTIONS_BASE = 'https://mybusinessplaceactions.googleapis.com/v1'
