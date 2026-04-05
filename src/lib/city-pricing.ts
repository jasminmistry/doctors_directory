import type { Clinic } from "@/lib/types"
import { toUrlSlug } from "@/lib/utils"

export interface CityTreatmentPriceInsight {
  treatment: string
  href: string
  rangeText: string
  sentence: string
  supportCount: number
}

interface FeeItem {
  treatment: string
  price: string
}

interface TreatmentBucket {
  treatment: string
  values: number[]
  clinicSlugs: Set<string>
}

const currencyRegex = /(?:£|GBP\s*)([0-9][0-9,]*(?:\.\d+)?)/gi

const ignoredTreatmentRegex =
  /consultation|source|report|form|nhs|private medical report|procedurerange/i

const canonicalTreatment = (value: string): string | null => {
  const normalized = value.trim().toLowerCase()

  if (!normalized || ignoredTreatmentRegex.test(normalized)) {
    return null
  }

  if (/botox|anti[\s-]?wrinkle|wrinkle[-\s]?reducing|line relaxing|botulinum toxin/.test(normalized)) {
    return "Botox"
  }

  if (/(lip|lips).*(filler|augmentation|enhancement)|\blip filler\b/.test(normalized)) {
    return "Lip filler"
  }

  if (/dermal filler|fillers/.test(normalized)) {
    return "Dermal filler"
  }

  if (/skin booster|skinvive/.test(normalized)) {
    return "Skin booster"
  }

  if (/profhilo/.test(normalized)) {
    return "Profhilo"
  }

  if (/microneedling/.test(normalized)) {
    return "Microneedling"
  }

  if (/laser hair/.test(normalized)) {
    return "Laser hair removal"
  }

  if (/chemical peel|peel/.test(normalized)) {
    return "Chemical peel"
  }

  if (/hydrafacial|hydrofacial/.test(normalized)) {
    return "Hydrafacial"
  }

  if (/prp|platelet rich plasma/.test(normalized)) {
    return "PRP"
  }

  if (/facial/.test(normalized)) {
    return "Facial treatment"
  }

  return null
}

const readCurrencyValues = (value: string): number[] => {
  const matches = [...value.matchAll(currencyRegex)]

  return matches
    .map((match) => Number.parseFloat(match[1].replaceAll(",", "")))
    .filter((entry) => Number.isFinite(entry) && entry > 0)
}

const extractFeeItems = (fees: unknown): FeeItem[] => {
  if (!fees) {
    return []
  }

  if (Array.isArray(fees)) {
    return fees.flatMap((entry) => extractFeeItems(entry))
  }

  if (typeof fees === "object") {
    const record = fees as Record<string, unknown>

    if (typeof record.treatment === "string" && typeof record.price === "string") {
      return [{ treatment: record.treatment, price: record.price }]
    }

    return Object.values(record).flatMap((entry) => extractFeeItems(entry))
  }

  return []
}

const roundToNearestFive = (value: number): number => Math.max(5, Math.round(value / 5) * 5)

const formatCurrency = (value: number): string => `£${roundToNearestFive(value)}`

const buildRangeText = (values: readonly number[]): string => {
  const sorted = [...values].sort((left, right) => left - right)

  if (sorted.length === 1) {
    const only = sorted[0]
    return `${formatCurrency(only * 0.9)}–${formatCurrency(only * 1.15)}`
  }

  if (sorted.length === 2) {
    return `${formatCurrency(sorted[0])}–${formatCurrency(sorted[1])}`
  }

  const lowIndex = Math.floor((sorted.length - 1) * 0.2)
  const highIndex = Math.ceil((sorted.length - 1) * 0.8)

  return `${formatCurrency(sorted[lowIndex])}–${formatCurrency(sorted[highIndex])}`
}

const buildSentence = (
  city: string,
  treatment: string,
  rangeText: string,
  variantSeed: number
): string => {
  const templates = [
    `${treatment} in ${city} typically costs ${rangeText}.`,
    `In ${city}, ${treatment} usually lands around ${rangeText}.`,
    `For ${treatment} in ${city}, most listed prices sit around ${rangeText}.`,
  ]

  return templates[variantSeed % templates.length]
}

export const buildCityTreatmentPriceInsights = (
  clinics: Clinic[],
  city: string,
  limit = 3
): CityTreatmentPriceInsight[] => {
  const buckets = new Map<string, TreatmentBucket>()

  for (const clinic of clinics) {
    for (const feeItem of extractFeeItems(clinic.Fees)) {
      const treatment = canonicalTreatment(feeItem.treatment)
      if (!treatment) {
        continue
      }

      const values = readCurrencyValues(feeItem.price)
      if (values.length === 0) {
        continue
      }

      const existing = buckets.get(treatment) ?? {
        treatment,
        values: [],
        clinicSlugs: new Set<string>(),
      }

      existing.values.push(...values)
      if (clinic.slug) {
        existing.clinicSlugs.add(clinic.slug)
      }
      buckets.set(treatment, existing)
    }
  }

  return [...buckets.values()]
    .filter((bucket) => bucket.values.length > 0)
    .sort((left, right) => {
      if (right.clinicSlugs.size !== left.clinicSlugs.size) {
        return right.clinicSlugs.size - left.clinicSlugs.size
      }

      if (right.values.length !== left.values.length) {
        return right.values.length - left.values.length
      }

      return left.treatment.localeCompare(right.treatment)
    })
    .slice(0, limit)
    .map((bucket, index) => {
      const rangeText = buildRangeText(bucket.values)

      return {
        treatment: bucket.treatment,
        href: `/treatments/${toUrlSlug(bucket.treatment)}`,
        rangeText,
        sentence: buildSentence(city, bucket.treatment, rangeText, city.length + index),
        supportCount: bucket.clinicSlugs.size,
      }
    })
}