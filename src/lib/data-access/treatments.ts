import { prisma } from '@/lib/db'
import { cache } from 'react'

/**
 * Get all treatment names from DB (cached) — used for search/list
 */
export const getAllTreatmentNames = cache(async (): Promise<string[]> => {
  const treatments = await prisma.treatment.findMany({
    select: { name: true },
    orderBy: { name: 'asc' },
  })
  return treatments.map((t) => t.name)
})

/**
 * Get a single treatment by slug (cached) — used for detail page
 */
export const getTreatmentBySlug = cache(async (slug: string) => {
  return await prisma.treatment.findUnique({
    where: { slug },
  })
})
