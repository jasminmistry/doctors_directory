import { buildUrlSetXml, mapPathsToSitemapUrls, xmlResponse } from '@/lib/sitemap'
import { getStandaloneDirectoryEntries } from '@/lib/directory-seo-pages'

export async function GET() {
  const paths = getStandaloneDirectoryEntries().map((entry) => `/${entry.slug}`)
  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
