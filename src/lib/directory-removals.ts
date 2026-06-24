const REMOVED_CLINIC_SLUGS = new Set([
  "the-weardale-practice",
  "skinmedic",
  "dr-dan-dhunna-cosmetic-clinic-solihull",
  "dorset-trichology",
  "melissa-aesthetics-clinic-sunderland-medical-aesthetics",
])

const REMOVED_PRACTITIONER_SLUGS = new Set(["dr-dan-dhunna", "gina-lourens"])

export function isRemovedClinicSlug(slug: string | null | undefined): boolean {
  if (!slug) return false
  return REMOVED_CLINIC_SLUGS.has(slug.trim().toLowerCase())
}

export function isRemovedPractitionerSlug(slug: string | null | undefined): boolean {
  if (!slug) return false
  return REMOVED_PRACTITIONER_SLUGS.has(slug.trim().toLowerCase())
}

export function filterRemovedClinics<T extends { slug?: string | null }>(
  items: readonly T[]
): T[] {
  return items.filter((item) => !isRemovedClinicSlug(item.slug))
}

export function filterRemovedPractitioners<T extends { slug?: string | null; practitioner_name?: string | null }>(
  items: readonly T[]
): T[] {
  return items.filter((item) => {
    const slug = item.slug ?? item.practitioner_name
    return !isRemovedPractitionerSlug(slug)
  })
}
