import { buildUrlSetXml, mapPathsToSitemapUrls, xmlResponse } from '@/lib/sitemap'
import { getTreatmentCityHubEntries } from '@/lib/treatment-city-hub'

export async function GET() {
  const paths = getTreatmentCityHubEntries().map(
    (entry) => `/${entry.treatmentSlug}/${entry.locationSlug}`
  )
  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
