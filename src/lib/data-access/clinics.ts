import { prisma } from '@/lib/db'
import { Clinic as PrismaClinic, Prisma } from '@prisma/client'
import { cache } from 'react'
import { withQueryCache, invalidateQueryCache } from '@/lib/query-cache'

// Full clinic type with all relations
type ClinicWithRelations = Prisma.ClinicGetPayload<{
  include: {
    city: true
    hours: true
    fees: true
    reviews: true
    ranking: true
    treatments: {
      include: {
        treatment: true
      }
    }
    staff: true
  }
}>

// Lightweight clinic for search results
export type SearchClinic = Pick<
  PrismaClinic,
  | 'id'
  | 'slug'
  | 'name'
  | 'image'
  | 'rating'
  | 'reviewCount'
  | 'category'
  | 'gmapsAddress'
  | 'isSaveFace'
  | 'isDoctor'
  | 'isJccp'
  | 'isCqc'
  | 'isHiw'
  | 'isHis'
  | 'isRqia'
  | 'claimed'
  | 'verified'
  | 'idVerified'
  | 'manualVerified'
> & {
  City?: string
  Treatments?: string[]
}

/**
 * Get all clinics with basic info for search (cached)
 */
export const getAllClinicsForSearch = cache(async (): Promise<SearchClinic[]> => {
  return withQueryCache('clinics:all-search', async () => {
    const clinics = await prisma.clinic.findMany({
      where: { isHidden: false },
      select: {
        id: true,
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
          include: {
            treatment: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    return clinics.map((clinic) => ({
      id: clinic.id,
      slug: clinic.slug,
      name: clinic.name,
      image: clinic.image,
      rating: clinic.rating,
      reviewCount: clinic.reviewCount,
      category: clinic.category,
      gmapsAddress: clinic.gmapsAddress,
      isSaveFace: clinic.isSaveFace,
      isDoctor: clinic.isDoctor,
      isJccp: clinic.isJccp,
      isCqc: clinic.isCqc,
      isHiw: clinic.isHiw,
      isHis: clinic.isHis,
      isRqia: clinic.isRqia,
      claimed: clinic.claimed,
      verified: clinic.verified,
      idVerified: clinic.idVerified,
      manualVerified: clinic.manualVerified,
      City: clinic.city?.name,
      Treatments: clinic.treatments.map((ct) => ct.treatment.name),
    }))
  })
})

/**
 * Get a single clinic by slug with all relations (cached)
 */
export const getClinicBySlug = cache(
  async (slug: string): Promise<ClinicWithRelations | null> => {
    return withQueryCache(`clinic:slug:${slug}`, async () => {
      return await prisma.clinic.findUnique({
        where: { slug },
        include: {
          city: true,
          hours: true,
          fees: true,
          reviews: { take: 50 },
          ranking: true,
          treatments: {
            include: {
              treatment: true,
            },
          },
          staff: true,
        },
      })
    })
  }
)

/**
 * Get clinics by city name (cached)
 */
export const getClinicsByCity = cache(
  async (cityName: string): Promise<SearchClinic[]> => {
    return withQueryCache(`clinic:city:${cityName.toLowerCase()}`, async () => {
      const clinics = await prisma.clinic.findMany({
        where: {
          isHidden: false,
          city: {
            name: {
              equals: cityName,
            },
          },
        },
        select: {
          id: true,
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
            include: {
              treatment: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })

      return clinics.map((clinic) => ({
        id: clinic.id,
        slug: clinic.slug,
        name: clinic.name,
        image: clinic.image,
        rating: clinic.rating,
        reviewCount: clinic.reviewCount,
        category: clinic.category,
        gmapsAddress: clinic.gmapsAddress,
        isSaveFace: clinic.isSaveFace,
        isDoctor: clinic.isDoctor,
        isJccp: clinic.isJccp,
        isCqc: clinic.isCqc,
        isHiw: clinic.isHiw,
        isHis: clinic.isHis,
        isRqia: clinic.isRqia,
        claimed: clinic.claimed,
        verified: clinic.verified,
        idVerified: clinic.idVerified,
        manualVerified: clinic.manualVerified,
        City: clinic.city?.name,
        Treatments: clinic.treatments.map((ct) => ct.treatment.name),
      }))
    })
  }
)

/**
 * Get all clinics (admin use, no cache)
 */
export async function getAllClinics(): Promise<PrismaClinic[]> {
  return await prisma.clinic.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Create a new clinic
 */
export async function createClinic(data: Prisma.ClinicCreateInput): Promise<PrismaClinic> {
  const clinic = await prisma.clinic.create({ data })
  invalidateQueryCache('clinics:all-search')
  return clinic
}

/**
 * Update a clinic by slug
 */
export async function updateClinic(
  slug: string,
  data: Prisma.ClinicUpdateInput
): Promise<PrismaClinic> {
  const clinic = await prisma.clinic.update({
    where: { slug },
    data,
  })
  invalidateQueryCache(`clinic:slug:${slug}`, 'clinics:all-search')
  return clinic
}

/**
 * Delete a clinic by slug
 */
export async function deleteClinic(slug: string): Promise<PrismaClinic> {
  const clinic = await prisma.clinic.delete({
    where: { slug },
  })
  invalidateQueryCache(`clinic:slug:${slug}`, 'clinics:all-search')
  return clinic
}

/**
 * Search clinics with filters
 */
export async function searchClinics(params: {
  query?: string
  category?: string
  location?: string
  rating?: number
  treatments?: string[]
}): Promise<SearchClinic[]> {
  const where: Prisma.ClinicWhereInput = { isHidden: false }

  // Text search across name and address
  if (params.query) {
    where.OR = [
      { name: { contains: params.query } },
      { gmapsAddress: { contains: params.query } },
      { slug: { contains: params.query } },
    ]
  }

  // Category filter
  if (params.category && params.category !== 'All Categories') {
    where.category = params.category
  }

  // Location filter
  if (params.location) {
    where.gmapsAddress = {
      contains: params.location,
    }
  }

  // Rating filter
  if (params.rating && params.rating > 0) {
    where.rating = { gte: params.rating }
  }

  // Treatment filter
  if (params.treatments && params.treatments.length > 0) {
    where.treatments = {
      some: {
        treatment: {
          name: {
            in: params.treatments,
          },
        },
      },
    }
  }

  const clinics = await prisma.clinic.findMany({
    where,
    select: {
      id: true,
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
        include: {
          treatment: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
  })

  return clinics.map((clinic) => ({
    id: clinic.id,
    slug: clinic.slug,
    name: clinic.name,
    image: clinic.image,
    rating: clinic.rating,
    reviewCount: clinic.reviewCount,
    category: clinic.category,
    gmapsAddress: clinic.gmapsAddress,
    isSaveFace: clinic.isSaveFace,
    isDoctor: clinic.isDoctor,
    isJccp: clinic.isJccp,
    isCqc: clinic.isCqc,
    isHiw: clinic.isHiw,
    isHis: clinic.isHis,
    isRqia: clinic.isRqia,
    claimed: clinic.claimed,
    verified: clinic.verified,
    idVerified: clinic.idVerified,
    manualVerified: clinic.manualVerified,
    City: clinic.city?.name,
    Treatments: clinic.treatments.map((ct) => ct.treatment.name),
  }))
}
