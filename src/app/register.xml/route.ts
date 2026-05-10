import { buildUrlSetXml, mapPathsToSitemapUrls, xmlResponse } from '@/lib/sitemap'

export async function GET() {
  const urls = mapPathsToSitemapUrls(
    ['/register/clinic', '/register/practitioner'],
    undefined,
    'monthly',
    0.8
  )
  return xmlResponse(buildUrlSetXml(urls))
}
