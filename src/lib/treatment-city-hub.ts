import { search_categories, locations } from '@/lib/data'
import { readJsonFileSync } from '@/lib/json-cache'
import { getProductsForTreatment } from '@/lib/treatment-product-match'
import { getClinics, getEnrichedPractitioners } from '@/lib/sitemap-data'
import {
  getTreatmentHubDisplayName,
  matchClinicTreatmentToHubSlug,
  resolveTreatmentHubSlug,
  TREATMENT_HUB_SLUGS,
} from '@/lib/treatment-hub-registry'
import { treatmentMatchesSlug } from '@/lib/treatment-match'
import { isAllowedHubLocationSlug } from '@/lib/hub-location-slugs'
import {
  getTreatmentHubMatrixCities,
  getTreatmentHubMatrixSlugs,
  P0_TREATMENT_CITY_HUB_TREATMENTS,
} from '@/lib/treatment-hub-cities'
import { toUrlSlug } from '@/lib/utils'
import type { Clinic, Product } from '@/lib/types'

export {
  getTreatmentHubMatrixCities,
  P0_TREATMENT_CITY_HUB_CITIES,
  P0_TREATMENT_CITY_HUB_TREATMENTS,
} from '@/lib/treatment-hub-cities'

const MIN_HUB_LISTINGS = 1

const searchCategorySlugs = new Set(search_categories.map((label) => toUrlSlug(label)))

const locationBySlug = new Map(locations.map((label) => [toUrlSlug(label), label]))

const treatmentContent = readJsonFileSync<Record<string, Record<string, unknown>>>('treatments.json')

const treatmentNameBySlug = new Map<string, string>()

for (const name of Object.keys(treatmentContent)) {
  const slug = toUrlSlug(name)
  if (!searchCategorySlugs.has(slug)) {
    treatmentNameBySlug.set(slug, name)
  }
}

for (const name of P0_TREATMENT_CITY_HUB_TREATMENTS) {
  const slug = toUrlSlug(name)
  if (!searchCategorySlugs.has(slug)) {
    treatmentNameBySlug.set(slug, name)
  }
}

for (const config of TREATMENT_HUB_SLUGS) {
  if (!searchCategorySlugs.has(config.slug)) {
    treatmentNameBySlug.set(
      config.slug,
      config.treatmentsJsonKey ?? config.displayName
    )
  }
}

export type TreatmentCityHubEntry = {
  treatmentSlug: string
  treatmentName: string
  locationSlug: string
  locationLabel: string
  clinicCount: number
  practitionerCount: number
  listingCount: number
}

export const isReservedTreatmentHubSlug = (slug: string): boolean =>
  searchCategorySlugs.has(slug)

export const getTreatmentNameForHubSlug = (slug: string): string | null => {
  const canonical = resolveTreatmentHubSlug(slug)
  return (
    treatmentNameBySlug.get(canonical) ??
    getTreatmentHubDisplayName(canonical) ??
    null
  )
}

const matchesCitySlug = (city: string | undefined, locationSlug: string): boolean =>
  toUrlSlug(city ?? '') === locationSlug

type ListingCounts = { clinicCount: number; practitionerCount: number }

let cachedListingIndex: Map<string, ListingCounts> | null = null
let cachedHubEntries: TreatmentCityHubEntry[] | null = null

