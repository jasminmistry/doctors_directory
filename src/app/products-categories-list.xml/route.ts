import {
  buildUrlSetXml,
  encodeSegment,
  mapPathsToSitemapUrls,
  uniqueStrings,
  xmlResponse,
} from '@/lib/sitemap'
import { Product } from '@/lib/types'
import { readJsonFileSync } from '@/lib/json-cache'

export async function GET() {
  const products: Product[] = readJsonFileSync('products_processed_new.json')
  const categories = uniqueStrings(products.map((product) => product.category))
  const paths = categories.map(
    (category) => `/products/category/${encodeSegment(category)}`
  )

  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
