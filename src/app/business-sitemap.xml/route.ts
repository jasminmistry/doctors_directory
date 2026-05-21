import {
  buildSitemapIndexXml,
  toDirectoryUrl,
  xmlResponse,
} from "@/lib/sitemap"
import { BUSINESS_SITEMAP_INDEX_FILES } from "@/lib/b2b-hub/business-sitemap-xml"

export async function GET() {
  const xml = buildSitemapIndexXml(
    BUSINESS_SITEMAP_INDEX_FILES.map((f) => toDirectoryUrl(`/${f}`))
  )
  return xmlResponse(xml)
}
