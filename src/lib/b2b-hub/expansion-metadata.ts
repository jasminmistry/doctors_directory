import type { Metadata } from 'next'
import {
  buildHubPageMetadata,
  hubCityPageMetaDescription,
  hubCityPageMetaTitle,
  hubDetailMetaDescription,
  hubDetailMetaTitle,
} from '@/lib/b2b-hub/hub-page-metadata'
import {
  buildExpansionCanonicalPath,
  buildExpansionPageTitle,
  resolveExpansionCityPageSlug,
  type B2bExpansionSegment,
} from '@/lib/b2b-hub/expansion-pages'
import { getExpansionCityTitle } from '@/lib/b2b-hub/expansion-cities'
import type { HubEntry } from '@/lib/b2b-hub/registry'

export function hubExpansionCityMetadata(
  segment: B2bExpansionSegment,
  entry: HubEntry,
  citySlug: string
): Metadata {
  const cityTitle = getExpansionCityTitle(citySlug)
  const pageSlug = resolveExpansionCityPageSlug(segment, entry.slug)
  const pageTitle = buildExpansionPageTitle(segment, entry, cityTitle, pageSlug)
  const canonicalPath = buildExpansionCanonicalPath(segment, entry.slug, citySlug)

  const usesCityScaledMeta =
    segment === 'software' ||
    segment === 'consent' ||
    segment === 'cqc' ||
    pageSlug === entry.slug

  const title = usesCityScaledMeta
    ? hubCityPageMetaTitle(cityTitle, pageSlug, pageTitle, citySlug)
    : `${hubDetailMetaTitle(segment, entry).replace(/\s*-\s*Consentz.*$/i, '')} - ${cityTitle}`

  const description = usesCityScaledMeta
    ? hubCityPageMetaDescription(cityTitle, pageTitle, citySlug)
    : `${hubDetailMetaDescription(segment, entry)} Local guidance for ${cityTitle} clinics.`

  return buildHubPageMetadata({
    title,
    description,
    canonicalPath,
    ogType: 'article',
  })
}
