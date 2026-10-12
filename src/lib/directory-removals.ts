export const NHS_REMOVED_CLINIC_SLUGS = [
  "dermatology-department-1st-floor",
  "west-middlesex-university-hospital-dermatology",
  "derriford-hospital-dermatology",
  "st-helens-hospital-dermatology",
  "medway-maritime-hospital-dermatology",
  "dermatology",
  "ashton-centre",
  "basildon-university-hospital-department-of-dermatology",
  "neath-port-talbot-hospital-dermatology",
  "royal-berkshire-hospital-dermatology",
  "addenbrookes-hospitaldermatology-plastic-surgery-clinic",
  "sara-pruneddu-dermatologist",
  "day-care-unit",
  "day-surgery-unit",
  "tayside-laser-clinic",
  "tudor-center",
  "burnside-house",
  "matththew-drakford",
  "the-cosmetic-dermatology-clinic",
  "oldham-total-skin-service",
  "the-annexe-hillingdon-community-dermatology-service",
  "kent-integrated-dermatology-service",
  "dmc-community-dermatology-service",
  "dmc-healthcare",
  "circle-wolverhampton-community-dermatology",
  "solihealth-dermatology-shp-hub",
  "solihealth-dermatology-parkfield-hub",
  "cumbria-medical-services",
  "dr-d-beverley-beverley-holderness-dermatologist",
  "manchester-skin-clinic",
  "spring-hall-group-practice",
  "buckden-and-lt-paxton-surgery",
  "aberfeldy-and-kinloch-rannoch-medical-practice",
  "toome-surgery",
  "st-werburgh-medical-practice",
  "the-earby-surgery-dr-i-d-sangster-and-partners",
  "peel-dr",
  "dr-stephen-p-chadwick",
  "dr-clive-binns",
  "dr-t-botox",
  "dr-benjamin-williams",
  "the-health-and-aesthetic-doctors",
  "self-dr-k",
  "mckenzie-house",
  "selby-dr-j",
  "w-roberts",
  "tarbert-medical-practice",
  "rossett-surgery",
  "rasharkin-health-centre",
  "three-shires-medical-practice",
  "trent-view-medical-practice",
  "dr-a-tewari-castle-healthcare-practice",
  "east-hoathly-skin-clinic",
  "snowberry-lane-clinic",
  "waters-dr-m-r",
  "dr-abhijit-banerjee",
  "dr-mohana-krishnan-mbbs-mrcgp-dipderm",
  "awbeautician-beauty-therapy",
]

const REMOVED_CLINIC_SLUGS = new Set([
  "the-weardale-practice",
  "skinmedic",
  "dr-dan-dhunna-cosmetic-clinic-solihull",
  "dorset-trichology",
  "melissa-aesthetics-clinic-sunderland-medical-aesthetics",
  ...NHS_REMOVED_CLINIC_SLUGS,
])

export const REMOVED_PRACTITIONER_SLUGS = new Set(["dr-dan-dhunna", "gina-lourens"])

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
