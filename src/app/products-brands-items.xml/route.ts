import {
  buildUrlSetXml,
  encodeSegment,
  encodeSegmentForRouteParam,
  mapPathsToSitemapUrls,
  xmlResponse,
} from '@/lib/sitemap'
import { getAllProducts } from '@/lib/data-access/products'

export const dynamic = 'force-dynamic'

export async function GET() {
  const products = await getAllProducts()

  const paths = products
    .filter((product) => Boolean(product.slug) && Boolean(product.brand))
    .map(
      (product) =>
        `/products/brands/${encodeSegmentForRouteParam(product.brand as string)}/${encodeSegment(product.slug)}`
    )

  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
