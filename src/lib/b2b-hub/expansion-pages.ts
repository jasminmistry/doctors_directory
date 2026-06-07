import {
  CITY_LOCAL_CONSENT_SLUGS,
  CITY_LOCAL_CQC_SLUGS,
  CITY_LOCAL_SOFTWARE_SLUGS,
} from '@/lib/b2b-hub/scaled-pages-shared'
import {
  getB2bExpansionCities,
  getCqcExpansionCities,
  getExpansionCity,
  isCqcExpansionCitySlug,
  isExpansionCitySlug,
  type B2bExpansionCity,
} from '@/lib/b2b-hub/expansion-cities'
import { getCityScaledHero } from '@/lib/b2b-hub/city-page-hero'
import {
  HUB_ENTRIES_BY_SEGMENT,
  getHubEntry,
  isHubSegment,
  segmentLabel,
  type HubEntry,
} from '@/lib/b2b-hub/registry'
import { isCoreConsentHubSlug } from '@/lib/b2b-hub/consent-hub-nav-links'
import { toDisplayTitle } from '@/lib/b2b-hub/text'

export const B2B_EXPANSION_SEGMENTS = [
  'consent',
  'compare',
  'migrate',
  'pricing',
  'alternatives',
  'cqc',
  'software',
] as const

export type B2bExpansionSegment = (typeof B2B_EXPANSION_SEGMENTS)[number]

export function isB2bExpansionSegment(value: string): value is B2bExpansionSegment {
  return (B2B_EXPANSION_SEGMENTS as readonly string[]).includes(value)
}

function isCoreCqcHubSlug(slug: string) {
  return !slug.includes('-cqc-compliance-alternative')
}

export function getExpansionHubEntries(segment: B2bExpansionSegment): HubEntry[] {
  switch (segment) {
    case 'consent':
      return (HUB_ENTRIES_BY_SEGMENT.consent ?? []).filter((entry) =>
        isCoreConsentHubSlug(entry.slug)
      )
    case 'cqc':
      return (HUB_ENTRIES_BY_SEGMENT.cqc ?? []).filter((entry) =>
        isCoreCqcHubSlug(entry.slug)
      )
    case 'software':
      return (HUB_ENTRIES_BY_SEGMENT.software ?? []).filter((entry) =>
        (CITY_LOCAL_SOFTWARE_SLUGS as readonly string[]).includes(entry.slug)
      )
    case 'compare':
    case 'migrate':
    case 'pricing':
    case 'alternatives':
      return HUB_ENTRIES_BY_SEGMENT[segment] ?? []
    default:
      return []
  }
}

export function isExpansionHubSlug(segment: B2bExpansionSegment, slug: string): boolean {
  return getExpansionHubEntries(segment).some((entry) => entry.slug === slug)
}

export function resolveExpansionCityPageSlug(
  segment: B2bExpansionSegment,
  hubSlug: string
): string {
  if (
    (CITY_LOCAL_CONSENT_SLUGS as readonly string[]).includes(hubSlug) ||
    (CITY_LOCAL_CQC_SLUGS as readonly string[]).includes(hubSlug) ||
    (CITY_LOCAL_SOFTWARE_SLUGS as readonly string[]).includes(hubSlug)
  ) {
    return hubSlug
  }

  if (segment === 'consent' && hubSlug.endsWith('-consent-form-software')) {
    return hubSlug
  }

  if (segment === 'consent') {
    return 'botox-consent-form-software'
  }
  if (segment === 'cqc') {
    return 'cqc-compliance-software'
  }
  if (segment === 'software') {
    return 'aesthetic-clinic-software'
  }

  return 'aesthetic-clinic-software'
}

export function buildExpansionCanonicalPath(
  segment: B2bExpansionSegment,
  hubSlug: string,
  citySlug: string
) {
  return `/business/${segment}/${hubSlug}/${citySlug}/`
}

