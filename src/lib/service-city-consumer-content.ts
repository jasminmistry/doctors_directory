import { getPractitioners } from '@/lib/sitemap-data'
import { toUrlSlug } from '@/lib/utils'
import type { Clinic } from '@/lib/types'

export type ServiceCityConsumerStats = {
  clinicCount: number
  practitionerCount: number
  reviewCount: number
  avgRating: number
}

export type ServiceCityConsumerSection = {
  title: string
  paragraphs: string[]
}

export type ServiceCityConsumerFaqItem = {
  question: string
  answer: string
}

export type ServiceCityConsumerContent = {
  sections: ServiceCityConsumerSection[]
  faqItems: ServiceCityConsumerFaqItem[]
}

export function getServiceCityConsumerStats(
  clinics: Clinic[],
  serviceSlug: string,
  locationSlug: string
): ServiceCityConsumerStats {
  const clinicCount = clinics.length
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

  const clinicSlugs = new Set(
    clinics.map((clinic) => clinic.slug).filter((slug): slug is string => Boolean(slug))
  )

  const linkedPractitionerSlugs = new Set<string>()
  for (const practitioner of getPractitioners()) {
    if (toUrlSlug(practitioner.City ?? '') !== locationSlug) {
      continue
    }
    const categoryMatches = toUrlSlug(practitioner.category ?? '') === serviceSlug
    let clinicLinked = false
    try {
      const associated = JSON.parse(practitioner.Associated_Clinics ?? '[]') as string[]
      clinicLinked = associated.some((slug) => clinicSlugs.has(slug))
    } catch {
      clinicLinked = false
    }
    if (categoryMatches || clinicLinked) {
      const slug = practitioner.slug ?? practitioner.practitioner_name
      if (slug) {
        linkedPractitionerSlugs.add(slug)
      }
    }
  }

  return {
    clinicCount,
    practitionerCount: linkedPractitionerSlugs.size,
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

export function buildServiceCityConsumerContent(
  category: string,
  city: string,
  stats: ServiceCityConsumerStats
): ServiceCityConsumerContent {
  const categoryLower = category.toLowerCase()
  const reviewLabel = stats.reviewCount > 0 ? `${stats.reviewCount}+` : '0'
  const avgRatingLabel = formatRating(stats.avgRating)

  const sections: ServiceCityConsumerSection[] = [
    {
      title: `How to Choose a ${category} in ${city}`,
      paragraphs: [
        `Choosing a ${categoryLower} in ${city} comes down to three things: verified credentials, recent reviews, and the specific treatments you need. ${city} has ${stats.clinicCount} listed ${categoryLower} options with ${reviewLabel} combined reviews, so comparing profiles side by side is the fastest way to build a shortlist. Look for providers with current accreditation, clear pricing, and a consultation before any treatment. Recent reviews tell you more about consistency than a single overall score.`,
      ],
    },
    {
      title: `What to Expect from a ${category} in ${city}`,
      paragraphs: [
        `Most ${categoryLower} providers in ${city} start with a consultation to assess your needs before recommending anything. Reputable providers explain aftercare, realistic results, and any risks upfront, and confirm they hold the right qualifications for the service you want. Costs vary by provider and treatment, so always check pricing on the individual profile before you book.`,
      ],
    },
    {
      title: `Comparing ${category} Options in ${city}`,
      paragraphs: [
        `Use the listings above to compare ${stats.clinicCount} ${categoryLower} options in ${city} by rating, reviews, services, and location. Each profile carries verified details, so you can check accreditation, read genuine feedback, and contact providers directly. Comparing a few options against your budget and goals beats booking the first result you find.`,
      ],
    },
  ]

  const faqItems: ServiceCityConsumerFaqItem[] = [
    {
      question: `How many ${categoryLower} options are there in ${city}?`,
      answer: `There are currently ${stats.clinicCount} verified ${categoryLower} listings in ${city}, with ${stats.practitionerCount} linked practitioners and ${stats.reviewCount} combined reviews.`,
    },
    {
      question: `What is the average rating for a ${categoryLower} in ${city}?`,
      answer: `${category} providers in ${city} hold an average rating of ${avgRatingLabel} out of 5 based on public reviews.`,
    },
    {
      question: `How do I book a ${categoryLower} in ${city}?`,
      answer: `Open any provider profile above to review their services and ratings, then use the contact details on the profile to book.`,
    },
    {
      question: `Are these ${categoryLower} listings in ${city} verified?`,
      answer: `Yes. Every ${categoryLower} listing in ${city} is checked for accreditation and practitioner details before it appears in the directory.`,
    },
  ]

  return { sections, faqItems }
}
