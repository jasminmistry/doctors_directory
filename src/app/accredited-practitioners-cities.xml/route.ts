import {
  buildUrlSetXml,
  encodeCitySegment,
  mapPathsToSitemapUrls,
  uniqueStrings,
  xmlResponse,
} from '@/lib/sitemap'
import {
  ACCREDITATION_KEYS,
  getEnrichedPractitionersFromDb,
  hasAccreditationArrayFlag,
} from '@/lib/sitemap-data'

export async function GET() {
  const practitioners = await getEnrichedPractitionersFromDb()
  const paths: string[] = []

  for (const accreditation of ACCREDITATION_KEYS) {
    const cities = uniqueStrings(
      practitioners
        .filter((entry) => hasAccreditationArrayFlag(entry, accreditation))
        .map((entry) => entry.City)
    )

    for (const city of cities) {
      paths.push(`/accredited/${accreditation}/practitioners/${encodeCitySegment(city)}`)
    }
  }

  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
