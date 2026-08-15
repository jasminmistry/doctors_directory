import { getB2cSitemapIndexFiles } from '@/lib/directory-crawl-sitemaps'
import { buildSitemapIndexXml, toDirectoryUrl, xmlResponse } from '@/lib/sitemap'

export async function GET() {
  const xml = buildSitemapIndexXml(
    getB2cSitemapIndexFiles().map((file) => toDirectoryUrl(`/${file}`))
  )

  return xmlResponse(xml)
}
