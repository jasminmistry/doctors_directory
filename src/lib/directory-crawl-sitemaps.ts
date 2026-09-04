import {
  filterSitemapIndexFiles,
  isProductSitemapCrawlHeld,
} from "@/lib/sitemap-crawl-hold"
import { toDirectoryUrl } from "@/lib/sitemap"

export const B2C_SITEMAP_INDEX_FILES = [
  "register.xml",
  "products-brands-base.xml",
  "products-brands-list.xml",
  "products-brands-items.xml",
  "products-categories-base.xml",
  "products-categories-list.xml",
  "products-categories-items.xml",
  "treatments-base.xml",
  "all-treatments.xml",
  "practitioners-base.xml",
  "practitioners-cities.xml",
  "practitioners-treatments.xml",
  "practitioners-treatments-details.xml",
  "practitioners-credentials-base.xml",
  "practitioners-credentials-details.xml",
  "practitioners-treatment-by-city.xml",
  "clinics-base.xml",
  "clinics-cities.xml",
  "all-clinics.xml",
  "clinics-services.xml",
  "clinics-services-details.xml",
  "clinics-treatment-by-city.xml",
  "accredited-base.xml",
  "accredited-clinics.xml",
  "accredited-clinics-cities.xml",
  "accredited-practitioners.xml",
  "accredited-practitioners-cities.xml",
  "service-city-pages.xml",
  "treatment-city-hub-pages.xml",
  "standalone-treatment-product-pages.xml",
  "best-in-city-pages.xml",
  "seo-directory-pages.xml",
] as const

export const B2B_SITEMAP_INDEX_FILES = [
  "business-hub.xml",
  "business-uk.xml",
  "business-uk-city.xml",
  "business-treatments.xml",
  "business-expansion-city1.xml",
  "business-expansion-city2.xml",
  "business-expansion-city3.xml",
  "business-expansion-city4.xml",
  "business-software.xml",
  "business-compare.xml",
  "business-migrate.xml",
  "business-pricing.xml",
  "business-alternatives.xml",
  "business-cqc.xml",
  "business-consent.xml",
  "business-automation.xml",
  "business-templates.xml",
  "business-practitioners.xml",
] as const

export const getB2cSitemapIndexFiles = (): string[] =>
  filterSitemapIndexFiles([...B2C_SITEMAP_INDEX_FILES])

export const getDirectoryCrawlSitemapUrls = (): string[] => {
  const indexes = [
    toDirectoryUrl("/sitemap.xml"),
    toDirectoryUrl("/business-sitemap.xml"),
  ]
  const b2c = getB2cSitemapIndexFiles().map((file) => toDirectoryUrl(`/${file}`))
  const b2b = B2B_SITEMAP_INDEX_FILES.map((file) => toDirectoryUrl(`/${file}`))
  return [...indexes, ...b2c, ...b2b]
}

export const getDirectoryRobotsDisallowPaths = (): string[] => {
  const productDisallow = isProductSitemapCrawlHeld()
    ? [
        "/directory/products/",
        "/directory/products-brands-",
        "/directory/products-categories-",
      ]
    : []

  return [
    "/directory/admin/",
    "/directory/api/",
    "/directory/zapain/",
    "/directory/pain-relief/",
    "/directory/practitioners/*/profile/",
    ...productDisallow,
  ]
}
