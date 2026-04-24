import {
  buildUrlSetXml,
  encodeCitySegment,
  mapPathsToSitemapUrls,
  uniqueStrings,
  xmlResponse,
} from '@/lib/sitemap'
import { getEnrichedPractitionersFromDb } from '@/lib/sitemap-data'

export async function GET() {
  const cities = uniqueStrings(
    (await getEnrichedPractitionersFromDb())
      .filter(
        (entry) => Array.isArray(entry.Treatments) && entry.Treatments.length > 0
      )
      .map((entry) => entry.City)
  )

  const paths = cities.map((city) => `/practitioners/${encodeCitySegment(city)}/treatments`)
  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
