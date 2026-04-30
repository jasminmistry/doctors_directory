import {
  buildUrlSetXml,
  mapPathsToSitemapUrls,
  xmlResponse,
} from '@/lib/sitemap'
import {
  ACCREDITATION_KEYS,
  getEnrichedPractitionersFromDb,
  hasAccreditation,
} from '@/lib/sitemap-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const practitioners = await getEnrichedPractitionersFromDb()
  const paths = ACCREDITATION_KEYS.filter((accreditation) =>
    practitioners.some((entry) => hasAccreditation(entry, accreditation))
  ).map((accreditation) => `/accredited/${accreditation}/practitioners`)

  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