export function getExpansionCityHero(
  segment: B2bExpansionSegment,
  entry: HubEntry,
  cityTitle: string,
  pageSlug: string
) {
  if (segment === 'compare') {
    return {
      line1: entry.title,
      line2: `for ${cityTitle} clinics`,
      intro: `Compare platforms for ${cityTitle} aesthetic clinics — consent, compliance evidence, pricing, and day-to-day operations.`,
    }
  }
  if (segment === 'migrate') {
    return {
      line1: `Migrate in ${cityTitle}`,
      line2: entry.title.replace(/^Migrate from\s+/i, ''),
      intro: `Plan a migration for your ${cityTitle} clinic without losing bookings, consent records, or inspection evidence.`,
    }
  }
  if (segment === 'pricing') {
    return {
      line1: `${cityTitle} pricing guide`,
      line2: entry.title,
      intro: `Compare clinic software pricing for ${cityTitle} operators — fewer hidden add-ons and clearer total cost of ownership.`,
    }
  }
  if (segment === 'alternatives') {
    return {
      line1: `${entry.title}`,
      line2: `for ${cityTitle}`,
      intro: `Evaluate alternatives for ${cityTitle} clinics — consent, CRM, compliance, and automation in one governed stack.`,
    }
  }
  if (segment === 'consent' && !pageSlug.endsWith('-consent-form-software')) {
    const topic = toDisplayTitle(entry.title)
    return {
      line1: `${topic}`,
      line2: `in ${cityTitle}`,
      intro: `Digital consent workflows for ${cityTitle} clinics — structured evidence, fewer gaps, and calmer inspections.`,
    }
  }
  if (segment === 'cqc' && pageSlug === 'cqc-compliance-software') {
    const topic = toDisplayTitle(entry.title)
    return {
      line1: topic,
      line2: `in ${cityTitle}`,
      intro: `CQC-ready workflows for ${cityTitle} clinics — evidence, governance, and patient-facing portals without duct-taped tools.`,
    }
  }
  if (segment === 'software' && pageSlug === 'aesthetic-clinic-software') {
    const topic = toDisplayTitle(entry.title)
    return {
      line1: topic,
      line2: `in ${cityTitle}`,
      intro: `Practical software guidance for ${cityTitle} clinics — consent, operations, and evidence without duct-taped tools.`,
    }
  }

  return getCityScaledHero(cityTitle, pageSlug)
}

export function buildExpansionPageTitle(
  segment: B2bExpansionSegment,
  entry: HubEntry,
  cityTitle: string,
  pageSlug: string
) {
  const hero = getExpansionCityHero(segment, entry, cityTitle, pageSlug)
  if (hero.line2) {
    return `${hero.line1} ${hero.line2}`.replace(/\s+/g, ' ').trim()
  }
  return hero.line1
}

export type ExpansionRouteParams = {
  segment: B2bExpansionSegment
  hubSlug: string
  citySlug: string
}

export function validateExpansionRoute(params: {
  segment: string
  slug: string
  city: string
}): ExpansionRouteParams | null {
  if (!isHubSegment(params.segment) || !isB2bExpansionSegment(params.segment)) {
    return null
  }
  const segment = params.segment
  if (!isExpansionCitySlug(params.city)) {
    return null
  }
  if (segment === 'cqc' && !isCqcExpansionCitySlug(params.city)) {
    return null
  }
  const entry = getHubEntry(segment, params.slug)
  if (!entry || !isExpansionHubSlug(segment, params.slug)) {
    return null
  }
  return { segment, hubSlug: params.slug, citySlug: params.city }
}

export function buildExpansionSitemapPaths(): string[] {
  const paths: string[] = []
  const expansionCities = getB2bExpansionCities()
  const cqcExpansionCities = getCqcExpansionCities()
  for (const segment of B2B_EXPANSION_SEGMENTS) {
    const cities = segment === 'cqc' ? cqcExpansionCities : expansionCities
    for (const entry of getExpansionHubEntries(segment)) {
      for (const city of cities) {
        paths.push(buildExpansionCanonicalPath(segment, entry.slug, city.slug))
      }
    }
  }
  return paths
}

export function expansionBreadcrumbSegmentLabel(segment: B2bExpansionSegment) {
  return segmentLabel(segment)
}

export function getExpansionCityRecord(citySlug: string): B2bExpansionCity | undefined {
  return getExpansionCity(citySlug)
}
