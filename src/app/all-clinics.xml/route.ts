import { Clinic } from '@/lib/types'
import { readJsonFileSync } from '@/lib/json-cache'
import { buildUrlSetXml, encodeCitySegment, encodeSegment, mapPathsToSitemapUrls, xmlResponse } from '@/lib/sitemap'

export async function GET() {
  const clinics: Clinic[] = readJsonFileSync('clinics_processed_new_data.json')

  const paths = clinics
    .filter((clinic) => Boolean(clinic.slug) && Boolean(clinic.City))
    .map(
      (clinic) =>
        `/clinics/${encodeCitySegment(clinic.City)}/clinic/${encodeSegment(clinic.slug as string)}`
    )

  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
