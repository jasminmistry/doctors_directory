import { getClinicsFromDb } from '@/lib/sitemap-data'
import { isRemovedClinicSlug } from '@/lib/directory-removals'
import { buildUrlSetXml, encodeCitySegment, encodeSegment, mapPathsToSitemapUrls, xmlResponse } from '@/lib/sitemap'

export const dynamic = 'force-dynamic'

export async function GET() {
  const clinics = await getClinicsFromDb()

  const paths = clinics
    .filter(
      (clinic) =>
        Boolean(clinic.slug) &&
        Boolean(clinic.City) &&
        !isRemovedClinicSlug(clinic.slug)
    )
    .map(
      (clinic) =>
        `/clinics/${encodeCitySegment(clinic.City!)}/clinic/${encodeSegment(clinic.slug as string)}`
    )

  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
