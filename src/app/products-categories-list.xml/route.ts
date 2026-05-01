import {
  buildUrlSetXml,
  encodeSegment,
  mapPathsToSitemapUrls,
  xmlResponse,
} from '@/lib/sitemap'
import { getAllCategorySlugs } from '@/lib/data-access/products'

export const dynamic = 'force-dynamic'

export async function GET() {
  const categories = await getAllCategorySlugs()
  const paths = categories.map(
    (category) => `/products/category/${encodeSegment(category)}`
  )

  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
