export const PRODUCT_SITEMAP_FILES = [
  'products-brands-base.xml',
  'products-brands-list.xml',
  'products-brands-items.xml',
  'products-categories-base.xml',
  'products-categories-list.xml',
  'products-categories-items.xml',
] as const

export const isProductSitemapCrawlHeld = (): boolean =>
  process.env.NEXT_PUBLIC_HOLD_PRODUCT_SITEMAPS === 'true'

export const filterSitemapIndexFiles = (files: string[]): string[] => {
  if (!isProductSitemapCrawlHeld()) {
    return files
  }
  const held = new Set<string>(PRODUCT_SITEMAP_FILES)
  return files.filter((file) => !held.has(file))
}
