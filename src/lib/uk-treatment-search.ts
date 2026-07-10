import { resolveTreatmentHubSlug } from '@/lib/treatment-hub-registry'
import { toUrlSlug } from '@/lib/utils'

export type TreatmentSearchOption = {
  name: string
  slug: string
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

export function resolveUkTreatmentSearchHref(
  query: string,
  location: string,
  options: TreatmentSearchOption[]
): string | null {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return null

  const match = matchTreatmentOption(trimmedQuery, options)
  const treatmentSlug = resolveTreatmentHubSlug(match?.slug ?? toUrlSlug(trimmedQuery))
  const city = location.trim()

  if (city) {
    return `/${treatmentSlug}/${toUrlSlug(city)}/`
  }

  return `/treatments/${treatmentSlug}/`
}
