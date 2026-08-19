import { search_categories, locations } from '@/lib/data'
import { isDeindexedProductCategory, isDeindexedStandaloneSlug, shouldDeindexProduct } from '@/lib/directory-deindex'
import { readJsonFileSync } from '@/lib/json-cache'
import { getClinics } from '@/lib/sitemap-data'
import { isAllowedHubLocationSlug } from '@/lib/hub-location-slugs'
import { getProductsForTreatment, MIN_TREATMENT_PRODUCTS_FOR_PAGE } from '@/lib/treatment-product-match'
import { toUrlSlug } from '@/lib/utils'
import type { City, Clinic, Product } from '@/lib/types'

const MIN_LISTINGS_PER_PAGE = 3
const MIN_STANDALONE_PRODUCTS = 3

// Every top-level directory under src/app that has no page.tsx of its own at
// that exact path (only deeper subpages, e.g. features/analytics) — a bare
// request to one of these falls through to this catch-all route, so it must
// be rejected before any data lookup runs.
const RESERVED_SINGLE_SEGMENT_SLUGS = new Set([
  'admin',
  'api',
  'business',
  'claim',
  'clinics',
  'events',
  'features',
  'portal',
  'practitioners',
  'products',
  'register',
  'search',
  'sitemap',
  'stores',
  'treatments',
  'verify',
  'accredited',
])

const searchCategoryBySlug = new Map(
  search_categories.map((label) => [toUrlSlug(label), label])
)

const locationBySlug = new Map(locations.map((label) => [toUrlSlug(label), label]))

export type ServiceCityEntry = {
  serviceSlug: string
  serviceLabel: string
  locationSlug: string
  locationLabel: string
  clinicCount: number
}

const getCityData = (): City[] => readJsonFileSync('city_data_processed.json')

const clinicMatchesServiceAndLocation = (
  clinic: Clinic,
  serviceSlug: string,
  locationSlug: string
): boolean =>
  toUrlSlug(clinic.category ?? '') === serviceSlug &&
  toUrlSlug(clinic.City ?? '') === locationSlug

export const getServiceCityEntries = (): ServiceCityEntry[] => {
  const clinics = getClinics()
  const counts = new Map<
    string,
    { serviceSlug: string; serviceLabel: string; locationSlug: string; locationLabel: string; clinicCount: number }
  >()

  for (const clinic of clinics) {
    const serviceSlug = toUrlSlug(clinic.category ?? '')
    const locationSlug = toUrlSlug(clinic.City ?? '')
    const serviceLabel = searchCategoryBySlug.get(serviceSlug)
    const locationLabel = locationBySlug.get(locationSlug)
    if (!serviceLabel || !locationLabel || !isAllowedHubLocationSlug(locationSlug)) {
      continue
    }
    const key = `${serviceSlug}|${locationSlug}`
    const existing = counts.get(key)
    if (existing) {
      existing.clinicCount += 1
      continue
    }
    counts.set(key, {
      serviceSlug,
      serviceLabel,
      locationSlug,
      locationLabel,
      clinicCount: 1,
    })
  }

  return [...counts.values()]
    .filter((entry) => entry.clinicCount >= MIN_LISTINGS_PER_PAGE)
    .sort((left, right) => {
      if (left.serviceSlug === right.serviceSlug) {
        return left.locationSlug.localeCompare(right.locationSlug)
      }
      return left.serviceSlug.localeCompare(right.serviceSlug)
    })
}

export const getServiceCityEntry = (
  serviceSlug: string,
  locationSlug: string
): ServiceCityEntry | null =>
  getServiceCityEntries().find(
    (entry) =>
      entry.serviceSlug === serviceSlug &&
      entry.locationSlug === locationSlug &&
      isAllowedHubLocationSlug(locationSlug)
  ) ?? null

export const getServiceCityClinics = (serviceSlug: string, locationSlug: string): Clinic[] =>
  getClinics()
    .filter((clinic) => clinicMatchesServiceAndLocation(clinic, serviceSlug, locationSlug))
    .sort(
      (left, right) =>
        (Number(right.reviewCount) || 0) - (Number(left.reviewCount) || 0) ||
        (Number(right.rating) || 0) - (Number(left.rating) || 0)
    )

export const getCityContentByLocationSlug = (locationSlug: string): City | null =>
  getCityData().find((entry) => toUrlSlug(entry.City) === locationSlug) ?? null

const getTreatmentNames = (): string[] =>
  Object.keys(readJsonFileSync<Record<string, unknown>>('treatments.json'))

