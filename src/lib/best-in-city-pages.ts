import { resolveTreatmentHubSlug } from '@/lib/treatment-hub-registry'
import {
  getTreatmentCityHubClinics,
  getTreatmentCityHubEntries,
  getTreatmentCityHubEntry,
} from '@/lib/treatment-city-hub'
import type { Clinic } from '@/lib/types'

const MIN_CLINICS = 3

export type BestInCityEntry = {
  slug: string
  treatmentSlug: string
  treatmentName: string
  locationSlug: string
  locationLabel: string
  clinicCount: number
}

export const buildBestInCitySlug = (treatmentSlug: string, locationSlug: string): string =>
  `best-${treatmentSlug}-clinics-${locationSlug}`

export const parseBestInCitySlug = (
  slug: string
): { treatmentSlug: string; locationSlug: string } | null => {
  const prefix = 'best-'
  const suffix = '-clinics-'
  if (!slug.startsWith(prefix) || !slug.includes(suffix)) {
    return null
  }
  const body = slug.slice(prefix.length)
  const splitIndex = body.lastIndexOf(suffix)
  if (splitIndex <= 0) {
    return null
  }
  const treatmentSlug = body.slice(0, splitIndex)
  const locationSlug = body.slice(splitIndex + suffix.length)
  if (!treatmentSlug || !locationSlug) {
    return null
  }
  return { treatmentSlug, locationSlug }
}

let cachedBestInCityEntries: BestInCityEntry[] | null = null

export const getBestInCityEntries = (): BestInCityEntry[] => {
  if (cachedBestInCityEntries) {
    return cachedBestInCityEntries
  }

  const entries: BestInCityEntry[] = []
  const seen = new Set<string>()

  for (const hub of getTreatmentCityHubEntries()) {
    if (hub.clinicCount < MIN_CLINICS) {
      continue
    }
    const slug = buildBestInCitySlug(hub.treatmentSlug, hub.locationSlug)
    if (seen.has(slug)) {
      continue
    }
    seen.add(slug)
    entries.push({
      slug,
      treatmentSlug: hub.treatmentSlug,
      treatmentName: hub.treatmentName,
      locationSlug: hub.locationSlug,
      locationLabel: hub.locationLabel,
      clinicCount: hub.clinicCount,
    })
  }

  cachedBestInCityEntries = entries.sort((left, right) => {
    if (left.treatmentSlug === right.treatmentSlug) {
      return left.locationSlug.localeCompare(right.locationSlug)
    }
    return left.treatmentSlug.localeCompare(right.treatmentSlug)
  })

  return cachedBestInCityEntries
}

const normalizeBestInCitySlug = (slug: string): string =>
  slug.replace('polynucleotide-treatment', 'polynucleotides')

export const getBestInCityEntry = (slug: string): BestInCityEntry | null => {
  const parsed = parseBestInCitySlug(normalizeBestInCitySlug(slug))
  if (!parsed) {
    return null
  }
  const treatmentSlug = resolveTreatmentHubSlug(parsed.treatmentSlug)
  const hub = getTreatmentCityHubEntry(treatmentSlug, parsed.locationSlug)
  if (!hub || hub.clinicCount < MIN_CLINICS) {
    return null
  }
  return {
    slug: buildBestInCitySlug(hub.treatmentSlug, hub.locationSlug),
    treatmentSlug: hub.treatmentSlug,
    treatmentName: hub.treatmentName,
    locationSlug: hub.locationSlug,
    locationLabel: hub.locationLabel,
    clinicCount: hub.clinicCount,
  }
}

export const getBestInCityClinics = (treatmentSlug: string, locationSlug: string): Clinic[] =>
  getTreatmentCityHubClinics(treatmentSlug, locationSlug)
