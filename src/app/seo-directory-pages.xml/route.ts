import { listDirectoryPageMetaPaths } from '@/lib/directory-page-meta'
import {
  buildUrlSetXml,
  mapPathsToSitemapUrls,
  xmlResponse,
} from '@/lib/sitemap'

/**
 * Sitemap covering every crawlable directory page that has Moiz SEO metas
 * (clinic/practitioner city × treatment, city hubs, treatments, products, etc.).
 */
export async function GET() {
  const paths = listDirectoryPageMetaPaths()
  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