const getProductCategories = (): string[] => {
  const products = readJsonFileSync<Product[]>('products_processed_new.json')
  const categories = new Set<string>()
  for (const product of products) {
    if (typeof product.product_category === 'string' && product.product_category.trim().length > 0) {
      categories.add(product.product_category.trim())
    }
  }
  return [...categories]
}

const MIN_TREATMENT_PRODUCTS = MIN_TREATMENT_PRODUCTS_FOR_PAGE

export type StandalonePageEntry =
  | { type: 'treatment'; slug: string; name: string; targetPath: string }
  | { type: 'product'; slug: string; name: string; targetPath: string }
  | {
      type: 'treatment-product'
      slug: string
      name: string
      treatmentName: string
      targetPath: string
    }

export const getStandaloneTreatmentClinics = (treatmentName: string): Clinic[] =>
  getClinics()
    .filter((clinic) =>
      (clinic.Treatments ?? []).some((treatment) => toUrlSlug(treatment) === toUrlSlug(treatmentName))
    )
    .sort(
      (left, right) =>
        (Number(right.reviewCount) || 0) - (Number(left.reviewCount) || 0) ||
        (Number(right.rating) || 0) - (Number(left.rating) || 0)
    )

export const getStandaloneProductItems = (productCategory: string): Product[] =>
  readJsonFileSync<Product[]>('products_processed_new.json')
    .filter(
      (product) =>
        toUrlSlug(product.product_category) === toUrlSlug(productCategory) &&
        !shouldDeindexProduct(product)
    )
    .sort((left, right) => left.product_name.localeCompare(right.product_name))

// Rebuilding this list scans every treatment against every clinic and every
// product category against every product — expensive, and with no
// generateStaticParams on the [slug] route, a notFound() render for an
// unmatched slug isn't cached by Next.js. Without this memoization, every
// crawler request to a bogus single-segment path reruns the full scan.
let cachedStandaloneDirectoryEntries: StandalonePageEntry[] | null = null

export const getStandaloneDirectoryEntries = (): StandalonePageEntry[] => {
  if (cachedStandaloneDirectoryEntries) {
    return cachedStandaloneDirectoryEntries
  }

  const treatments: StandalonePageEntry[] = getTreatmentNames()
    .flatMap((name) => {
      const baseSlug = toUrlSlug(name)
      if (getStandaloneTreatmentClinics(name).length < MIN_LISTINGS_PER_PAGE) {
        return []
      }
      return [
        {
          type: 'treatment' as const,
          slug: `${baseSlug}-treatment`,
          name,
          targetPath: `/treatments/${baseSlug}`,
        },
      ]
    })

  const products: StandalonePageEntry[] = getProductCategories()
    .filter((name) => !isDeindexedProductCategory(name))
    .filter((name) => getStandaloneProductItems(name).length >= MIN_STANDALONE_PRODUCTS)
    .map((name) => ({
      type: 'product',
      slug: toUrlSlug(name),
      name,
      targetPath: `/products/category/${toUrlSlug(name)}`,
    }))

  const treatmentProducts: StandalonePageEntry[] = getTreatmentNames().flatMap((name) => {
    const baseSlug = toUrlSlug(name)
    const slug = `${baseSlug}-products`
    if (getProductsForTreatment(name).length < MIN_TREATMENT_PRODUCTS) {
      return []
    }
    return [
      {
        type: 'treatment-product' as const,
        slug,
        name,
        treatmentName: name,
        targetPath: `/treatments/${baseSlug}`,
      },
    ]
  })

  const merged = [...treatments, ...products, ...treatmentProducts]
    .filter((entry) => !RESERVED_SINGLE_SEGMENT_SLUGS.has(entry.slug))
    .filter((entry) => !isDeindexedStandaloneSlug(entry.slug))
    .filter((entry) => !searchCategoryBySlug.has(entry.slug))
    .sort((left, right) => left.slug.localeCompare(right.slug))

  const uniqueBySlug = new Map<string, StandalonePageEntry>()
  for (const entry of merged) {
    if (!uniqueBySlug.has(entry.slug)) {
      uniqueBySlug.set(entry.slug, entry)
    }
  }
  cachedStandaloneDirectoryEntries = [...uniqueBySlug.values()]
  return cachedStandaloneDirectoryEntries
}

export const getStandaloneDirectoryEntry = (slug: string): StandalonePageEntry | null => {
  if (RESERVED_SINGLE_SEGMENT_SLUGS.has(slug)) {
    return null
  }
  return getStandaloneDirectoryEntries().find((entry) => entry.slug === slug) ?? null
}
