import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { cache } from 'react'
import type { Practitioner, RankingMeta, ItemMeta } from '@/lib/types'

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

/**
 * All practitioners with primary clinic merged — for search, city pages, sitemaps (cached)
 */
export const getAllPractitionersForSearch = cache(async (): Promise<Practitioner[]> => {
  const rows = await prisma.practitioner.findMany({
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
    .map(convertDbPractitionerToOldType)
})

/**
 * Single practitioner by slug with full clinic data including hours (cached)
 */
export const getPractitionerBySlug = cache(async (slug: string): Promise<Practitioner | null> => {
  const p = await prisma.practitioner.findUnique({
    where: { slug },
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

  return p ? convertDbPractitionerToOldType(p) : null
})

export async function updatePractitioner(slug: string, data: Prisma.PractitionerUpdateInput) {
  return await prisma.practitioner.update({ where: { slug }, data })
}