const buildListingIndex = (): Map<string, ListingCounts> => {
  const index = new Map<string, ListingCounts>()

  const bump = (treatmentSlug: string, locationSlug: string, field: keyof ListingCounts) => {
    if (
      isReservedTreatmentHubSlug(treatmentSlug) ||
      !locationBySlug.has(locationSlug) ||
      !isAllowedHubLocationSlug(locationSlug)
    ) {
      return
    }
    if (!treatmentNameBySlug.has(treatmentSlug)) {
      return
    }
    const key = `${treatmentSlug}|${locationSlug}`
    const existing = index.get(key) ?? { clinicCount: 0, practitionerCount: 0 }
    existing[field] += 1
    index.set(key, existing)
  }

  const bumpTreatmentLabel = (
    treatment: string,
    locationSlug: string,
    field: keyof ListingCounts
  ) => {
    const hubSlug = matchClinicTreatmentToHubSlug(treatment)
    if (hubSlug) {
      bump(hubSlug, locationSlug, field)
      return
    }
    bump(toUrlSlug(treatment), locationSlug, field)
  }

  for (const clinic of getClinics()) {
    const locationSlug = toUrlSlug(clinic.City ?? '')
    for (const treatment of clinic.Treatments ?? []) {
      bumpTreatmentLabel(treatment, locationSlug, 'clinicCount')
    }
  }

  for (const practitioner of getEnrichedPractitioners()) {
    const locationSlug = toUrlSlug(practitioner.City ?? '')
    for (const treatment of practitioner.Treatments ?? []) {
      bumpTreatmentLabel(treatment, locationSlug, 'practitionerCount')
    }
  }

  return index
}

const getListingIndex = (): Map<string, ListingCounts> => {
  if (!cachedListingIndex) {
    cachedListingIndex = buildListingIndex()
  }
  return cachedListingIndex
}

export const countTreatmentCityListings = (
  treatmentSlug: string,
  locationSlug: string
): ListingCounts => {
  return getListingIndex().get(`${treatmentSlug}|${locationSlug}`) ?? {
    clinicCount: 0,
    practitionerCount: 0,
  }
}

export const getTreatmentCityHubEntry = (
  treatmentSlug: string,
  locationSlug: string
): TreatmentCityHubEntry | null => {
  const canonicalSlug = resolveTreatmentHubSlug(treatmentSlug)
  if (isReservedTreatmentHubSlug(canonicalSlug)) {
    return null
  }
  const treatmentName = getTreatmentNameForHubSlug(canonicalSlug)
  const locationLabel = locationBySlug.get(locationSlug)
  if (!treatmentName || !locationLabel || !isAllowedHubLocationSlug(locationSlug)) {
    return null
  }
  const { clinicCount, practitionerCount } = countTreatmentCityListings(
    canonicalSlug,
    locationSlug
  )
  const listingCount = clinicCount + practitionerCount
  if (listingCount < MIN_HUB_LISTINGS) {
    return null
  }
  return {
    treatmentSlug: canonicalSlug,
    treatmentName,
    locationSlug,
    locationLabel,
    clinicCount,
    practitionerCount,
    listingCount,
  }
}

export const getTreatmentCityHubEntries = (): TreatmentCityHubEntry[] => {
  if (cachedHubEntries) {
    return cachedHubEntries
  }

  const entries: TreatmentCityHubEntry[] = []
  const listingIndex = getListingIndex()

  for (const [key, counts] of listingIndex) {
    const [treatmentSlug, locationSlug] = key.split('|')
    const treatmentName = getTreatmentNameForHubSlug(treatmentSlug)
    const locationLabel = locationBySlug.get(locationSlug)
    if (!treatmentName || !locationLabel || !isAllowedHubLocationSlug(locationSlug)) {
      continue
    }
    const listingCount = counts.clinicCount + counts.practitionerCount
    if (listingCount < MIN_HUB_LISTINGS) {
      continue
    }
    entries.push({
      treatmentSlug,
      treatmentName,
      locationSlug,
      locationLabel,
      clinicCount: counts.clinicCount,
      practitionerCount: counts.practitionerCount,
      listingCount,
    })
  }

  const entryKey = (treatmentSlug: string, locationSlug: string) =>
    `${treatmentSlug}|${locationSlug}`
  const existingKeys = new Set(
    entries.map((entry) => entryKey(entry.treatmentSlug, entry.locationSlug))
  )

  for (const treatmentSlug of getTreatmentHubMatrixSlugs()) {
    const treatmentName = getTreatmentNameForHubSlug(treatmentSlug)
    if (!treatmentName) {
      continue
    }
    for (const city of getTreatmentHubMatrixCities()) {
      const locationSlug = toUrlSlug(city)
      const locationLabel = locationBySlug.get(locationSlug)
      if (!locationLabel) {
        continue
      }
      const key = entryKey(treatmentSlug, locationSlug)
      if (existingKeys.has(key)) {
        continue
      }
      const { clinicCount, practitionerCount } = countTreatmentCityListings(
        treatmentSlug,
        locationSlug
      )
      if (clinicCount + practitionerCount < MIN_HUB_LISTINGS) {
        continue
      }
      entries.push({
        treatmentSlug,
        treatmentName,
        locationSlug,
        locationLabel,
        clinicCount,
        practitionerCount,
        listingCount: clinicCount + practitionerCount,
      })
      existingKeys.add(key)
    }
  }

  cachedHubEntries = entries
    .filter((entry) => entry.listingCount >= MIN_HUB_LISTINGS)
    .sort((left, right) => {
      if (left.treatmentSlug === right.treatmentSlug) {
        return left.locationSlug.localeCompare(right.locationSlug)
      }
      return left.treatmentSlug.localeCompare(right.treatmentSlug)
    })

  return cachedHubEntries
}

