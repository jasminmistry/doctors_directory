/**
 * searchClinicsForListing default sort: Consentz customers are pinned above other matches,
 * and skip/take paginates correctly across the Consentz / non-Consentz boundary.
 */
jest.mock('react', () => ({ ...jest.requireActual('react'), cache: (fn: unknown) => fn }))

jest.mock('../lib/db', () => {
  const rows = [
    { id: 1, slug: 'alpha-clinic', reviewCount: 5, rating: 4.9 },
    { id: 2, slug: 'beta-clinic', reviewCount: 80, rating: 4.1 },
    { id: 3, slug: 'gamma-clinic', reviewCount: 80, rating: 4.6 },
    { id: 4, slug: 'delta-clinic', reviewCount: 0, rating: null },
    { id: 50, slug: '111-harley-st', reviewCount: 2, rating: 5 },
  ].map((r) => ({ ...r, city: null, treatments: [] }))

  const matches = (where: any, row: any): boolean => {
    if (!where) return true
    if (where.AND) return where.AND.every((w: any) => matches(w, row))
    if (where.slug?.in) return where.slug.in.includes(row.slug)
    if (where.slug?.notIn) return !where.slug.notIn.includes(row.slug)
    return true
  }

  return {
    prisma: {
      clinic: {
        count: async ({ where }: any) => rows.filter((r) => matches(where, r)).length,
        findMany: async ({ where, orderBy, skip = 0, take }: any) => {
          const keys: Array<Record<string, 'asc' | 'desc'>> = Array.isArray(orderBy) ? orderBy : [orderBy]
          return rows
            .filter((r) => matches(where, r))
            .sort((a: any, b: any) => {
              for (const key of keys) {
                const [field, dir] = Object.entries(key)[0]
                const diff = (a[field] ?? -1) - (b[field] ?? -1)
                if (diff !== 0) return dir === 'asc' ? diff : -diff
              }
              return 0
            })
            .slice(skip, skip + take)
        },
      },
    },
  }
})

import { searchClinicsForListing } from '../lib/data-access/clinics'

describe('searchClinicsForListing — Consentz first', () => {
  it('puts Consentz first, then most reviews / highest rating (shared listing order)', async () => {
    const { clinics, totalCount } = await searchClinicsForListing({ query: '111', skip: 0, take: 3 })
    expect(totalCount).toBe(5)
    expect(clinics.map((c) => c.slug)).toEqual(['111-harley-st', 'gamma-clinic', 'beta-clinic'])
  })

  it('continues with non-Consentz clinics on later pages without duplicates', async () => {
    const { clinics } = await searchClinicsForListing({ query: '111', skip: 3, take: 3 })
    expect(clinics.map((c) => c.slug)).toEqual(['alpha-clinic', 'delta-clinic'])
  })

  it('leaves explicit rating sort untouched', async () => {
    const { clinics } = await searchClinicsForListing({ query: '111', sortBy: 'rating', skip: 0, take: 3 })
    expect(clinics.map((c) => c.slug)).toEqual(['111-harley-st', 'alpha-clinic', 'gamma-clinic'])
  })
})
