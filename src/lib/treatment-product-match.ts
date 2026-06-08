import { shouldDeindexProduct } from '@/lib/directory-deindex'
import { readJsonFileSync } from '@/lib/json-cache'
import {
  getTreatmentHubSlugConfig,
  matchClinicTreatmentToHubSlug,
} from '@/lib/treatment-hub-registry'
import type { Product } from '@/lib/types'

export const MIN_TREATMENT_PRODUCTS_FOR_PAGE = 2

const MIN_TOKEN_LENGTH = 4

const foldToken = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '')

const treatmentMatchTokens = (treatmentName: string): string[] => {
  const tokens = new Set<string>()
  const folded = foldToken(treatmentName)
  if (folded.length >= MIN_TOKEN_LENGTH) {
    tokens.add(folded)
  }
  for (const word of treatmentName.toLowerCase().split(/[\s\-/]+/)) {
    const token = foldToken(word)
    if (token.length >= MIN_TOKEN_LENGTH) {
      tokens.add(token)
    }
  }
  const hubSlug = matchClinicTreatmentToHubSlug(treatmentName)
  const config = hubSlug ? getTreatmentHubSlugConfig(hubSlug) : null
  if (config) {
    for (const matchToken of config.matchTokens) {
      const token = foldToken(matchToken)
      if (token.length >= MIN_TOKEN_LENGTH) {
        tokens.add(token)
      }
    }
  }
  return [...tokens]
}

const productFieldTokens = (product: Product): string[] => {
  const fields = [product.product_category, product.product_name, product.brand]
  return fields
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => foldToken(value))
    .filter((value) => value.length >= MIN_TOKEN_LENGTH)
}

const productMatchesTreatment = (product: Product, tokens: string[]): boolean => {
  const fields = productFieldTokens(product)
  for (const token of tokens) {
    for (const field of fields) {
      if (field.includes(token) || token.includes(field)) {
        return true
      }
    }
  }
  return false
}

export function getProductsForTreatment(treatmentName: string): Product[] {
  const tokens = treatmentMatchTokens(treatmentName)
  if (tokens.length === 0) {
    return []
  }
  return readJsonFileSync<Product[]>('products_processed_new.json')
    .filter(
      (product) => !shouldDeindexProduct(product) && productMatchesTreatment(product, tokens)
    )
    .sort((left, right) => left.product_name.localeCompare(right.product_name))
}

export function countTreatmentsWithProductPages(
  minProducts = MIN_TREATMENT_PRODUCTS_FOR_PAGE
): number {
  const treatments = Object.keys(
    readJsonFileSync<Record<string, unknown>>('treatments.json')
  )
  return treatments.filter((name) => getProductsForTreatment(name).length >= minProducts).length
}
