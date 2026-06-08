import { countTreatmentCityListings } from '@/lib/treatment-city-hub'
import { getTreatmentConcernDescription } from '@/lib/treatment-content'
import type { Clinic } from '@/lib/types'

export type TreatmentCityConsumerStats = {
  clinicCount: number
  practitionerCount: number
  reviewCount: number
  avgRating: number
}

export type TreatmentCityConsumerSection = {
  title: string
  paragraphs: string[]
}

export type TreatmentCityConsumerFaqItem = {
  question: string
  answer: string
}

export type TreatmentCityConsumerContent = {
  sections: TreatmentCityConsumerSection[]
  faqItems: TreatmentCityConsumerFaqItem[]
}

export function getTreatmentCityConsumerStats(
  clinics: Clinic[],
  treatmentSlug: string,
  locationSlug: string
): TreatmentCityConsumerStats {
  const listingCounts = countTreatmentCityListings(treatmentSlug, locationSlug)
  let reviewCount = 0
  let ratingSum = 0
  let ratingWeight = 0

  for (const clinic of clinics) {
    const reviews = Number(clinic.reviewCount) || 0
    reviewCount += reviews
    const rating = Number(clinic.rating)
    if (Number.isFinite(rating) && reviews > 0) {
      ratingSum += rating * reviews
      ratingWeight += reviews
    }
  }

  return {
    clinicCount: clinics.length,
    practitionerCount: listingCounts.practitionerCount,
    reviewCount,
    avgRating: ratingWeight > 0 ? Math.round((ratingSum / ratingWeight) * 10) / 10 : 0,
  }
}

function formatRating(value: number): string {
  if (value <= 0) {
    return '0'
  }
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function buildTreatmentCityConsumerContent(
  treatment: string,
  city: string,
  stats: TreatmentCityConsumerStats
): TreatmentCityConsumerContent {
  const treatmentLower = treatment.toLowerCase()
  const reviewLabel = stats.reviewCount > 0 ? `${stats.reviewCount}+` : '0'
  const avgRatingLabel = formatRating(stats.avgRating)
  const concernDescription = getTreatmentConcernDescription(treatment)

  const sections: TreatmentCityConsumerSection[] = [
    {
      title: `Best ${treatment} Clinics in ${city}`,
      paragraphs: [
        `${city} has ${stats.clinicCount} verified ${treatmentLower} clinics with ${reviewLabel} combined reviews and an average rating of ${avgRatingLabel} out of 5. The listings above let you compare them by rating, services, and location so you can shortlist the right clinic for your needs. Look for current accreditation, recent reviews, and a consultation before any treatment.`,
      ],
    },
    {
      title: `What Is ${treatment}?`,
      paragraphs: [
        `${treatment} addresses ${concernDescription}. Most clinics in ${city} begin with an assessment to confirm the cause and recommend a suitable approach. Treatment plans vary by individual, so results, sessions, and pricing differ from one clinic to another.`,
      ],
    },
    {
      title: `What to Expect from ${treatment} in ${city}`,
      paragraphs: [
        `A ${treatmentLower} clinic in ${city} will usually start with a consultation to assess your suitability before recommending anything. Reputable providers explain the process, realistic results, aftercare, and any risks upfront, and confirm they hold the right qualifications. Always check pricing and credentials on the individual profile before booking.`,
      ],
    },
    {
      title: `How to Choose a ${treatment} Clinic in ${city}`,
      paragraphs: [
        `Compare the ${stats.clinicCount} ${treatmentLower} clinics above by verified accreditation, genuine reviews, and the specific service you need. Recent reviews show consistency better than a single score, and a consultation lets you judge fit before committing. Shortlist two or three, then contact them directly through their profiles.`,
      ],
    },
  ]

  const faqItems: TreatmentCityConsumerFaqItem[] = [
    {
      question: `How much does ${treatmentLower} cost in ${city}?`,
      answer: `${treatment} pricing in ${city} varies by clinic and treatment plan, so check the price listed on each clinic profile above before booking.`,
    },
    {
      question: `How many ${treatmentLower} clinics are there in ${city}?`,
      answer: `There are currently ${stats.clinicCount} verified ${treatmentLower} clinics in ${city}, with ${stats.practitionerCount} linked practitioners and ${stats.reviewCount} combined reviews.`,
    },
    {
      question: `Are the ${treatmentLower} clinics in ${city} verified?`,
      answer: `Yes. Every ${treatmentLower} clinic listing in ${city} is checked for accreditation and practitioner details before it appears in the directory.`,
    },
    {
      question: `How do I book ${treatmentLower} in ${city}?`,
      answer: `Open any clinic profile above to review services and ratings, then use the contact details on the profile to book a consultation.`,
    },
  ]

  return { sections, faqItems }
}
