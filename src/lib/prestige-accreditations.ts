import prestigeData from '@/lib/data/prestige-accreditations.json'

export type AestheticsAwardPlacement = {
  year: number
  result: string
  category: string
}

export type PrestigeAccreditation = {
  slug: string
  city: string
  aestheticsAwards: AestheticsAwardPlacement[]
  tatlerYears: number[]
  awardsBadgeLabel: string | null
  tatlerBadgeLabel: string | null
}

const PRESTIGE_BY_SLUG = prestigeData as Record<string, PrestigeAccreditation>

export function getPrestigeAccreditation(slug: string | undefined | null): PrestigeAccreditation | null {
  if (!slug) return null
  return PRESTIGE_BY_SLUG[slug] ?? null
}

export function applyPrestigeToClinic<T extends { slug?: string | null }>(clinic: T): T & {
  aestheticsAwards?: AestheticsAwardPlacement[]
  tatlerGuideYears?: number[]
  awardsBadgeLabel?: string | null
  tatlerBadgeLabel?: string | null
} {
  const prestige = getPrestigeAccreditation(clinic.slug)
  if (!prestige) return clinic
  return {
    ...clinic,
    aestheticsAwards: prestige.aestheticsAwards,
    tatlerGuideYears: prestige.tatlerYears,
    awardsBadgeLabel: prestige.awardsBadgeLabel,
    tatlerBadgeLabel: prestige.tatlerBadgeLabel,
  }
}

export function hasPrestigeBadge(clinic: {
  awardsBadgeLabel?: string | null
  tatlerBadgeLabel?: string | null
}): boolean {
  return Boolean(clinic.awardsBadgeLabel || clinic.tatlerBadgeLabel)
}
