import { buildUrlSetXml, mapPathsToSitemapUrls, xmlResponse } from '@/lib/sitemap'
import { getBestInCityEntries } from '@/lib/best-in-city-pages'

export async function GET() {
  const paths = getBestInCityEntries().map((entry) => `/${entry.slug}`)
  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
