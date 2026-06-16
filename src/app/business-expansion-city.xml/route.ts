import {
  BUSINESS_EXPANSION_CITY_SITEMAP_FILES,
} from '@/lib/b2b-hub/business-sitemap-xml'
import { buildSitemapIndexXml, toDirectoryUrl, xmlResponse } from '@/lib/sitemap'

/** Legacy URL: mini-index pointing at the four ~40k chunks (GSC transition). */
export async function GET() {
  const xml = buildSitemapIndexXml(
    BUSINESS_EXPANSION_CITY_SITEMAP_FILES.map((file) => toDirectoryUrl(`/${file}`))
  )
  return xmlResponse(xml)
}
