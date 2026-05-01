import { getClinicsFromDb } from '@/lib/sitemap-data'
import { buildUrlSetXml, encodeCitySegment, encodeSegment, mapPathsToSitemapUrls, xmlResponse } from '@/lib/sitemap'

export const dynamic = 'force-dynamic'

export async function GET() {
  const clinics = await getClinicsFromDb()

  const paths = clinics
    .filter((clinic) => Boolean(clinic.slug) && Boolean(clinic.City))
    .map(
      (clinic) =>
        `/clinics/${encodeCitySegment(clinic.City!)}/clinic/${encodeSegment(clinic.slug as string)}`
    )

  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
