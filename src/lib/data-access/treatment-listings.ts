import { prisma } from '@/lib/db'
import { convertDbPractitionerToOldType } from '@/lib/data-access/practitioners'
import { resolveTreatmentHubSlug } from '@/lib/treatment-hub-registry'
import type { Clinic, Practitioner } from '@/lib/types'
import { cache } from 'react'

const clinicSelect = {
  slug: true,
  name: true,
  image: true,
  rating: true,
  reviewCount: true,
  category: true,
  gmapsAddress: true,
  isSaveFace: true,
  isDoctor: true,
  isJccp: true,
  isCqc: true,
  isHiw: true,
  isHis: true,
  isRqia: true,
  claimed: true,
  verified: true,
  idVerified: true,
  manualVerified: true,
  city: {
    select: {
      name: true,
    },
  },
  treatments: {
    select: {
      treatment: {
        select: {
          name: true,
        },
      },
    },
  },
} as const

export { clinicSelect }

export function toListingClinic(clinic: {
  slug: string
  name: string | null
  image: string | null
  rating: { toString(): string } | null
  reviewCount: number | null
  category: string | null
  gmapsAddress: string | null
  isSaveFace: boolean
  isDoctor: boolean
  isJccp: boolean
  isCqc: boolean
  isHiw: boolean
  isHis: boolean
  isRqia: boolean
  claimed: boolean
  verified: boolean
  idVerified: boolean
  manualVerified: boolean
  city: { name: string } | null
  treatments: Array<{ treatment: { name: string } }>
}): Clinic {
  return {
    slug: clinic.slug,
    image: clinic.image || '',
    url: undefined,
    rating: clinic.rating ? Number(clinic.rating) : 0,
    reviewCount: clinic.reviewCount || 0,
    category: clinic.category || '',
    gmapsAddress: clinic.gmapsAddress || '',
    gmapsPhone: '',
    City: clinic.city?.name || '',
    facebook: '',
    twitter: '',
    Linkedin: '',
    instagram: '',
    youtube: '',
    website: '',
    email: '',
    isSaveFace: clinic.isSaveFace,
    isDoctor: clinic.isDoctor,
    isJCCP: clinic.isJccp ? [true, ''] : null,
    isCQC: clinic.isCqc ? [true, ''] : null,
    isHIW: clinic.isHiw ? [true, ''] : null,
    isHIS: clinic.isHis ? [true, ''] : null,
    isRQIA: clinic.isRqia ? [true, ''] : null,
    about_section: '',
    accreditations: '',
    awards: '',
    affiliations: '',
    hours: '',
    Practitioners: '',
    Insurace: '',
    Payments: '',
    Fees: '',
    x_twitter: '',
    Treatments: clinic.treatments.map((entry) => entry.treatment.name),
    claimed: clinic.claimed,
    verified: clinic.verified,
    idVerified: clinic.idVerified,
    manualVerified: clinic.manualVerified,
  }
}

async function resolveTreatmentId(treatmentSlug: string): Promise<number | null> {
  const canonicalSlug = resolveTreatmentHubSlug(treatmentSlug)
  const treatment = await prisma.treatment.findUnique({
    where: { slug: canonicalSlug },
    select: { id: true },
  })
  return treatment?.id ?? null
}

export const getNationalTreatmentClinics = cache(async (treatmentSlug: string): Promise<Clinic[]> => {
  const treatmentId = await resolveTreatmentId(treatmentSlug)
  if (!treatmentId) return []

  const clinics = await prisma.clinic.findMany({
    where: {
      treatments: {
        some: {
          treatmentId,
        },
      },
    },
    select: clinicSelect,
    orderBy: [{ name: 'asc' }],
  })

  return clinics.map(toListingClinic)
})

export const getNationalTreatmentPractitioners = cache(
  async (treatmentSlug: string): Promise<Practitioner[]> => {
    const treatmentId = await resolveTreatmentId(treatmentSlug)
    if (!treatmentId) return []

    const practitioners = await prisma.practitioner.findMany({
      where: {
        OR: [
          {
            treatments: {
              some: {
                treatmentId,
              },
            },
          },
          {
            clinicAssociations: {
              some: {
                clinic: {
                  treatments: {
                    some: {
                      treatmentId,
                    },
                  },
                },
              },
            },
          },
        ],
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
