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

export type PrestigeFields = {
  aestheticsAwards?: AestheticsAwardPlacement[]
  tatlerGuideYears?: number[]
  awardsBadgeLabel?: string | null
  tatlerBadgeLabel?: string | null
}

const PRESTIGE_BY_SLUG = prestigeData as Record<string, PrestigeAccreditation>

export function getPrestigeAccreditation(slug: string | undefined | null): PrestigeAccreditation | null {
  if (!slug) return null
  return PRESTIGE_BY_SLUG[slug] ?? PRESTIGE_BY_SLUG[slug.toLowerCase()] ?? null
}

export function applyPrestigeToClinic<T extends { slug?: string | null }>(
  clinic: T,
): T & PrestigeFields {
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

export function applyPrestigeFromSlugs<T extends object>(
  entity: T,
  slugs: Array<string | null | undefined>,
): T & PrestigeFields {
  for (const slug of slugs) {
    const prestige = getPrestigeAccreditation(slug)
    if (!prestige) continue
    if (
      !prestige.awardsBadgeLabel &&
      !prestige.tatlerBadgeLabel &&
      !prestige.aestheticsAwards?.length &&
      !prestige.tatlerYears?.length
    ) {
      continue
    }
    return {
      ...entity,
      aestheticsAwards: prestige.aestheticsAwards,
      tatlerGuideYears: prestige.tatlerYears,
      awardsBadgeLabel: prestige.awardsBadgeLabel,
      tatlerBadgeLabel: prestige.tatlerBadgeLabel,
    }
  }
  return entity
}
