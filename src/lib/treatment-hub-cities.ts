import {
  directoryCityNameToSlug,
  getUniqueDirectoryCityNames,
} from '@/lib/b2b-hub/directory-cities'
import { isAllowedHubLocationSlug } from '@/lib/hub-location-slugs'
import { mandatoryTreatmentHubMatrixSlugs } from '@/lib/treatment-hub-registry'
import { toUrlSlug } from '@/lib/utils'

export const P0_TREATMENT_CITY_HUB_TREATMENTS = [
  'Botox',
  'Profhilo',
  'Polynucleotides',
  'Fillers',
  'Chemical Peel',
  'Micro-needling',
  'Ipl Treatment',
  'Acne',
  'HIFU',
  'Microneedling With Radiofrequency',
  'Morpheus8',
] as const

export const P0_TREATMENT_CITY_HUB_CITIES = [
  'London',
  'Manchester',
  'Birmingham',
  'Leeds',
  'Glasgow',
  'Edinburgh',
  'Bristol',
  'Liverpool',
  'Newcastle',
  'Sheffield',
  'Nottingham',
  'Leicester',
  'Cardiff',
  'Belfast',
  'Southampton',
  'Brighton',
  'Reading',
  'Cambridge',
  'Oxford',
  'Norwich',
] as const

let cachedMatrixCities: readonly string[] | null = null
let cachedMatrixSlugs: string[] | null = null

export function getTreatmentHubMatrixCities(): readonly string[] {
  if (cachedMatrixCities) {
    return cachedMatrixCities
  }
  cachedMatrixCities = getUniqueDirectoryCityNames().filter((name) =>
    isAllowedHubLocationSlug(directoryCityNameToSlug(name))
  )
  return cachedMatrixCities
}

export function getTreatmentHubMatrixSlugs(): string[] {
  if (cachedMatrixSlugs) {
    return cachedMatrixSlugs
  }
  const slugs = new Set<string>()
  for (const name of P0_TREATMENT_CITY_HUB_TREATMENTS) {
    slugs.add(toUrlSlug(name))
  }
  for (const slug of mandatoryTreatmentHubMatrixSlugs()) {
    slugs.add(slug)
  }
  cachedMatrixSlugs = [...slugs].sort()
  return cachedMatrixSlugs
}

export function isTreatmentHubMatrixSlug(slug: string): boolean {
  const normalized = slug.trim().toLowerCase()
  return getTreatmentHubMatrixSlugs().includes(normalized)
}
