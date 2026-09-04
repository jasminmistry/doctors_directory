import { listDirectoryPageMetaPaths } from '@/lib/directory-page-meta'
import {
  buildUrlSetXml,
  mapPathsToSitemapUrls,
  xmlResponse,
} from '@/lib/sitemap'

export async function GET() {
  const paths = listDirectoryPageMetaPaths()
  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
