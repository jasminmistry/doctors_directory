import { buildExpansionCitySitemapChunkXml } from '@/lib/b2b-hub/business-sitemap-xml'
import { xmlResponse } from '@/lib/sitemap'

export const revalidate = 86400
export const maxDuration = 120

export async function GET() {
  return xmlResponse(buildExpansionCitySitemapChunkXml(1))
}
