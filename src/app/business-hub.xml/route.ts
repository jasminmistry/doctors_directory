import { buildBusinessHubRootSitemapXml } from "@/lib/b2b-hub/business-sitemap-xml"
import { xmlResponse } from "@/lib/sitemap"

export async function GET() {
  return xmlResponse(buildBusinessHubRootSitemapXml())
}
