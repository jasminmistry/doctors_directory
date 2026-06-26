import type { Clinic, Practitioner } from "@/lib/types"
import { getClinicDisplayName } from "@/lib/clinic-display"
import {
  formatProfileDisplayPrice,
  getProfileListingPrice,
  type ProfilePriceOptions,
} from "@/lib/profile-fees"

export interface ClinicComparisonEntry {
  category: "Best value" | "Premium" | "Budget"
  href: string
  name: string
  scoreLabel: string
  displayPrice: string
  cityRank?: number | null
}

export interface RankedEntry {
  name: string
  subtitle?: string
  href: string
  image: string
  reviewCount: number
  rating: number
  averagePrice: number | null
  displayPrice: string
  scoreValue: number
  scoreLabel: string
  valueLabel: "Best value" | "Premium" | "Budget"
  verified?: boolean
  idVerified?: boolean
}

const median = (values: readonly number[]): number | null => {
  if (values.length === 0) {
    return null
  }

  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }

  return sorted[mid]
}

const capitalizeWords = (value: string): string =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

const getScore = (item: Clinic | Practitioner): number => {
  const overall = item.weighted_analysis?.["Overall Aggregation"]?.weighted_score
  if (typeof overall === "number" && Number.isFinite(overall)) {
    return Math.max(0, Math.min(100, Math.round(overall)))
  }

  const rankingScore = item.ranking?.score_out_of_100
  if (typeof rankingScore === "number" && Number.isFinite(rankingScore)) {
    return Math.max(0, Math.min(100, Math.round(rankingScore)))
  }

  const rating = Number(item.rating ?? 0)
  if (Number.isFinite(rating) && rating > 0) {
    return Math.max(0, Math.min(100, Math.round((rating / 5) * 100)))
  }

  return 0
}

const toClinicName = (item: Clinic): string => getClinicDisplayName(item)

const toPractitionerName = (item: Practitioner): string =>
  item.practitioner_name
    ? capitalizeWords(item.practitioner_name)
    : item.slug
      ? capitalizeWords(item.slug)
      : "Practitioner"

const valueLabel = (
  avgPrice: number | null,
  medianPrice: number | null
): RankedEntry["valueLabel"] => {
  if (avgPrice === null || medianPrice === null) {
    return "Best value"
  }

  if (avgPrice <= medianPrice * 0.9) {
    return "Budget"
  }

  if (avgPrice >= medianPrice * 1.1) {
    return "Premium"
  }

  return "Best value"
}

const buildEntries = (
  items: Array<Clinic | Practitioner>,
  kind: "clinic" | "practitioner",
  limit: number,
  priceOptions?: ProfilePriceOptions
): RankedEntry[] => {
  const priced = items
    .map((item) => {
      const avgPrice = getProfileListingPrice(item.Fees, priceOptions)
      const score = getScore(item)
      return {
        item,
        avgPrice,
        score,
      }
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      // Tiebreak 1: more reviews = more credible score → ranked higher
      const reviewDiff =
        Number(right.item.reviewCount ?? 0) - Number(left.item.reviewCount ?? 0)
      if (reviewDiff !== 0) {
        return reviewDiff
      }

      // Tiebreak 2: rating
      return (right.item.rating ?? 0) - (left.item.rating ?? 0)
    })
    .slice(0, limit)

  const medianPrice = median(
    priced
      .map((entry) => entry.avgPrice)
      .filter((entry): entry is number => entry !== null)
  )

  return priced.map(({ item, avgPrice, score }) => {
    const city = (item.City ?? "").toLowerCase()
    const clinicSlug = item.slug ?? ""
    const practitionerName = (item as Practitioner).practitioner_name ?? clinicSlug
    const image =
      kind === "practitioner"
        ? (item as Practitioner).practitioner_image_link ?? "/directory/images/default-dr-profile-1.webp"
        : (item as Clinic).image ?? "/directory/images/default-dr-profile-1.webp"
    const href =
      kind === "clinic"
        ? clinicSlug
          ? `/clinics/${city}/clinic/${clinicSlug}`
          : "#"
        : practitionerName
          ? `/practitioners/${city}/profile/${practitionerName}`
          : "#"

    const clinicItem = item as Clinic

    return {
      name: kind === "clinic" ? toClinicName(clinicItem) : toPractitionerName(item as Practitioner),
      subtitle:
        kind === "clinic" && clinicItem.category?.trim()
          ? clinicItem.category.trim()
          : undefined,
      href,
      image,
      reviewCount: Number(item.reviewCount ?? 0),
      rating: Number(item.rating ?? 0),
      averagePrice: avgPrice,
      displayPrice: formatProfileDisplayPrice(avgPrice, { from: true }),
      scoreValue: score,
      scoreLabel:
        score > 0
          ? `${score} Consentz Score`
          : `${Number(item.rating ?? 0).toFixed(1)}★ rating`,
      valueLabel: valueLabel(avgPrice, medianPrice),
      verified: (item as Clinic).verified ?? false,
      idVerified: (item as Clinic).idVerified ?? false,
    }
  })
}

export const buildClinicRankedEntries = (
  clinics: Clinic[],
  limit = 4,
  priceOptions?: ProfilePriceOptions
): RankedEntry[] => buildEntries(clinics, "clinic", Math.min(limit, 4), priceOptions)

export const buildPractitionerRankedEntries = (
  practitioners: Practitioner[],
  limit = 4,
  priceOptions?: ProfilePriceOptions
): RankedEntry[] =>
  buildEntries(practitioners, "practitioner", Math.min(limit, 4), priceOptions)
