import { getClinics } from "@/lib/sitemap-data"
import { toUrlSlug } from "@/lib/utils"

export const CITY_LOCAL_SOFTWARE_SLUGS = [
  "aesthetic-clinic-software",
  "consent-and-booking-software",
  "clinic-crm-software",
  "clinic-marketing-software",
] as const

export const CITY_LOCAL_PRACTITIONER_SLUGS = [
  "aesthetic-practitioner-software",
  "aesthetic-nurse-software",
  "nurse-injector-software",
  "aesthetic-doctor-software",
] as const

export const CITY_LOCAL_CONSENT_SLUGS = [
  "botox-consent-form-software",
  "dermal-filler-consent-form-software",
  "lip-filler-consent-form-software",
  "laser-hair-removal-consent-form-software",
] as const

export const CITY_LOCAL_PAGE_SLUGS = [
  ...CITY_LOCAL_SOFTWARE_SLUGS,
  ...CITY_LOCAL_PRACTITIONER_SLUGS,
  ...CITY_LOCAL_CONSENT_SLUGS,
] as const

export type TreatmentPageType =
  | "consent-workflows"
  | "automation-workflows"
  | "clinic-management-software"
  | "workflows"

export const TREATMENT_PAGE_TYPES: TreatmentPageType[] = [
  "consent-workflows",
  "automation-workflows",
  "clinic-management-software",
  "workflows",
]

export function getDirectoryTreatmentBases(minCount = 5, maxItems = 80) {
  const counts = new Map<string, { label: string; count: number }>()
  for (const clinic of getClinics()) {
    for (const treatment of clinic.Treatments ?? []) {
      const label = treatment.trim()
      if (!label) continue
      const slug = toUrlSlug(label)
      const prev = counts.get(slug)
      if (prev) {
        prev.count += 1
      } else {
        counts.set(slug, { label, count: 1 })
      }
    }
  }
  return [...counts.entries()]
    .filter(([, v]) => v.count >= minCount)
    .sort((a, b) => b[1].count - a[1].count || a[1].label.localeCompare(b[1].label))
    .slice(0, maxItems)
    .map(([slug, v]) => ({ slug, label: v.label, count: v.count }))
}

export function buildTreatmentPageSlug(
  treatmentSlug: string,
  pageType: TreatmentPageType
) {
  return `${treatmentSlug}-${pageType}`
}

export function parseTreatmentPageSlug(slug: string): {
  treatmentSlug: string
  pageType: TreatmentPageType
} | null {
  for (const type of TREATMENT_PAGE_TYPES) {
    const suffix = `-${type}`
    if (slug.endsWith(suffix)) {
      return {
        treatmentSlug: slug.slice(0, -suffix.length),
        pageType: type,
      }
    }
  }
  return null
}
