import { readJsonFileSync } from '@/lib/json-cache'
import { P0_TREATMENT_CITY_HUB_CITIES } from '@/lib/treatment-hub-cities'
import { toUrlSlug } from '@/lib/utils'
import type { City } from '@/lib/types'

const BLOCKED_LOCATION_SLUGS = new Set([
  'boxstart',
  'east',
  'latchmeads',
  'north',
  'south',
  'st',
  'west',
])

const MIN_HUB_LOCATION_SLUG_LENGTH = 4

let allowedSlugCache: Set<string> | null = null

const buildAllowedSlugSet = (): Set<string> => {
  const allowed = new Set<string>()

  for (const city of P0_TREATMENT_CITY_HUB_CITIES) {
    allowed.add(toUrlSlug(city))
  }

  for (const entry of readJsonFileSync<City[]>('city_data_processed.json')) {
    const city = entry.City?.trim()
    if (city) {
      allowed.add(toUrlSlug(city))
    }
  }

  return allowed
}

const getAllowedSlugSet = (): Set<string> => {
  if (!allowedSlugCache) {
    allowedSlugCache = buildAllowedSlugSet()
  }
  return allowedSlugCache
}

export const isBlockedHubLocationSlug = (locationSlug: string): boolean => {
  const slug = locationSlug.trim().toLowerCase()
  if (!slug || slug.length < MIN_HUB_LOCATION_SLUG_LENGTH) {
    return true
  }
  return BLOCKED_LOCATION_SLUGS.has(slug)
}

export const isAllowedHubLocationSlug = (locationSlug: string): boolean => {
  const slug = locationSlug.trim().toLowerCase()
  if (isBlockedHubLocationSlug(slug)) {
    return false
  }
  return getAllowedSlugSet().has(slug)
}

export const filterAllowedHubLocationSlug = (locationSlug: string): string | null =>
  isAllowedHubLocationSlug(locationSlug) ? locationSlug.trim().toLowerCase() : null
