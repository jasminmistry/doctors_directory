import { prisma } from '@/lib/db'
import { convertDbPractitionerToOldType } from '@/lib/data-access/practitioners'
import { clinicSelect, toListingClinic } from '@/lib/data-access/treatment-listings'
import type { Clinic, Practitioner } from '@/lib/types'
import { cache } from 'react'

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
