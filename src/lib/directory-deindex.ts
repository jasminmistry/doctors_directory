import { toUrlSlug } from '@/lib/utils'

const DEINDEXED_PRODUCT_CATEGORY_PATTERNS = [
  /^pain relief$/i,
  /^pharmaceutical/i,
  /^prescription/i,
  /^topical acne medicine/i,
  /^pharmacy medicine/i,
]

const DEINDEXED_PRODUCT_BRANDS = new Set(['zapain'])

const DEINDEXED_STANDALONE_SLUGS = new Set(['pain-relief', 'zapain'])

export const isDeindexedProductCategory = (category: string): boolean => {
  const normalized = category.trim()
  if (DEINDEXED_PRODUCT_CATEGORY_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return true
  }
  return DEINDEXED_STANDALONE_SLUGS.has(toUrlSlug(normalized))
}

export const isDeindexedProductBrand = (brand: string | null | undefined): boolean =>
  brand ? DEINDEXED_PRODUCT_BRANDS.has(brand.trim().toLowerCase()) : false

export const isDeindexedStandaloneSlug = (slug: string): boolean =>
  DEINDEXED_STANDALONE_SLUGS.has(slug) || slug.startsWith('zapain')

export const shouldDeindexProduct = (product: {
  product_category?: string
  brand?: string | null
  product_name?: string
  slug?: string
}): boolean => {
  if (isDeindexedProductBrand(product.brand)) {
    return true
  }
  if (product.product_category && isDeindexedProductCategory(product.product_category)) {
    return true
  }
  const name = (product.product_name ?? '').toLowerCase()
  if (name.includes('zapain')) {
    return true
  }
  const slug = product.slug ?? ''
  if (slug.toLowerCase().includes('zapain')) {
    return true
  }
  return false
}
