import {
  directoryCityNameToSlug,
  getUniqueDirectoryCityNames,
} from '@/lib/b2b-hub/directory-cities'
import { isAllowedHubLocationSlug } from '@/lib/hub-location-slugs'

export type B2bExpansionCity = {
  slug: string
  title: string
}

let cachedExpansionCities: readonly B2bExpansionCity[] | null = null
let cityBySlugCache: Map<string, B2bExpansionCity> | null = null

export function getB2bExpansionCities(): readonly B2bExpansionCity[] {
  if (cachedExpansionCities) {
    return cachedExpansionCities
  }
  cachedExpansionCities = getUniqueDirectoryCityNames()
    .map((name) => ({
      slug: directoryCityNameToSlug(name),
      title: name,
    }))
    .filter((city) => isAllowedHubLocationSlug(city.slug))
  return cachedExpansionCities
}

function getCityBySlugMap(): Map<string, B2bExpansionCity> {
  if (!cityBySlugCache) {
    cityBySlugCache = new Map(
      getB2bExpansionCities().map((city) => [city.slug, city] as const)
    )
  }
  return cityBySlugCache
}

const CQC_BLOCKED_EXPANSION_CITY_SLUGS = new Set(['cardiff', 'edinburgh', 'belfast'])

export const isExpansionCitySlug = (slug: string): boolean =>
  getCityBySlugMap().has(slug.trim().toLowerCase())

export const getExpansionCity = (slug: string): B2bExpansionCity | undefined =>
  getCityBySlugMap().get(slug.trim().toLowerCase())

export const getExpansionCityTitle = (slug: string): string =>
  getExpansionCity(slug)?.title ?? slug.replaceAll('-', ' ')

export const isCqcExpansionCitySlug = (slug: string): boolean => {
  const normalized = slug.trim().toLowerCase()
  return isExpansionCitySlug(normalized) && !CQC_BLOCKED_EXPANSION_CITY_SLUGS.has(normalized)
}

export function getCqcExpansionCities(): readonly B2bExpansionCity[] {
  return getB2bExpansionCities().filter((city) => isCqcExpansionCitySlug(city.slug))
}
