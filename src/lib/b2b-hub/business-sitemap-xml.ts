import {
  buildUrlSetXml,
  mapBusinessHubPathsToSitemapUrls,
  nowIso,
  toBusinessHubUrl,
  type SitemapUrl,
} from "@/lib/sitemap"
import { buildExpansionSitemapPaths } from "@/lib/b2b-hub/expansion-pages"
import { getB2bExpansionCities } from "@/lib/b2b-hub/expansion-cities"
import {
  buildTemplateExpansionPath,
  TEMPLATE_ENTRIES,
} from "@/lib/b2b-hub/templates-registry"
import {
  HUB_ENTRIES_BY_SEGMENT,
  HUB_SEGMENTS,
  type HubSegment,
} from "@/lib/b2b-hub/registry"

/** Ganesh / GSC: keep each expansion-city sitemap at ~40k URLs (was ~160k in one file). */
export const BUSINESS_EXPANSION_CITY_SITEMAP_CHUNK_SIZE = 40_000

export const BUSINESS_EXPANSION_CITY_SITEMAP_FILES = [
  "business-expansion-city1.xml",
  "business-expansion-city2.xml",
  "business-expansion-city3.xml",
  "business-expansion-city4.xml",
] as const

export function buildAllExpansionCitySitemapPaths(): string[] {
  return [
    ...buildExpansionSitemapPaths(),
    ...TEMPLATE_ENTRIES.flatMap((entry) =>
      getB2bExpansionCities().map((city) =>
        buildTemplateExpansionPath(entry.slug, city.slug)
      )
    ),
  ]
}

export function getExpansionCitySitemapChunkPaths(chunkIndex: number): string[] {
  if (chunkIndex < 1 || chunkIndex > BUSINESS_EXPANSION_CITY_SITEMAP_FILES.length) {
    return []
  }
  const start = (chunkIndex - 1) * BUSINESS_EXPANSION_CITY_SITEMAP_CHUNK_SIZE
  return buildAllExpansionCitySitemapPaths().slice(
    start,
    start + BUSINESS_EXPANSION_CITY_SITEMAP_CHUNK_SIZE
  )
}

export function buildExpansionCitySitemapChunkXml(chunkIndex: number): string {
  return buildUrlSetXml(
    mapBusinessHubPathsToSitemapUrls(getExpansionCitySitemapChunkPaths(chunkIndex))
  )
}

export const BUSINESS_SITEMAP_SEGMENT_FILES = HUB_SEGMENTS.map(
  (s) => `business-${s}.xml`
)

export const BUSINESS_SITEMAP_INDEX_FILES = [
  "business-hub.xml",
  "business-uk.xml",
  "business-uk-city.xml",
  "business-treatments.xml",
  ...BUSINESS_EXPANSION_CITY_SITEMAP_FILES,
  ...BUSINESS_SITEMAP_SEGMENT_FILES,
]

export function buildBusinessHubRootSitemapXml(): string {
  const urls: SitemapUrl[] = [
    {
      loc: toBusinessHubUrl("/business/"),
      lastmod: nowIso(),
      changefreq: "weekly",
      priority: 0.9,
    },
    {
      loc: toBusinessHubUrl("/business/uk/"),
      lastmod: nowIso(),
      changefreq: "weekly",
      priority: 0.7,
    },
    {
      loc: toBusinessHubUrl("/business/treatments/"),
      lastmod: nowIso(),
      changefreq: "weekly",
      priority: 0.7,
    },
  ]
  return buildUrlSetXml(urls)
}

export function buildBusinessSegmentSitemapXml(segment: HubSegment): string {
  const entries = HUB_ENTRIES_BY_SEGMENT[segment] ?? []
  const paths = [
    `/business/${segment}/`,
    ...entries.map((e) => `/business/${e.segment}/${e.slug}/`),
  ]
  return buildUrlSetXml(mapBusinessHubPathsToSitemapUrls(paths))
}
