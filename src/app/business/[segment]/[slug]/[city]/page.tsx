import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { HubCityScaledPage } from '@/components/b2b-hub/hub-city-scaled-page'
import { getExpansionCityTitle } from '@/lib/b2b-hub/expansion-cities'
import { hubExpansionCityMetadata } from '@/lib/b2b-hub/expansion-metadata'
import {
  buildExpansionCanonicalPath,
  buildExpansionPageTitle,
  expansionBreadcrumbSegmentLabel,
  getExpansionCityHero,
  resolveExpansionCityPageSlug,
  validateExpansionRoute,
} from '@/lib/b2b-hub/expansion-pages'
import { getCityMarketStats } from '@/lib/b2b-hub/city-page-stats'
import { getHubEntry, hubSegmentCollectionHref } from '@/lib/b2b-hub/registry'

export const revalidate = 300

type Props = { params: { segment: string; slug: string; city: string } }

export function generateMetadata({ params }: Props): Metadata {
  const route = validateExpansionRoute(params)
  if (!route) {
    return { title: 'Not found' }
  }
  const entry = getHubEntry(route.segment, route.hubSlug)
  if (!entry) {
    return { title: 'Not found' }
  }
  return hubExpansionCityMetadata(route.segment, entry, route.citySlug)
}

export default function BusinessExpansionCityPage({ params }: Props) {
  const route = validateExpansionRoute(params)
  if (!route) {
    notFound()
  }

  const entry = getHubEntry(route.segment, route.hubSlug)
  if (!entry) {
    notFound()
  }

  const cityTitle = getExpansionCityTitle(route.citySlug)
  const pageSlug = resolveExpansionCityPageSlug(route.segment, route.hubSlug)
  const pageTitle = buildExpansionPageTitle(route.segment, entry, cityTitle, pageSlug)
  const stats = getCityMarketStats(cityTitle)
  const canonicalPath = buildExpansionCanonicalPath(
    route.segment,
    route.hubSlug,
    route.citySlug
  )

  return (
    <HubCityScaledPage
      citySlug={route.citySlug}
      cityTitle={cityTitle}
      pageSlug={pageSlug}
      pageTitle={pageTitle}
      stats={stats}
      canonicalPath={canonicalPath}
      heroOverride={getExpansionCityHero(route.segment, entry, cityTitle, pageSlug)}
      expansionBreadcrumb={{
        segmentLabel: expansionBreadcrumbSegmentLabel(route.segment),
        segmentHref: hubSegmentCollectionHref(route.segment),
        hubTitle: entry.title,
        hubHref: `/business/${route.segment}/${route.hubSlug}/`,
      }}
    />
  )
}
