/**
 * searchPractitionersForListing ORDER BY: default sort pins Consentz-linked practitioners
 * (any associated clinic) and follows the shared listing order; every sort ends on p.id.
 */
jest.mock('react', () => ({ ...jest.requireActual('react'), cache: (fn: unknown) => fn }))

const queries: string[] = []

jest.mock('../lib/db', () => ({
  prisma: {
    $queryRaw: async (sql: { sql: string }) => {
      queries.push(sql.sql.replace(/\s+/g, ' '))
      return sql.sql.includes('COUNT(*)') ? [{ count: BigInt(0) }] : []
    },
  },
}))

import { searchPractitionersForListing } from '../lib/data-access/practitioners'

function orderByClause(): string {
  const select = queries.find((q) => q.includes('SELECT p.id'))!
  const limit = select.lastIndexOf('LIMIT')
  return select.slice(select.lastIndexOf('ORDER BY', select.lastIndexOf('DESC', limit)), limit)
}

beforeEach(() => { queries.length = 0 })

describe('searchPractitionersForListing order', () => {
  it('default: Consentz-linked first, then reviews, rating, id', async () => {
    await searchPractitionersForListing({ query: 'botox', skip: 0, take: 9 })
    const order = orderByClause()
    expect(order).toMatch(/EXISTS \( SELECT 1 FROM practitioner_clinic_associations pca2 .* cc\.slug IN \(.*\) \) DESC, c\.reviewCount DESC, c\.rating DESC, p\.id ASC/)
  })

  it('explicit sorts get a stable id tie-breaker', async () => {
    await searchPractitionersForListing({ sortBy: 'rating', skip: 0, take: 9 })
    expect(orderByClause()).toContain('c.rating DESC, p.id ASC')
    queries.length = 0
    await searchPractitionersForListing({ sortBy: 'reviews', skip: 0, take: 9 })
    expect(orderByClause()).toContain('c.reviewCount DESC, p.id ASC')
  })
})
