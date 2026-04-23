import { prisma } from '@/lib/db'
import { Clinic as PrismaClinic, Prisma } from '@prisma/client'
import { cache } from 'react'

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
> & {
  City?: string
  Treatments?: string[]
}

/**
 * Get all clinics with basic info for search (cached)
 */
export const getAllClinicsForSearch = cache(async (): Promise<SearchClinic[]> => {
  const clinics = await prisma.clinic.findMany({
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
    City: clinic.city?.name,
    Treatments: clinic.treatments.map((ct) => ct.treatment.name),
  }))
})

/**
 * Get a single clinic by slug with all relations (cached)
 */
export const getClinicBySlug = cache(
  async (slug: string): Promise<ClinicWithRelations | null> => {
    return await prisma.clinic.findUnique({
      where: { slug },
      include: {
        city: true,
        hours: true,
        fees: true,
        reviews: true,
        ranking: true,
        treatments: {
          include: {
            treatment: true,
          },
        },
        staff: true,
      },
    })
  }
)

/**
 * Get clinics by city name (cached)
 */
export const getClinicsByCity = cache(
  async (cityName: string): Promise<SearchClinic[]> => {
    const clinics = await prisma.clinic.findMany({
      where: {
        city: {
          name: {
            equals: cityName,
            mode: 'insensitive',
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
      City: clinic.city?.name,
      Treatments: clinic.treatments.map((ct) => ct.treatment.name),
    }))
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
  return await prisma.clinic.create({ data })
}

/**
 * Update a clinic by slug
 */
export async function updateClinic(
  slug: string,
  data: Prisma.ClinicUpdateInput
): Promise<PrismaClinic> {
  return await prisma.clinic.update({
    where: { slug },
    data,
  })
}

/**
 * Delete a clinic by slug
 */
export async function deleteClinic(slug: string): Promise<PrismaClinic> {
  return await prisma.clinic.delete({
    where: { slug },
  })
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
  const where: Prisma.ClinicWhereInput = {}

  // Text search across name and address
  if (params.query) {
    where.OR = [
      { name: { contains: params.query, mode: 'insensitive' } },
      { gmapsAddress: { contains: params.query, mode: 'insensitive' } },
      { slug: { contains: params.query, mode: 'insensitive' } },
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
      mode: 'insensitive',
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
    City: clinic.city?.name,
    Treatments: clinic.treatments.map((ct) => ct.treatment.name),
  }))
}
