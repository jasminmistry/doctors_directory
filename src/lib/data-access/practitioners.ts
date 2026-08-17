import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { cache } from 'react'
import NodeCache from 'node-cache'
import type { Practitioner, RankingMeta, ItemMeta } from '@/lib/types'
import { isRemovedPractitionerSlug, hasTripleLetterSequence } from '@/lib/directory-removals'
import { getCache, setCache, delCache } from '@/lib/redis-cache'

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
}

function buildHoursObject(
  hoursArr: Array<{ dayOfWeek: string; hours: string | null }>
): Record<string, unknown> {
  const days: Record<string, string> = {}
  for (const h of hoursArr) {
    days[DAY_LABELS[h.dayOfWeek] ?? h.dayOfWeek] = h.hours ?? ''
  }
  return { Typical_hours_listed_in_directories: days }
}

export function convertDbPractitionerToOldType(p: any): Practitioner {
  const clinicAssociations: any[] = p.clinicAssociations ?? []
  const allClinicSlugs: string[] = clinicAssociations.map((a: any) => a.clinic.slug)
  const primaryClinic = clinicAssociations[0]?.clinic

  const ranking: RankingMeta | undefined = p.ranking
    ? {
        city_rank: p.ranking.cityRank ?? undefined,
        city_total: p.ranking.cityTotal ?? undefined,
        score_out_of_100: p.ranking.scoreOutOf100 ?? undefined,
        subtitle_text: p.ranking.subtitleText ?? undefined,
      }
    : undefined

  const clinicFields: Partial<Practitioner> = primaryClinic
    ? {
        slug: primaryClinic.slug,
        image: primaryClinic.image ?? undefined,
        rating: primaryClinic.rating ? Number(primaryClinic.rating) : 0,
        reviewCount: primaryClinic.reviewCount ?? 0,
        gmapsAddress: primaryClinic.gmapsAddress ?? undefined,
        url: primaryClinic.gmapsUrl ?? undefined,
        category: primaryClinic.category ?? undefined,
        City: primaryClinic.city?.name ?? undefined,
        isSaveFace: primaryClinic.isSaveFace ?? false,
        isDoctor: primaryClinic.isDoctor ?? false,
        isJCCP: primaryClinic.isJccp ? [primaryClinic.isJccp, ''] as [boolean, string] : null,
        isCQC: primaryClinic.isCqc ? [primaryClinic.isCqc, ''] as [boolean, string] : null,
        isHIW: primaryClinic.isHiw ? [primaryClinic.isHiw, ''] as [boolean, string] : null,
        isHIS: primaryClinic.isHis ? [primaryClinic.isHis, ''] as [boolean, string] : null,
        isRQIA: primaryClinic.isRqia ? [primaryClinic.isRqia, ''] as [boolean, string] : null,
        Payments: Array.isArray(primaryClinic.paymentMethods)
          ? (primaryClinic.paymentMethods as any)
          : undefined,
        hours: primaryClinic.hours
          ? (buildHoursObject(primaryClinic.hours) as any)
          : undefined,
      }
    : {}

  return {
    ...clinicFields,
    practitioner_name: p.slug,
    practitioner_title: p.title ?? undefined,
    practitioner_image_link: p.imageUrl ?? undefined,
    practitioner_specialty: p.specialty ?? undefined,
    practitioner_qualifications: p.qualifications
      ? JSON.stringify(p.qualifications)
      : undefined,
    practitioner_awards: p.awards ? JSON.stringify(p.awards) : undefined,
    practitioner_roles: p.roles ? JSON.stringify(p.roles) : undefined,
    practitioner_media: p.media ? JSON.stringify(p.media) : undefined,
    practitioner_experience: p.experience ? JSON.stringify(p.experience) : undefined,
    weighted_analysis: (p.weightedAnalysis as Record<string, ItemMeta>) ?? undefined,
    Associated_Clinics: JSON.stringify(allClinicSlugs),
    ranking,
    Treatments: [
      ...new Set([
        ...(p.treatments ?? []).map((t: any) => t.treatment.name),
        ...(primaryClinic?.treatments ?? []).map((t: any) => t.treatment.name),
      ])
    ],
    Title: p.title ?? undefined,
    claimed: p.claimed ?? false,
    verified: p.verified ?? false,
    licensed: p.licensed ?? false,
    idVerified: p.idVerified ?? false,
    manualVerified: p.manualVerified ?? false,
  }
}

const CLINIC_SELECT = {
  id: true,
  slug: true,
  image: true,
  rating: true,
  reviewCount: true,
  gmapsAddress: true,
  gmapsUrl: true,
  category: true,
  isSaveFace: true,
  isDoctor: true,
  isJccp: true,
  isCqc: true,
  isHiw: true,
  isHis: true,
  isRqia: true,
  paymentMethods: true,
  city: { select: { name: true } },
  treatments: {
    select: {
      treatment: { select: { name: true } },
    },
  },
}

