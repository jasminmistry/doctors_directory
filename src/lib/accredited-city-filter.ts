import { getCityRegulator } from '@/lib/b2b-hub/city-regulator'
import { toUrlSlug } from '@/lib/utils'

const CQC_BLOCKED_CITY_SLUGS = new Set([
  'cardiff',
  'edinburgh',
  'llandudno',
  'wrexham',
  'emcrf',
  'uk',
])

export const isAllowedCqcAccreditedCity = (city: string): boolean => {
  const slug = toUrlSlug(city)
  if (!slug || slug.length < 3 || CQC_BLOCKED_CITY_SLUGS.has(slug)) {
    return false
  }
  return getCityRegulator(slug) === 'CQC'
}

export const filterCqcAccreditedCities = (cities: string[]): string[] =>
  cities.filter(isAllowedCqcAccreditedCity)

