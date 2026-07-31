import type { Clinic } from '@/lib/types'
import prestigeData from '@/lib/data/prestige-accreditations.json'
import { getPrestigeAccreditation } from '@/lib/prestige-accreditations'
import type { PrestigeAccreditation } from '@/lib/prestige-accreditations'

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
    return clinic.claimed === true
  }

  return false
}

export function filterClinicsByAccreditation(clinics: Clinic[], accreditation: string): Clinic[] {
  return clinics.filter((clinic) => clinicMatchesAccreditation(clinic, accreditation))
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
      .filter(Boolean),
  )
}
