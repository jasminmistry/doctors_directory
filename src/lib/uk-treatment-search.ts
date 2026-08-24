import {
  brands,
  product_categories,
  search_categories,
} from '@/lib/data'
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

function matchExactLabelledOption(query: string, labels: string[]): string | null {
  const trimmed = query.trim()
  if (!trimmed) return null

  const normalized = trimmed.toLowerCase()
  const slugCandidate = toUrlSlug(trimmed)

  const exact = labels.find((label) => label.toLowerCase() === normalized)
  if (exact) return toUrlSlug(exact)

  const bySlug = labels.find((label) => toUrlSlug(label) === slugCandidate)
  if (bySlug) return slugCandidate

  return null
}

function matchLabelledOption(query: string, labels: string[]): string | null {
  const exact = matchExactLabelledOption(query, labels)
  if (exact) return exact

  const normalized = query.trim().toLowerCase()
  if (!normalized) return null

  const partial = labels.find((label) => label.toLowerCase().includes(normalized))
  if (partial) return toUrlSlug(partial)

  return null
}

export function matchSearchCategorySlug(query: string): string | null {
  return matchLabelledOption(query, search_categories)
}

export function matchProductCategorySlug(query: string): string | null {
  return matchExactLabelledOption(query, product_categories)
}

export function matchBrandSlug(query: string): string | null {
  return matchExactLabelledOption(query, brands)
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

function resolveServiceCityHref(serviceSlug: string, citySlug: string): string {
  return `/${serviceSlug}/${citySlug}/`
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
    return resolveServiceCityHref(treatmentSlug, toUrlSlug(city))
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
  const searchCategorySlug = matchSearchCategorySlug(query)
  const productCategorySlug = matchProductCategorySlug(query)
  const brandSlug = matchBrandSlug(query)

  if (type === 'Treatments') {
    const treatmentHref = resolveUkTreatmentSearchHref(query, location, options)
    if (treatmentHref) return treatmentHref
    if (searchCategorySlug && citySlug) {
      return resolveServiceCityHref(searchCategorySlug, citySlug)
    }
    if (citySlug) return `/clinics/${citySlug}/`
    if (treatmentSlug) return `/treatments/${treatmentSlug}/`
    if (searchCategorySlug) return `/clinics/`
    return '/treatments/'
  }

  if (type === 'Clinic') {
    if (treatmentSlug && citySlug) {
      return `/clinics/${citySlug}/services/${treatmentSlug}/`
    }
    if (searchCategorySlug && citySlug) {
      return resolveServiceCityHref(searchCategorySlug, citySlug)
    }
    if (treatmentSlug) {
      return `/treatments/${treatmentSlug}/`
    }
    if (citySlug) {
      return `/clinics/${citySlug}/`
    }
    if (searchCategorySlug) {
      return `/clinics/`
    }
    return '/clinics/'
  }

  if (type === 'Practitioner') {
    if (treatmentSlug && citySlug) {
      return `/practitioners/${citySlug}/treatments/${treatmentSlug}/`
    }
    if (treatmentSlug) {
      return `/treatments/${treatmentSlug}/`
    }
    if (citySlug) {
      return `/practitioners/${citySlug}/`
    }
    if (searchCategorySlug) {
      return '/practitioners/'
    }
    return '/practitioners/'
  }

  if (type === 'Product') {
    if (productCategorySlug) {
      return `/products/category/${productCategorySlug}/`
    }
    if (brandSlug) {
      return `/products/brands/${brandSlug}/`
    }
    if (searchCategorySlug && citySlug) {
      return resolveServiceCityHref(searchCategorySlug, citySlug)
    }
    if (citySlug) {
      return `/clinics/${citySlug}/`
    }
    return '/products/'
  }

  return null
}