export const getTreatmentCityHubClinics = (
  treatmentSlug: string,
  locationSlug: string
): Clinic[] => {
  const canonicalSlug = resolveTreatmentHubSlug(treatmentSlug)
  return getClinics()
    .filter(
      (clinic) =>
        matchesCitySlug(clinic.City, locationSlug) &&
        treatmentMatchesSlug(clinic.Treatments, canonicalSlug)
    )
    .sort(
      (left, right) =>
        (Number(right.reviewCount) || 0) - (Number(left.reviewCount) || 0) ||
        (Number(right.rating) || 0) - (Number(left.rating) || 0)
    )
}

export const getTreatmentCityHubProducts = (
  treatmentName: string,
  limit = 6
): Product[] => getProductsForTreatment(treatmentName).slice(0, limit)

export const getTreatmentHubFaqItems = (
  treatmentName: string,
  locationLabel: string
): { question: string; answer: string }[] => {
  const section = treatmentContent[treatmentName]
  if (!section) {
    return [
      {
        question: `How do I choose a ${treatmentName} provider in ${locationLabel}?`,
        answer: `Compare verified clinic and practitioner profiles in ${locationLabel}, review patient feedback, and confirm qualifications before booking ${treatmentName}.`,
      },
      {
        question: `Should I book a clinic or practitioner for ${treatmentName}?`,
        answer: `Clinics are ideal when you want facility-led care and bundled services. Practitioners can suit consult-led treatment plans. Use both directories to compare options in ${locationLabel}.`,
      },
    ]
  }

  const items: { question: string; answer: string }[] = []
  for (const [rawKey, value] of Object.entries(section).slice(0, 4)) {
    const question = rawKey
      .replaceAll('_', ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^./, (char) => char.toUpperCase())
    let answer = ''
    if (typeof value === 'string') {
      answer = value
    } else if (Array.isArray(value)) {
      answer = value.filter((item): item is string => typeof item === 'string').join(' ')
    } else if (typeof value === 'object' && value !== null) {
      const record = value as Record<string, unknown>
      const description = record.description
      if (typeof description === 'string') {
        answer = description
      } else {
        answer = Object.values(record)
          .flatMap((entry) =>
            typeof entry === 'string'
              ? [entry]
              : Array.isArray(entry)
                ? entry.filter((item): item is string => typeof item === 'string')
                : []
          )
          .slice(0, 2)
          .join(' ')
      }
    }
    if (answer.trim().length > 0) {
      items.push({
        question: question.includes(locationLabel) ? question : `${question} (${locationLabel})`,
        answer: answer.slice(0, 600),
      })
    }
  }
  return items.slice(0, 4)
}

export const treatmentHubStandaloneSlug = (treatmentSlug: string): string =>
  `${treatmentSlug}-treatment`
