import { buildUrlSetXml, mapPathsToSitemapUrls, xmlResponse } from '@/lib/sitemap'
import { getServiceCityEntries } from '@/lib/directory-seo-pages'

export async function GET() {
  const paths = getServiceCityEntries().map(
    (entry) => `/${entry.serviceSlug}/${entry.locationSlug}`
  )
  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
