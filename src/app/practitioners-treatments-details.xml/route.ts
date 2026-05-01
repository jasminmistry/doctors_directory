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
  const pairs = new Set<string>()

  for (const entry of await getEnrichedPractitionersFromDb()) {
    if (!entry.City || !Array.isArray(entry.Treatments)) continue

    for (const treatment of entry.Treatments) {
      if (typeof treatment !== 'string' || treatment.trim().length === 0) continue
      pairs.add(`${entry.City}::${treatment}`)
    }
  }

  const paths = [...pairs].map((pair) => {
    const [city, treatment] = pair.split('::')
    return `/practitioners/${encodeCitySegment(city)}/treatments/${encodeSegment(treatment)}`
  })

  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
