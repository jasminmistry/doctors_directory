import { prisma } from '@/lib/db'
import { cache } from 'react'
import type { Product } from '@/lib/types'

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
  return rows.map(convertDbProductToOldType)
})

/**
 * Single product by slug with all fields (cached)
 */
export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const p = await prisma.product.findUnique({ where: { slug } })
  return p ? convertDbProductToOldType(p) : null
})

/**
 * Products filtered by category slug (cached)
 */
export const getProductsByCategory = cache(async (categorySlug: string): Promise<Product[]> => {
  const rows = await prisma.product.findMany({
    where: { category: categorySlug },
    select: SELECT_FOR_LIST,
    orderBy: { productName: 'asc' },
  })
  return rows.map(convertDbProductToOldType)
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
  return rows.map(convertDbProductToOldType)
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
  return rows.map((r: any) => r.brand as string).filter(Boolean)
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
