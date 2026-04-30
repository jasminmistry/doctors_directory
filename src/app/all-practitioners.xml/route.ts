import {
  buildUrlSetXml,
  encodeCitySegment,
  encodeSegment,
  mapPathsToSitemapUrls,
  xmlResponse,
} from '@/lib/sitemap'
import { getEnrichedPractitionersFromDb } from '@/lib/sitemap-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const paths = (await getEnrichedPractitionersFromDb())
    .filter(
      (entry) =>
        typeof entry.practitioner_name === 'string' &&
        entry.practitioner_name.trim().length > 0 &&
        typeof entry.City === 'string' &&
        entry.City.trim().length > 0
    )
    .map(
      (entry) =>
        `/practitioners/${encodeCitySegment(entry.City)}/profile/${encodeSegment(
          entry.practitioner_name as string
        )}`
    )

  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
