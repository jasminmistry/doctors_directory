import {
  buildUrlSetXml,
  encodeSegmentForRouteParam,
  mapPathsToSitemapUrls,
  xmlResponse,
} from '@/lib/sitemap'
import { getAllBrands } from '@/lib/data-access/products'

export async function GET() {
  const brands = await getAllBrands()
  const paths = brands.map(
    (brand) => `/products/brands/${encodeSegmentForRouteParam(brand)}`
  )

  const xml = buildUrlSetXml(mapPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
