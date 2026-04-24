import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { cache } from 'react'

export const getAllTreatmentNames = cache(async (): Promise<string[]> => {
  const treatments = await prisma.treatment.findMany({
    select: { name: true },
    orderBy: { name: 'asc' },
  })
  return treatments.map((t) => t.name)
})

export async function getTreatmentBySlug(slug: string) {
  return await prisma.treatment.findUnique({ where: { slug } })
}

export async function getAllTreatments() {
  return await prisma.treatment.findMany({ orderBy: { name: 'asc' } })
}

export async function createTreatment(data: Prisma.TreatmentCreateInput) {
  return await prisma.treatment.create({ data })
}

export async function updateTreatment(slug: string, data: Prisma.TreatmentUpdateInput) {
  return await prisma.treatment.update({ where: { slug }, data })
}

export async function deleteTreatment(slug: string) {
  return await prisma.treatment.delete({ where: { slug } })
}