// Serialized payload regularly exceeds Next's 2MB unstable_cache item limit, so this
// uses the same NodeCache + Redis tiered pattern as src/lib/search-cache.ts instead.
// TTL raised from 5min to 8hr — this cache is a common source of slow practitioner
// searches on a cache miss, since it rebuilds by fetching + transforming every
// practitioner nationally with nested clinic/treatment joins. Freshness after
// admin/portal edits is handled explicitly via invalidatePractitionersSearchCache(),
// not by a short TTL, so a long TTL here is safe.
const PRACTITIONERS_SEARCH_CACHE_KEY = 'practitioners-for-search:v1'
const PRACTITIONERS_SEARCH_TTL_SECONDS = 8 * 60 * 60

const practitionersSearchMemoryCache = new NodeCache({
  stdTTL: PRACTITIONERS_SEARCH_TTL_SECONDS,
  useClones: false,
})

export async function invalidatePractitionersSearchCache(): Promise<void> {
  practitionersSearchMemoryCache.del(PRACTITIONERS_SEARCH_CACHE_KEY)
  await delCache(PRACTITIONERS_SEARCH_CACHE_KEY)
}

async function fetchAllPractitionersForSearch(): Promise<Practitioner[]> {
  const rows = await prisma.practitioner.findMany({
    where: { isHidden: false },
    include: {
      ranking: true,
      treatments: {
        select: {
          treatment: { select: { name: true } },
        },
      },
      clinicAssociations: {
        orderBy: { clinicId: 'asc' },
        take: 1,
        include: {
          clinic: { select: CLINIC_SELECT },
        },
      },
    },
    orderBy: { displayName: 'asc' },
  })

  return rows
    .filter((p) => p.clinicAssociations.length > 0)
    .filter(
      (p) =>
        !isRemovedPractitionerSlug(p.slug) &&
        !hasTripleLetterSequence(p.displayName),
    )
    .map(convertDbPractitionerToOldType)
}

/**
 * All practitioners with primary clinic merged — for search, city pages, sitemaps (cached)
 */
export const getAllPractitionersForSearch = cache(async (): Promise<Practitioner[]> => {
  const local = practitionersSearchMemoryCache.get<Practitioner[]>(PRACTITIONERS_SEARCH_CACHE_KEY)
  if (local !== undefined) return local

  const remote = await getCache<Practitioner[]>(PRACTITIONERS_SEARCH_CACHE_KEY)
  if (remote !== null) {
    practitionersSearchMemoryCache.set(PRACTITIONERS_SEARCH_CACHE_KEY, remote)
    return remote
  }

  const fresh = await fetchAllPractitionersForSearch()
  practitionersSearchMemoryCache.set(PRACTITIONERS_SEARCH_CACHE_KEY, fresh)
  await setCache(PRACTITIONERS_SEARCH_CACHE_KEY, fresh, PRACTITIONERS_SEARCH_TTL_SECONDS)
  return fresh
})

/**
 * Practitioners in a given city, with primary clinic merged — for city-scoped
 * "best ranked" blocks (cached). Filters at the DB level instead of pulling
 * every practitioner nationally, unlike getAllPractitionersForSearch.
 */
export const getPractitionersByCity = cache(async (cityName: string): Promise<Practitioner[]> => {
  const rows = await prisma.practitioner.findMany({
    where: {
      clinicAssociations: {
        some: { clinic: { city: { name: cityName } } },
      },
    },
    include: {
      ranking: true,
      treatments: {
        select: {
          treatment: { select: { name: true } },
        },
      },
      clinicAssociations: {
        orderBy: { clinicId: 'asc' },
        take: 1,
        include: {
          clinic: { select: CLINIC_SELECT },
        },
      },
    },
    orderBy: { displayName: 'asc' },
  })

  return rows
    .filter((p) => p.clinicAssociations.length > 0)
    .filter(
      (p) =>
        !isRemovedPractitionerSlug(p.slug) &&
        !hasTripleLetterSequence(p.displayName),
    )
    .map(convertDbPractitionerToOldType)
})

/**
 * Single practitioner by slug with full clinic data including hours (cached)
 */
export const getPractitionerBySlug = cache(async (slug: string): Promise<Practitioner | null> => {
  if (isRemovedPractitionerSlug(slug)) return null

  const p = await prisma.practitioner.findFirst({
    where: { slug, isHidden: false },
    include: {
      ranking: true,
      treatments: {
        select: {
          treatment: { select: { name: true } },
        },
      },
      clinicAssociations: {
        orderBy: { clinicId: 'asc' },
        include: {
          clinic: {
            select: {
              ...CLINIC_SELECT,
              hours: {
                select: { dayOfWeek: true, hours: true },
              },
            },
          },
        },
      },
    },
  })

  if (!p || hasTripleLetterSequence(p.displayName)) return null
  return convertDbPractitionerToOldType(p)
})

export async function updatePractitioner(slug: string, data: Prisma.PractitionerUpdateInput) {
  return await prisma.practitioner.update({ where: { slug }, data })
}

export async function createPractitioner(data: Prisma.PractitionerCreateInput) {
  return await prisma.practitioner.create({ data })
}
