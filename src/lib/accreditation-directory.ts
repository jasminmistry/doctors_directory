import {
  associatedClinicSlugList,
  getConsentzCustomerSlugs,
  isConsentzClinic,
  isDirectoryTestListing,
} from '@/lib/consentz-customers'
import type { Clinic, Practitioner } from '@/lib/types'
import prestigeData from '@/lib/data/prestige-accreditations.json'
import {
  applyPrestigeToClinic,
  getPrestigeAccreditation,
  type PrestigeAccreditation,
} from '@/lib/prestige-accreditations'
import { readJsonFileSync } from '@/lib/json-cache'
import { toUrlSlug } from '@/lib/utils'

export const REGULATORY_ACCREDITATION_SLUGS = [
  'cqc',
  'his',
  'hiw',
  'jccp',
  'rqia',
  'saveface',
] as const

export const PRESTIGE_ACCREDITATION_SLUGS = [
  'consentz',
  'tatler',
  'aesthetics-awards',
] as const

export type RegulatoryAccreditationSlug = (typeof REGULATORY_ACCREDITATION_SLUGS)[number]
export type PrestigeAccreditationSlug = (typeof PRESTIGE_ACCREDITATION_SLUGS)[number]

const REGULATORY_FIELD: Record<RegulatoryAccreditationSlug, keyof Clinic> = {
  cqc: 'isCQC',
  jccp: 'isJCCP',
  hiw: 'isHIW',
  his: 'isHIS',
  rqia: 'isRQIA',
  saveface: 'isSaveFace',
}

const ACCREDITATION_LABELS: Record<string, string> = {
  cqc: 'Care Quality Commission (CQC)',
  jccp: 'Joint Council for Cosmetic Practitioners (JCCP)',
  hiw: 'Health Inspectorate Wales (HIW)',
  his: 'Healthcare Improvement Scotland (HIS)',
  rqia: 'Regulation and Quality Improvement Authority (RQIA)',
  saveface: 'Save Face',
  consentz: 'Consentz',
  tatler: 'Tatler',
  'aesthetics-awards': 'Aesthetics Awards',
}

export function normalizeAccreditationSlug(accreditation: string): string {
  return decodeURIComponent(accreditation).toLowerCase().trim()
}

export function getAccreditationDisplayName(accreditation: string): string {
  const slug = normalizeAccreditationSlug(accreditation)
  return ACCREDITATION_LABELS[slug] || accreditation
}

export function isRegulatoryAccreditation(accreditation: string): accreditation is RegulatoryAccreditationSlug {
  return (REGULATORY_ACCREDITATION_SLUGS as readonly string[]).includes(
    normalizeAccreditationSlug(accreditation),
  )
}

export function isPrestigeAccreditation(accreditation: string): accreditation is PrestigeAccreditationSlug {
  return (PRESTIGE_ACCREDITATION_SLUGS as readonly string[]).includes(
    normalizeAccreditationSlug(accreditation),
  )
}

export function isKnownAccreditation(accreditation: string): boolean {
  return isRegulatoryAccreditation(accreditation) || isPrestigeAccreditation(accreditation)
}

export function mapRegulatoryAccreditationToClinicField(
  accreditation: string,
): keyof Clinic {
  const slug = normalizeAccreditationSlug(accreditation) as RegulatoryAccreditationSlug
  const field = REGULATORY_FIELD[slug]
  if (!field) throw new Error(`Invalid accreditation: ${accreditation}`)
  return field
}

function clinicHasRegulatoryFlag(clinic: Clinic, field: keyof Clinic): boolean {
  const value = clinic[field]
  return value === true || (Array.isArray(value) && value[0] === true)
}

export function clinicMatchesAccreditation(clinic: Clinic, accreditation: string): boolean {
  const slug = normalizeAccreditationSlug(accreditation)
  if (!clinic.slug) return false

  if (isRegulatoryAccreditation(slug)) {
    return clinicHasRegulatoryFlag(clinic, REGULATORY_FIELD[slug])
  }

  if (slug === 'aesthetics-awards') {
    const prestige = getPrestigeAccreditation(clinic.slug)
    return Boolean(prestige?.aestheticsAwards?.length)
  }

  if (slug === 'tatler') {
    const prestige = getPrestigeAccreditation(clinic.slug)
    return Boolean(prestige?.tatlerYears?.length)
  }

  if (slug === 'consentz') {
    if (isDirectoryTestListing(clinic.slug)) return false
    return isConsentzClinic(clinic)
  }

  return false
}

