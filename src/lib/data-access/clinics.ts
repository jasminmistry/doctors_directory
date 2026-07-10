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
  | 'claimed'
  | 'verified'
  | 'idVerified'
  | 'manualVerified'
> & {
  City?: string
  Treatments?: string[]
}

const SEARCH_CLINIC_SELECT = {
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
} satisfies Prisma.ClinicSelect

type SearchClinicRow = Prisma.ClinicGetPayload<{ select: typeof SEARCH_CLINIC_SELECT }>

function mapSearchClinicRow(clinic: SearchClinicRow): SearchClinic {
  return {
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
  }
}

/**
 * Get all clinics with basic info for search (cached)
 */
export const getAllClinicsForSearch = cache(async (): Promise<SearchClinic[]> => {
  const clinics = await prisma.clinic.findMany({
    where: { isHidden: false },
    select: SEARCH_CLINIC_SELECT,
  })

  return clinics.map(mapSearchClinicRow)
})

/**
 * Filtered + paginated clinics for the /search page's Clinic tab. Mirrors the word-tokenized
 * AND/OR filter semantics that used to run in JS over the full dataset in
 * src/app/actions/search.ts, but pushed down to a real indexed WHERE + LIMIT/OFFSET query so
 * only the matching page is fetched.
 */
export async function searchClinicsForListing(params: {
  query?: string
  category?: string
  location?: string
  rating?: number
  services?: string[]
  sortBy?: string
  skip: number
  take: number
}): Promise<{ clinics: SearchClinic[]; totalCount: number }> {
  const and: Prisma.ClinicWhereInput[] = [{ isHidden: false }]

  if (params.query) {
    const words = params.query.toLowerCase().split(/\s+/).filter((word) => word.length > 0)
    for (const word of words) {
      and.push({
        OR: [
          { slug: { contains: word } },
          { category: { contains: word } },
          { gmapsAddress: { contains: word } },
          { treatments: { some: { treatment: { name: { contains: word } } } } },
        ],
      })
    }
  }

  if (params.category && params.category !== 'All Categories') {
    and.push({ category: params.category })
  }

  const trimmedLocation = params.location?.trim()
  if (trimmedLocation) {
    and.push({ gmapsAddress: { contains: trimmedLocation } })
  }

  if (params.services && params.services.length > 0) {
    // The old JS version compared treatment names case-sensitively against a lowercased
    // service, which never matched real (Title Case) treatment names and made this filter
    // always return zero results. MySQL's utf8mb4_unicode_ci collation makes `contains`
    // case-insensitive here, which fixes that — intentional, confirmed with the team.
    and.push({
      OR: params.services.map((service) => ({
        treatments: { some: { treatment: { name: { contains: service } } } },
      })),
    })
  }

  if (params.rating && params.rating > 0) {
    and.push({ rating: { gte: params.rating } })
  }

  const where: Prisma.ClinicWhereInput = and.length > 0 ? { AND: and } : {}

  const orderBy: Prisma.ClinicOrderByWithRelationInput =
    params.sortBy === 'rating'
      ? { rating: 'desc' }
      : params.sortBy === 'reviews'
        ? { reviewCount: 'desc' }
        : { id: 'asc' }

  const [rows, totalCount] = await Promise.all([
    prisma.clinic.findMany({
      where,
      orderBy,
      skip: params.skip,
      take: params.take,
      select: SEARCH_CLINIC_SELECT,
    }),
    prisma.clinic.count({ where }),
  ])

  return { clinics: rows.map(mapSearchClinicRow), totalCount }
}

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
  const where: Prisma.ClinicWhereInput = { isHidden: false }

  // Text search across name and address
  const trimmedQuery = params.query?.trim()
  if (trimmedQuery) {
    where.OR = [
      { name: { contains: trimmedQuery } },
      { gmapsAddress: { contains: trimmedQuery } },
      { slug: { contains: trimmedQuery } },
    ]
  }

  // Category filter
  if (params.category && params.category !== 'All Categories') {
    where.category = params.category
  }

  // Location filter
  const trimmedLocation = params.location?.trim()
  if (trimmedLocation) {
    where.gmapsAddress = {
      contains: trimmedLocation,
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
