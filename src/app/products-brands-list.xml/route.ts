import { Product } from '@/lib/types'
import {
  buildUrlSetXml,
  encodeSegmentForRouteParam,
  mapPathsToSitemapUrls,
  uniqueStrings,
  xmlResponse,
} from '@/lib/sitemap'
import { readJsonFileSync } from '@/lib/json-cache'

export async function GET() {
  const products: Product[] = readJsonFileSync('products_processed_new.json')
  const brands = uniqueStrings(products.map((product) => product.brand))
  const paths = brands.map(
    (brand) => `/products/brands/${encodeSegmentForRouteParam(brand)}`
  )

  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
