import {
  buildUrlSetXml,
  encodeSegment,
  mapPathsToSitemapUrls,
  xmlResponse,
} from '@/lib/sitemap'
import { getAllProducts } from '@/lib/data-access/products'
import { isRedirectedCategorySlug } from '@/lib/product-removals'

export const dynamic = 'force-dynamic'

export async function GET() {
  const products = await getAllProducts()

  const paths = products
    .filter(
      (product) =>
        Boolean(product.slug) &&
        Boolean(product.category) &&
        !isRedirectedCategorySlug(product.slug)
    )
    .map(
      (product) =>
        `/products/category/${encodeSegment(product.category)}/${encodeSegment(product.slug)}`
    )

  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
