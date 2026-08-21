import { prisma } from '@/lib/db'
import { convertDbPractitionerToOldType } from '@/lib/data-access/practitioners'
import { clinicSelect, toListingClinic } from '@/lib/data-access/treatment-listings'
import { getClinics, getEnrichedPractitioners } from '@/lib/sitemap-data'
import type { Clinic, Practitioner } from '@/lib/types'
import { toUrlSlug } from '@/lib/utils'
import { cache } from 'react'

const CITY_HUB_LISTING_CAP = 90

function byReviewsThenRating<T extends { reviewCount?: number | string | null; rating?: number | string | null }>(
  left: T,
  right: T
): number {
  return (
    (Number(right.reviewCount) || 0) - (Number(left.reviewCount) || 0) ||
    (Number(right.rating) || 0) - (Number(left.rating) || 0)
  )
}

/** Sync JSON listings for treatment-city hubs. Avoids Prisma round-trips on every page. */
export function getCityClinicsFromJson(citySlug: string): Clinic[] {
  return getClinics()
    .filter((clinic) => toUrlSlug(clinic.City ?? '') === citySlug)
    .sort(byReviewsThenRating)
    .slice(0, CITY_HUB_LISTING_CAP)
}

export function getCityPractitionersFromJson(citySlug: string): Practitioner[] {
  return getEnrichedPractitioners()
    .filter((practitioner) => toUrlSlug(practitioner.City ?? '') === citySlug)
    .sort(byReviewsThenRating)
    .slice(0, CITY_HUB_LISTING_CAP)
}

export const getCityClinicsBySlug = cache(async (citySlug: string): Promise<Clinic[]> => {
  const clinics = await prisma.clinic.findMany({
    where: {
      city: {
        slug: citySlug,
      },
    },
    select: clinicSelect,
    orderBy: [{ name: 'asc' }],
  })

  return clinics.map(toListingClinic)
})

export const getCityPractitionersBySlug = cache(
  async (citySlug: string): Promise<Practitioner[]> => {
    const practitioners = await prisma.practitioner.findMany({
      where: {
        clinicAssociations: {
          some: {
            clinic: {
              city: {
                slug: citySlug,
              },
            },
          },
        },
      },
      include: {
        ranking: true,
        treatments: {
          select: {
            treatment: {
              select: {
                name: true,
              },
            },
          },
        },
        clinicAssociations: {
          orderBy: { clinicId: 'asc' },
          take: 1,
          include: {
            clinic: {
              select: {
                ...clinicSelect,
                hours: {
                  select: {
                    dayOfWeek: true,
                    hours: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { displayName: 'asc' },
    })

    return practitioners
      .filter((practitioner) => practitioner.clinicAssociations.length > 0)
      .map(convertDbPractitionerToOldType)
  }
)
