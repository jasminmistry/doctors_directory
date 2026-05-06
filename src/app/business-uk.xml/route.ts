import { buildUrlSetXml, mapBusinessHubPathsToSitemapUrls, xmlResponse } from "@/lib/sitemap"

export async function GET() {
  const xml = buildUrlSetXml(mapBusinessHubPathsToSitemapUrls(["/business/uk/"]))
  return xmlResponse(xml)
}
