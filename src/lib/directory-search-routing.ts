import { getServiceCityEntry } from '@/lib/directory-seo-pages'
import { getTreatmentCityHubEntry } from '@/lib/treatment-city-hub'

const RESERVED_ROOT_SEGMENTS = new Set([
  'admin',
  'api',
  'business',
  'claim',
  'clinics',
  'events',
  'features',
  'portal',
  'practitioners',
  'products',
  'search',
  'treatments',
  'accredited',
  'verify',
  'register',
  'account',
  'sitemap',
])

/** Two-segment paths like /beautician/london/ must exist as SSR pages or fall back to city clinics. */
export function ensureServiceCityHrefExists(href: string): string {
  const match = href.match(/^\/([^/]+)\/([^/]+)\/$/)
  if (!match) return href

  const [, slug, citySlug] = match
  if (RESERVED_ROOT_SEGMENTS.has(slug)) return href

  if (
    getServiceCityEntry(slug, citySlug) ||
    getTreatmentCityHubEntry(slug, citySlug)
  ) {
    return href
  }

  return `/clinics/${citySlug}/`
}
