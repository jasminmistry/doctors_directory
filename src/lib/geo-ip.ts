import geoip from 'geoip-lite'

/**
 * Resolves the originating client IP from proxy headers. nginx sets
 * `X-Real-IP` to `$remote_addr` on every /directory/ location, and falls back
 * to the first hop of `X-Forwarded-For` for setups that only set that one.
 */
export function getClientIp(headers: Headers): string | null {
  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) return first
  }

  return null
}

/**
 * Offline (no network call) IP -> country lookup, for origins that sit
 * behind neither Vercel nor a Cloudflare-proxied zone — so `x-vercel-ip-country`
 * and `cf-ipcountry` are never present on the request.
 */
export function lookupCountryFromIp(ip: string | null): string | null {
  if (!ip) return null
  // geoip-lite has no data for loopback/private ranges (local dev, health checks).
  const result = geoip.lookup(ip)
  return result?.country ?? null
}

export function lookupCountryFromRequest(headers: Headers): string | null {
  return lookupCountryFromIp(getClientIp(headers))
}
