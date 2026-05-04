import {
  buildUrlSetXml,
  mapBusinessHubPathsToSitemapUrls,
  nowIso,
  toBusinessHubUrl,
  type SitemapUrl,
} from "@/lib/sitemap"
import {
  HUB_ENTRIES_BY_SEGMENT,
  HUB_SEGMENTS,
  type HubSegment,
} from "@/lib/b2b-hub/registry"

export const BUSINESS_SITEMAP_SEGMENT_FILES = HUB_SEGMENTS.map(
  (s) => `business-${s}.xml`
)

export const BUSINESS_SITEMAP_INDEX_FILES = [
  "business-hub.xml",
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
