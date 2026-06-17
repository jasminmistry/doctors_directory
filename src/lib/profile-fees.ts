import { normalizeTreatmentToken } from '@/lib/treatment-match'

type FeeItem = {
  treatment: string
  price: string
}

const currencyRegex = /(?:£|GBP\s*)([0-9][0-9,]*(?:\.\d+)?)/gi

const isQuotableFeePrice = (price: string): boolean => {
  const normalized = price.trim().toLowerCase()
  if (!readCurrencyValues(price).length) {
    return false
  }
  if (
    /^(price varies|varies|enquire|contact|not listed|n\/a|upon request|on request)/i.test(
      normalized
    )
  ) {
    return false
  }
  return true
}

const readCurrencyValues = (value: string): number[] =>
  [...value.matchAll(currencyRegex)]
    .map((match) => Number.parseFloat(match[1].replaceAll(',', '')))
    .filter((entry) => Number.isFinite(entry) && entry > 0)

export const extractFeeItems = (fees: unknown): FeeItem[] => {
  if (!fees) {
    return []
  }

  if (Array.isArray(fees)) {
    return fees.flatMap((entry) => extractFeeItems(entry))
  }

  if (typeof fees === 'object') {
    const record = fees as Record<string, unknown>

    if (typeof record.treatment === 'string' && typeof record.price === 'string') {
      return [{ treatment: record.treatment, price: record.price }]
    }

    return Object.values(record).flatMap((entry) => extractFeeItems(entry))
  }

  if (typeof fees === 'string') {
    const values = readCurrencyValues(fees)
    if (values.length === 0) {
      return []
    }
    return [{ treatment: 'General', price: fees }]
  }

  return []
}

const botoxFeePattern =
  /botox|anti[\s-]?wrinkle|wrinkle[-\s]?reducing|line relaxing|botulinum/i

const feeTreatmentMatchers: { pattern: RegExp; slugs: string[] }[] = [
  { pattern: botoxFeePattern, slugs: ['botox', 'anti-wrinkle-treatment'] },
  { pattern: /profhilo/i, slugs: ['profhilo'] },
  { pattern: /polynucleotide/i, slugs: ['polynucleotides', 'polynucleotide-treatment'] },
  { pattern: /morpheus\s*8|rf microneedling|radiofrequency microneedling/i, slugs: ['morpheus8', 'rf-microneedling', 'microneedling-with-radiofrequency'] },
  { pattern: /lemon bottle/i, slugs: ['lemon-bottle'] },
  { pattern: /profhilo structura/i, slugs: ['profhilo-structura', 'profhilo'] },
  { pattern: /seventy hyal/i, slugs: ['seventy-hyal'] },
  { pattern: /jawline filler/i, slugs: ['jawline-filler'] },
  { pattern: /non[\s-]?surgical rhinoplasty|liquid rhinoplasty|nose filler/i, slugs: ['non-surgical-rhinoplasty'] },
  { pattern: /dermal filler|fillers?/i, slugs: ['fillers', 'dermal-filler'] },
  { pattern: /chemical peel|peel/i, slugs: ['chemical-peel'] },
  { pattern: /micro[\s-]?needl/i, slugs: ['micro-needling', 'microneedling-with-radiofrequency'] },
  { pattern: /\bipl\b|intense pulsed/i, slugs: ['ipl-treatment'] },
  { pattern: /\bacne\b/i, slugs: ['acne'] },
  { pattern: /\bhifu\b/i, slugs: ['hifu'] },
  { pattern: /radiofrequency|rf microneedling|morpheus/i, slugs: ['microneedling-with-radiofrequency'] },
]

export const feeTreatmentMatchesContext = (
  feeTreatment: string,
  treatmentSlug?: string,
  treatmentName?: string
): boolean => {
  if (!treatmentSlug && !treatmentName) {
    return true
  }

  const feeToken = normalizeTreatmentToken(feeTreatment)
  const slugToken = treatmentSlug ? normalizeTreatmentToken(treatmentSlug) : ''
  const nameToken = treatmentName ? normalizeTreatmentToken(treatmentName) : ''

  if (slugToken && (feeToken.includes(slugToken) || slugToken.includes(feeToken))) {
    return true
  }

  if (nameToken && (feeToken.includes(nameToken) || nameToken.includes(feeToken))) {
    return true
  }

  for (const matcher of feeTreatmentMatchers) {
    if (!matcher.pattern.test(feeTreatment)) {
      continue
    }
    if (slugToken && matcher.slugs.some((slug) => normalizeTreatmentToken(slug) === slugToken)) {
      return true
    }
    if (nameToken && matcher.slugs.some((slug) => feeToken.includes(normalizeTreatmentToken(slug)))) {
      return true
    }
  }

  if (slugToken === normalizeTreatmentToken('botox') && botoxFeePattern.test(feeTreatment)) {
    return true
  }

  return false
}

export type ProfilePriceOptions = {
  treatmentSlug?: string
  treatmentName?: string
}

export const getProfileListingPrice = (
  fees: unknown,
  options?: ProfilePriceOptions
): number | null => {
  const items = extractFeeItems(fees)
  const quotable = items.filter((item) => isQuotableFeePrice(item.price))
  const scoped =
    options?.treatmentSlug || options?.treatmentName
      ? quotable.filter((item) =>
          feeTreatmentMatchesContext(item.treatment, options.treatmentSlug, options.treatmentName)
        )
      : quotable

  const values = scoped.flatMap((item) => readCurrencyValues(item.price))
  if (values.length === 0) {
    return null
  }

  return Math.min(...values)
}

export const getProfileAveragePrice = (
  fees: unknown,
  options?: ProfilePriceOptions
): number | null => getProfileListingPrice(fees, options)

export const formatProfileDisplayPrice = (
  value: number | null,
  options?: { from?: boolean }
): string => {
  if (value === null) {
    return 'Price on request'
  }

  const rounded = Math.round(value)
  if (options?.from) {
    return `From £${rounded}`
  }
  return `£${rounded}`
}
