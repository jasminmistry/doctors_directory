const REMOVED_CLINIC_SLUGS = new Set([
  "the-weardale-practice",
  "skinmedic",
  "dr-dan-dhunna-cosmetic-clinic-solihull",
  "dorset-trichology",
  "melissa-aesthetics-clinic-sunderland-medical-aesthetics",
])

const REMOVED_PRACTITIONER_SLUGS = new Set(["dr-dan-dhunna", "gina-lourens"])

const TRIPLE_LETTER_RE = /(.)\1\1/i

export function hasTripleLetterSequence(value: string | null | undefined): boolean {
  if (!value) return false
  return TRIPLE_LETTER_RE.test(value.trim())
}

export function isRemovedClinicSlug(slug: string | null | undefined): boolean {
  if (!slug) return false
  return REMOVED_CLINIC_SLUGS.has(slug.trim().toLowerCase())
}

export function isRemovedPractitionerSlug(slug: string | null | undefined): boolean {
  if (!slug) return false
  const normalized = slug.trim().toLowerCase()
  return REMOVED_PRACTITIONER_SLUGS.has(normalized) || hasTripleLetterSequence(normalized)
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