export function filterClinicsByAccreditation(clinics: Clinic[], accreditation: string): Clinic[] {
  return clinics.filter((clinic) => clinicMatchesAccreditation(clinic, accreditation))
}

export function clinicCityMatchesSlug(city: string | undefined | null, cityslug: string): boolean {
  if (!city) return false
  return toUrlSlug(city) === toUrlSlug(cityslug)
}

export function getPrestigeMatchingClinicSlugs(
  accreditation: 'aesthetics-awards' | 'tatler',
): Set<string> {
  const entries = Object.values(prestigeData as Record<string, PrestigeAccreditation>)
  return new Set(
    entries
      .filter((entry) =>
        accreditation === 'aesthetics-awards'
          ? Boolean(entry.aestheticsAwards?.length)
          : Boolean(entry.tatlerYears?.length),
      )
      .map((entry) => entry.slug)
      .filter(Boolean)
      .map((entrySlug) => entrySlug.toLowerCase()),
  )
}

export function getMatchingClinicSlugs(accreditation: string): Set<string> | null {
  const slug = normalizeAccreditationSlug(accreditation)
  if (slug === 'consentz') {
    return new Set(getConsentzCustomerSlugs())
  }
  if (slug === 'tatler' || slug === 'aesthetics-awards') {
    return getPrestigeMatchingClinicSlugs(slug)
  }
  return null
}

export function associatedClinicSlugs(value: {
  Associated_Clinics?: string | string[] | null
}): string[] {
  return associatedClinicSlugList(value.Associated_Clinics)
}

export function practitionerMatchesAccreditation(
  practitioner: {
    slug?: string | null
    practitioner_name?: string | null
    Associated_Clinics?: string | string[] | null
  } & Partial<Clinic>,
  accreditation: string,
): boolean {
  const slug = normalizeAccreditationSlug(accreditation)
  if (isDirectoryTestListing(practitioner.slug, practitioner.practitioner_name)) {
    return false
  }

  const matchingClinicSlugs = getMatchingClinicSlugs(slug)
  if (matchingClinicSlugs) {
    return associatedClinicSlugs(practitioner).some((clinicSlug) =>
      matchingClinicSlugs.has(clinicSlug.toLowerCase()),
    )
  }

  return clinicMatchesAccreditation(practitioner as Clinic, slug)
}

export function getAccreditedPractitioners(accreditation: string): Practitioner[] {
  const matchingClinicSlugs = getMatchingClinicSlugs(accreditation)
  if (!matchingClinicSlugs) return []

  const clinics = readJsonFileSync('clinics_processed_new_data.json') as Clinic[]
  const practitioners = readJsonFileSync('derms_processed_new_5403.json') as Practitioner[]
  const clinicBySlug = new Map(
    clinics
      .filter((clinic) => clinic.slug)
      .map((clinic) => [clinic.slug!.toLowerCase(), clinic]),
  )

  return practitioners.flatMap((practitioner) => {
    if (isDirectoryTestListing(practitioner.slug, practitioner.practitioner_name)) {
      return []
    }
    const clinic = associatedClinicSlugs(practitioner)
      .map((clinicSlug) => clinicBySlug.get(clinicSlug.toLowerCase()))
      .find((entry) => entry?.slug && matchingClinicSlugs.has(entry.slug.toLowerCase()))
    if (!clinic) return []

    const prestigeClinic = applyPrestigeToClinic(clinic)
    return [
      {
        ...prestigeClinic,
        ...practitioner,
        City: clinic.City,
        gmapsAddress: practitioner.gmapsAddress || clinic.gmapsAddress,
        Treatments: practitioner.Treatments?.length ? practitioner.Treatments : clinic.Treatments,
        isConsentz: isConsentzClinic(clinic),
        awardsBadgeLabel: prestigeClinic.awardsBadgeLabel,
        tatlerBadgeLabel: prestigeClinic.tatlerBadgeLabel,
        aestheticsAwards: prestigeClinic.aestheticsAwards,
        tatlerGuideYears: prestigeClinic.tatlerGuideYears,
        slug: practitioner.slug || clinic.slug,
      },
    ]
  })
}

export function getConsentzAccreditedPractitioners(): Practitioner[] {
  return getAccreditedPractitioners('consentz')
}
