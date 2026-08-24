import {
  matchClinicTreatmentToHubSlug,
  resolveTreatmentHubSlug,
} from '@/lib/treatment-hub-registry'
import { toUrlSlug } from '@/lib/utils'

export type TreatmentSearchOption = {
  name: string
  slug: string
}

export type DirectorySearchInput = {
  type: string
  query: string
  location: string
}

export function matchTreatmentOption(
  query: string,
  options: TreatmentSearchOption[]
): TreatmentSearchOption | null {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return null

  const exact = options.find(
    (option) =>
      option.name.toLowerCase() === normalized ||
      option.slug === normalized ||
      option.slug === toUrlSlug(query)
  )
  if (exact) return exact

  return (
    options.find(
      (option) =>
        option.name.toLowerCase().includes(normalized) ||
        option.slug.includes(normalized.replace(/\s+/g, '-'))
    ) ?? null
  )
}

function resolveTreatmentSlug(
  query: string,
  options: TreatmentSearchOption[]
): string | null {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return null

  const match = matchTreatmentOption(trimmedQuery, options)
  if (match) {
    return resolveTreatmentHubSlug(match.slug)
  }

  const hubMatch = matchClinicTreatmentToHubSlug(trimmedQuery)
  if (hubMatch) {
    return resolveTreatmentHubSlug(hubMatch)
  }

  const candidate = toUrlSlug(trimmedQuery)
  if (options.some((option) => option.slug === candidate)) {
    return resolveTreatmentHubSlug(candidate)
  }

  return null
}

export function resolveUkTreatmentSearchHref(
  query: string,
  location: string,
  options: TreatmentSearchOption[]
): string | null {
  const treatmentSlug = resolveTreatmentSlug(query, options)
  if (!treatmentSlug) return null

  const city = location.trim()
  if (city) {
    return `/${treatmentSlug}/${toUrlSlug(city)}/`
  }

  return `/treatments/${treatmentSlug}/`
}

export function resolveDirectorySearchHref(
  input: DirectorySearchInput,
  options: TreatmentSearchOption[] = []
): string | null {
  const type = (input.type || '').trim()
  const query = (input.query || '').trim()
  const location = (input.location || '').trim()
  const citySlug = location ? toUrlSlug(location) : ''
  const treatmentSlug = resolveTreatmentSlug(query, options)

  if (type === 'Treatments') {
    const treatmentHref = resolveUkTreatmentSearchHref(query, location, options)
    if (treatmentHref) return treatmentHref
    if (citySlug) return `/clinics/${citySlug}/`
    return null
  }

  if (type === 'Clinic') {
    if (treatmentSlug && citySlug) {
      return `/clinics/${citySlug}/services/${treatmentSlug}/`
    }
    if (treatmentSlug) {
      return `/treatments/${treatmentSlug}/`
    }
    if (citySlug && !query) {
      return `/clinics/${citySlug}/`
    }
    return null
  }

  if (type === 'Practitioner') {
    if (treatmentSlug && citySlug) {
      return `/practitioners/${citySlug}/treatments/${treatmentSlug}/`
    }
    if (treatmentSlug) {
      return `/treatments/${treatmentSlug}/`
    }
    if (citySlug && !query) {
      return `/practitioners/${citySlug}/`
    }
    return null
  }

  if (type === 'Product') {
    if (citySlug && !query) return `/clinics/${citySlug}/`
    if (!query && !citySlug) return '/products/'
    return null
  }

  return null
}
