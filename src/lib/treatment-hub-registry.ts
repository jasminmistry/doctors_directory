import { normalizeTreatmentToken } from '@/lib/treatment-token'

export type TreatmentHubSlugConfig = {
  slug: string
  displayName: string
  matchTokens: string[]
  priority: boolean
  forceCityMatrix: boolean
  treatmentGuideImage: string
  treatmentsJsonKey?: string
}

export const TREATMENT_HUB_SLUG_REDIRECTS: Record<string, string> = {
  'polynucleotide-treatment': 'polynucleotides',
}

export const TREATMENT_HUB_SLUGS: TreatmentHubSlugConfig[] = [
  {
    slug: 'morpheus8',
    displayName: 'Morpheus8',
    matchTokens: [
      'morpheus8',
      'morpheus 8',
      'microneedling with radiofrequency',
      'microneedling with radio frequency',
    ],
    priority: true,
    forceCityMatrix: true,
    treatmentGuideImage: '/directory/treatments/microneedling with radiofrequency.webp',
  },
  {
    slug: 'lemon-bottle',
    displayName: 'Lemon Bottle',
    matchTokens: ['lemon bottle', 'lemon-bottle', 'lemonbottle'],
    priority: false,
    forceCityMatrix: true,
    treatmentGuideImage: '/directory/treatments/aqualyx.webp',
  },
  {
    slug: 'profhilo-structura',
    displayName: 'Profhilo Structura',
    matchTokens: ['profhilo structura', 'profhilo-structura', 'profhilo'],
    priority: false,
    forceCityMatrix: true,
    treatmentGuideImage: '/directory/treatments/profhilo.webp',
  },
  {
    slug: 'seventy-hyal',
    displayName: 'Seventy Hyal',
    matchTokens: ['seventy hyal', 'seventy-hyal', 'seventyhyal'],
    priority: false,
    forceCityMatrix: true,
    treatmentGuideImage: '/directory/treatments/skin-booster.webp',
  },
  {
    slug: 'jawline-filler',
    displayName: 'Jawline Filler',
    matchTokens: ['jawline filler', 'jawline-filler', 'jawline fillers'],
    priority: false,
    forceCityMatrix: true,
    treatmentGuideImage: '/directory/treatments/chin-enhancement.webp',
  },
  {
    slug: 'rf-microneedling',
    displayName: 'RF Microneedling',
    matchTokens: [
      'rf microneedling',
      'rf-microneedling',
      'radiofrequency microneedling',
      'microneedling with radiofrequency',
      'microneedling with radio frequency',
    ],
    priority: false,
    forceCityMatrix: true,
    treatmentGuideImage: '/directory/treatments/microneedling with radiofrequency.webp',
  },
  {
    slug: 'polynucleotides',
    displayName: 'Polynucleotides',
    matchTokens: ['polynucleotides', 'polynucleotide', 'polynucleotide treatment'],
    priority: true,
    forceCityMatrix: true,
    treatmentGuideImage: '/directory/treatments/polynucleotide-treatment.webp',
    treatmentsJsonKey: 'Polynucleotide Treatment',
  },
  {
    slug: 'non-surgical-rhinoplasty',
    displayName: 'Non-Surgical Rhinoplasty',
    matchTokens: [
      'non surgical rhinoplasty',
      'non-surgical rhinoplasty',
      'liquid rhinoplasty',
      'nose filler',
    ],
    priority: false,
    forceCityMatrix: true,
    treatmentGuideImage:
      '/directory/treatments/side-view-doctor-checking-patient-before-rhinoplasty.webp',
  },
  {
    slug: 'rhinoplasty',
    displayName: 'Rhinoplasty',
    matchTokens: ['rhinoplasty', 'nose job', 'nose surgery'],
    priority: false,
    forceCityMatrix: false,
    treatmentGuideImage:
      '/directory/treatments/side-view-doctor-checking-patient-before-rhinoplasty.webp',
    treatmentsJsonKey: 'Rhinoplasty',
  },
]

const hubSlugByToken = new Map<string, string>()

for (const config of TREATMENT_HUB_SLUGS) {
  hubSlugByToken.set(normalizeTreatmentToken(config.slug), config.slug)
  for (const token of config.matchTokens) {
    hubSlugByToken.set(normalizeTreatmentToken(token), config.slug)
  }
}

export const resolveTreatmentHubSlug = (slug: string): string =>
  TREATMENT_HUB_SLUG_REDIRECTS[slug] ?? slug

export const isPriorityTreatmentHubSlug = (slug: string): boolean => {
  const canonical = resolveTreatmentHubSlug(slug)
  return TREATMENT_HUB_SLUGS.some((c) => c.slug === canonical && c.priority)
}

export const isMandatoryTreatmentHubSlug = (slug: string): boolean => {
  const canonical = resolveTreatmentHubSlug(slug)
  const config = TREATMENT_HUB_SLUGS.find((c) => c.slug === canonical)
  return Boolean(config && (config.priority || config.forceCityMatrix))
}

export const mandatoryTreatmentHubMatrixSlugs = (): string[] =>
  TREATMENT_HUB_SLUGS.filter((c) => c.priority || c.forceCityMatrix).map((c) => c.slug)

export const getTreatmentHubSlugConfig = (
  slug: string
): TreatmentHubSlugConfig | null => {
  const canonical = resolveTreatmentHubSlug(slug)
  return TREATMENT_HUB_SLUGS.find((c) => c.slug === canonical) ?? null
}

export const getTreatmentHubDisplayName = (slug: string): string | null =>
  getTreatmentHubSlugConfig(slug)?.displayName ?? null

export const matchClinicTreatmentToHubSlug = (treatmentLabel: string): string | null => {
  const normalized = normalizeTreatmentToken(treatmentLabel)
  return hubSlugByToken.get(normalized) ?? null
}

export const treatmentMatchesHubSlug = (
  treatments: string[] | undefined,
  treatmentSlug: string
): boolean => {
  const canonical = resolveTreatmentHubSlug(treatmentSlug)
  const config = getTreatmentHubSlugConfig(canonical)
  if (!config) {
    return (treatments ?? []).some(
      (treatment) => normalizeTreatmentToken(treatment) === normalizeTreatmentToken(canonical)
    )
  }
  return (treatments ?? []).some((treatment) => {
    const mapped = matchClinicTreatmentToHubSlug(treatment)
    if (mapped === canonical) {
      return true
    }
    return normalizeTreatmentToken(treatment) === normalizeTreatmentToken(canonical)
  })
}

export const priorityTreatmentHubSlugEntries = (): Array<{ slug: string; name: string }> =>
  TREATMENT_HUB_SLUGS.filter((c) => c.priority).map((c) => ({
    slug: c.slug,
    name: c.displayName,
  }))

export const treatmentHubGuideImage = (slug: string): string | undefined =>
  getTreatmentHubSlugConfig(slug)?.treatmentGuideImage

export const modalityLabelsFromHubRegistry = (): string[] =>
  TREATMENT_HUB_SLUGS.map((c) => c.displayName)
