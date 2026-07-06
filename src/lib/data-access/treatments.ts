import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { cache } from 'react'
import { withQueryCache, invalidateQueryCache } from '@/lib/query-cache'

export const getAllTreatmentNames = cache(async (): Promise<string[]> => {
  return withQueryCache('treatments:all-names', async () => {
    const treatments = await prisma.treatment.findMany({
      select: { name: true },
      orderBy: { name: 'asc' },
    })
    return treatments.map((t) => t.name)
  })
})

export async function getTreatmentBySlug(slug: string) {
  return await prisma.treatment.findUnique({ where: { slug } })
}

export async function getAllTreatments() {
  return await prisma.treatment.findMany({ orderBy: { name: 'asc' } })
}

export async function createTreatment(data: Prisma.TreatmentCreateInput) {
  const treatment = await prisma.treatment.create({ data })
  invalidateQueryCache('treatments:all-names')
  return treatment
}

export async function updateTreatment(slug: string, data: Prisma.TreatmentUpdateInput) {
  const treatment = await prisma.treatment.update({ where: { slug }, data })
  invalidateQueryCache('treatments:all-names')
  return treatment
}

export async function deleteTreatment(slug: string) {
  const treatment = await prisma.treatment.delete({ where: { slug } })
  invalidateQueryCache('treatments:all-names')
  return treatment
}
