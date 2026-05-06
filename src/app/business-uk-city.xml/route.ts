import { buildUrlSetXml, mapBusinessHubPathsToSitemapUrls, xmlResponse } from "@/lib/sitemap"
import { getUniqueDirectoryCityNames } from "@/lib/b2b-hub/directory-cities"
import { CITY_LOCAL_PAGE_SLUGS } from "@/lib/b2b-hub/scaled-pages"
import { toUrlSlug } from "@/lib/utils"

export async function GET() {
  const citySlugs = getUniqueDirectoryCityNames().map((city) => toUrlSlug(city))
  const paths = citySlugs.flatMap((city) =>
    CITY_LOCAL_PAGE_SLUGS.map((slug) => `/business/uk/${city}/${slug}/`)
  )
  const xml = buildUrlSetXml(mapBusinessHubPathsToSitemapUrls(paths))
  return xmlResponse(xml)
}
