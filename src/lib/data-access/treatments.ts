import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { cache } from 'react'
import NodeCache from 'node-cache'
import { getCache, setCache } from '@/lib/redis-cache'

export const getAllTreatmentNames = cache(async (): Promise<string[]> => {
  const treatments = await prisma.treatment.findMany({
    select: { name: true },
    orderBy: { name: 'asc' },
  })
  return treatments.map((t) => t.name)
})

export type TreatmentOption = { name: string; slug: string }

// The header's SearchBar renders on every page and calls this on mount for autocomplete —
// it only needs {name, slug}, not the full row (which carries 16 large Json fields per
// treatment). React's cache() only dedupes within one request, so this also gets the same
// NodeCache + Redis tiered cache as src/lib/search-cache.ts to survive across page loads.
const TREATMENT_OPTIONS_CACHE_KEY = 'treatment-options:v1'
const TREATMENT_OPTIONS_TTL_SECONDS = 3600

const treatmentOptionsMemoryCache = new NodeCache({
  stdTTL: TREATMENT_OPTIONS_TTL_SECONDS,
  useClones: false,
})

export const getAllTreatmentOptions = cache(async (): Promise<TreatmentOption[]> => {
  const local = treatmentOptionsMemoryCache.get<TreatmentOption[]>(TREATMENT_OPTIONS_CACHE_KEY)
  if (local !== undefined) return local

  const remote = await getCache<TreatmentOption[]>(TREATMENT_OPTIONS_CACHE_KEY)
  if (remote !== null) {
    treatmentOptionsMemoryCache.set(TREATMENT_OPTIONS_CACHE_KEY, remote)
    return remote
  }

  const fresh = await prisma.treatment.findMany({
    select: { name: true, slug: true },
    orderBy: { name: 'asc' },
  })
  treatmentOptionsMemoryCache.set(TREATMENT_OPTIONS_CACHE_KEY, fresh)
  await setCache(TREATMENT_OPTIONS_CACHE_KEY, fresh, TREATMENT_OPTIONS_TTL_SECONDS)
  return fresh
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
