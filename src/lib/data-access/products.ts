import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { cache } from 'react'
import type { Product } from '@/lib/types'
import { filterRemovedBrands, filterRemovedProducts, REMOVED_PRODUCT_SLUGS } from '@/lib/product-removals'

// Map a Prisma Product record to the old Product interface shape
export function convertDbProductToOldType(p: any): Product {
  return {
    slug: p.slug,
    key: String(p.id),
    product_name: p.productName || '',
    product_category: p.productCategory || '',
    product_subcategory: p.productSubcategory || '',
    is_aesthetics_dermatology_related: p.isAestheticsDermatologyRelated ?? null,
    all_prices: p.allPrices ?? null,
    brand: p.brand ?? null,
    manufacturer: p.manufacturer ?? null,
    distributor: p.distributor ?? null,
    distributor_cleaned: p.distributorCleaned || '',
    sku: p.sku ?? null,
    image_url: p.imageUrl ?? null,
    product_document_pdf_from_manufacturer: p.documentPdfUrl ?? null,
    description: p.description || '',
    key_benefits: p.keyBenefits ?? null,
    indications: p.indications ?? null,
    composition: p.composition ?? null,
    formulation: p.formulation ?? null,
    packaging: p.packaging ?? null,
    usage_instructions: p.usageInstructions ?? null,
    treatment_duration: p.treatmentDuration ?? null,
    onset_of_effect: p.onsetOfEffect ?? null,
    contraindications: p.contraindications ?? null,
    adverse_effects: p.adverseEffects ?? null,
    storage_conditions: p.storageConditions ?? null,
    mhra_approved: p.mhraApproved ?? null,
    ce_marked: p.ceMarked ?? null,
    mhra_link: p.mhraLink ?? null,
    certifications_and_compliance: p.certifications ?? null,
    brand_about: p.brandAbout ?? null,
    seller_about: p.sellerAbout ?? null,
    source_verified_on: p.sourceVerifiedOn ? String(p.sourceVerifiedOn) : null,
    data_confidence_score: p.dataConfidenceScore ? Number(p.dataConfidenceScore) : null,
    verification_sources: p.verificationSources ?? null,
    sources: null,
    category: p.category || '',
  }
}

const SELECT_FOR_LIST = {
  id: true,
  slug: true,
  productName: true,
  productCategory: true,
  category: true,
  brand: true,
  distributorCleaned: true,
  imageUrl: true,
  allPrices: true,
  manufacturer: true,
}

/**
 * All products (lightweight) for search, sitemaps, and list pages (cached)
 */
export const getAllProducts = cache(async (): Promise<Product[]> => {
  const rows = await prisma.product.findMany({
    select: SELECT_FOR_LIST,
    orderBy: { productName: 'asc' },
  })
  return filterRemovedProducts(rows.map(convertDbProductToOldType))
})

/**
 * Single product by slug with all fields (cached)
 */
export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const p = await prisma.product.findUnique({ where: { slug } })
  return p ? convertDbProductToOldType(p) : null
})

/**
 * Filtered + paginated products for the /search page's Product tab. Mirrors the word-tokenized
 * AND/OR filter semantics that used to run in JS over the full dataset in
 * src/app/actions/search.ts, but pushed down to a real indexed WHERE + LIMIT/OFFSET query.
 *
 * Preserves the current search.ts quirks rather than "fixing" them: the `category` filter
 * actually matches against `brand`, `location` is an exact match against `distributorCleaned`
 * (not a substring match), and sort is always by product name — the old code's rating/reviews
 * sort options were already no-ops for products since mapped product rows have no rating field.
 */
export async function searchProductsForListing(params: {
  query?: string
  category?: string
  location?: string
  services?: string[]
  skip: number
  take: number
}): Promise<{ products: Product[]; totalCount: number }> {
  const and: Prisma.ProductWhereInput[] = [
    { slug: { notIn: [...REMOVED_PRODUCT_SLUGS] } },
  ]

  if (params.query) {
    const words = params.query.toLowerCase().split(/\s+/).filter((word) => word.length > 0)
    for (const word of words) {
      and.push({
        OR: [
          { productName: { contains: word } },
          { category: { contains: word } },
          { brand: { contains: word } },
          { manufacturer: { contains: word } },
        ],
      })
    }
  }

  if (params.category && params.category !== 'All Categories') {
    and.push({ brand: params.category })
  }

  if (params.location) {
    and.push({ distributorCleaned: params.location })
  }

  if (params.services && params.services.length > 0) {
    and.push({
      OR: params.services.map((service) => ({
        category: { contains: service },
      })),
    })
  }

  const where: Prisma.ProductWhereInput = { AND: and }

  const [rows, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      select: SELECT_FOR_LIST,
      orderBy: { productName: 'asc' },
      skip: params.skip,
      take: params.take,
    }),
    prisma.product.count({ where }),
  ])

  return { products: rows.map(convertDbProductToOldType), totalCount }
}

/**
 * Products filtered by category slug (cached)
 */
export const getProductsByCategory = cache(async (categorySlug: string): Promise<Product[]> => {
  const rows = await prisma.product.findMany({
    where: { category: categorySlug },
    select: SELECT_FOR_LIST,
    orderBy: { productName: 'asc' },
  })
  return filterRemovedProducts(rows.map(convertDbProductToOldType))
})

/**
 * Products filtered by brand (cached)
 */
export const getProductsByBrand = cache(async (brand: string): Promise<Product[]> => {
  const rows = await prisma.product.findMany({
    where: { brand },
    select: SELECT_FOR_LIST,
    orderBy: { productName: 'asc' },
  })
  return filterRemovedProducts(rows.map(convertDbProductToOldType))
})

/**
 * All distinct brand names (cached) — for the brands index page
 */
export const getAllBrands = cache(async (): Promise<string[]> => {
  const rows = await prisma.product.findMany({
    select: { brand: true },
    distinct: ['brand'],
    where: { brand: { not: null } },
    orderBy: { brand: 'asc' },
  })
  return filterRemovedBrands(rows.map((r: any) => r.brand as string).filter(Boolean))
})

/**
 * All distinct category slugs (cached) — for sitemaps / category index
 */
export const getAllCategorySlugs = cache(async (): Promise<string[]> => {
  const rows = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
    where: { category: { not: null } },
    orderBy: { category: 'asc' },
  })
  return rows.map((r: any) => r.category as string).filter(Boolean)
})
