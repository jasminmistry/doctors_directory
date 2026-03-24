import {
  buildUrlSetXml,
  encodeSegment,
  mapPathsToSitemapUrls,
  xmlResponse,
} from '@/lib/sitemap'
import { Product } from '@/lib/types'
import { readJsonFileSync } from '@/lib/json-cache'

export async function GET() {
  const products: Product[] = readJsonFileSync('products_processed_new.json')

  const paths = products
    .filter((product) => Boolean(product.slug) && Boolean(product.category))
    .map(
      (product) =>
        `/products/category/${encodeSegment(product.category)}/${encodeSegment(product.slug)}`
    )

  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
