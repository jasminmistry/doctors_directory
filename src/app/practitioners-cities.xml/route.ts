import { buildUrlSetXml, encodeCitySegment, mapPathsToSitemapUrls, uniqueStrings, xmlResponse } from '@/lib/sitemap'
import { getEnrichedPractitionersFromDb } from '@/lib/sitemap-data'

export async function GET() {
  const cities = uniqueStrings((await getEnrichedPractitionersFromDb()).map((entry) => entry.City))
  const paths = cities.map((city) => `/practitioners/${encodeCitySegment(city)}`)

  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
