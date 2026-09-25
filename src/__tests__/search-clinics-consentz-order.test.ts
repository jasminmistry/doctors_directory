/**
 * searchClinicsForListing default sort: Consentz customers are pinned above other matches,
 * and skip/take paginates correctly across the Consentz / non-Consentz boundary.
 */
jest.mock('react', () => ({ ...jest.requireActual('react'), cache: (fn: unknown) => fn }))

jest.mock('../lib/db', () => {
  const rows = [
    { id: 1, slug: 'alpha-clinic' },
    { id: 2, slug: 'beta-clinic' },
    { id: 3, slug: 'gamma-clinic' },
    { id: 4, slug: 'delta-clinic' },
    { id: 50, slug: '111-harley-st' },
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
        findMany: async ({ where, skip = 0, take }: any) =>
          rows
            .filter((r) => matches(where, r))
            .sort((a, b) => a.id - b.id)
            .slice(skip, skip + take),
      },
    },
  }
})

import { searchClinicsForListing } from '../lib/data-access/clinics'

describe('searchClinicsForListing — Consentz first', () => {
  it('puts Consentz clinics on the first page ahead of lower ids', async () => {
    const { clinics, totalCount } = await searchClinicsForListing({ query: '111', skip: 0, take: 3 })
    expect(totalCount).toBe(5)
    expect(clinics.map((c) => c.slug)).toEqual(['111-harley-st', 'alpha-clinic', 'beta-clinic'])
  })

  it('continues with non-Consentz clinics on later pages without duplicates', async () => {
    const { clinics } = await searchClinicsForListing({ query: '111', skip: 3, take: 3 })
    expect(clinics.map((c) => c.slug)).toEqual(['gamma-clinic', 'delta-clinic'])
  })

  it('leaves explicit rating sort untouched', async () => {
    const { clinics } = await searchClinicsForListing({ query: '111', sortBy: 'rating', skip: 0, take: 3 })
    expect(clinics.map((c) => c.slug)).toEqual(['alpha-clinic', 'beta-clinic', 'gamma-clinic'])
  })
})
