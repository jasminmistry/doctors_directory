import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { guardGbpPortal } from '@/lib/gbp/portal-guard'
import { gbpFetch, GbpReauthError } from '@/lib/gbp/client'
import { GBP_BUSINESS_INFO_BASE, GBP_REGION_CODE } from '@/lib/gbp/config'
import { getCache, setCache } from '@/lib/redis-cache'

export const dynamic = 'force-dynamic'

interface GbpCategory {
  name: string
  displayName: string
}

// GBP category taxonomy (gcids) for the region. Cached in Redis for a day; the client
// combobox filters locally after the first load.
export async function GET(req: NextRequest) {
  const guard = await guardGbpPortal()
  if (!guard.ok) return guard.response

  const q = (req.nextUrl.searchParams.get('q') ?? '').toLowerCase().trim()
  const cacheKey = `gbp:categories:${GBP_REGION_CODE}`

  let categories = await getCache<GbpCategory[]>(cacheKey)

  if (!categories) {
    const conn = await prisma.gbpConnection.findUnique({ where: { clinicId: guard.clinicId } })
    if (!conn) return NextResponse.json({ error: 'Connect Google first to load categories' }, { status: 409 })

    try {
      const all: GbpCategory[] = []
      let pageToken: string | undefined
      do {
        const url =
          `${GBP_BUSINESS_INFO_BASE}/categories?regionCode=${GBP_REGION_CODE}` +
          `&languageCode=en&view=BASIC&pageSize=1000${pageToken ? `&pageToken=${pageToken}` : ''}`
        const data = (await gbpFetch(conn.id, url)) as {
          categories?: GbpCategory[]
          nextPageToken?: string
        }
        all.push(...(data.categories ?? []))
        pageToken = data.nextPageToken
      } while (pageToken && all.length < 5000)

      categories = all
      await setCache(cacheKey, categories, 86400)
    } catch (err) {
      if (err instanceof GbpReauthError) return NextResponse.json({ error: 'reauth_required' }, { status: 409 })
      console.error('[gbp/categories] failed:', err)
      return NextResponse.json({ error: 'Failed to load categories' }, { status: 502 })
    }
  }

  const filtered = q
    ? categories.filter((c) => c.displayName.toLowerCase().includes(q)).slice(0, 50)
    : categories.slice(0, 50)

  return NextResponse.json({ categories: filtered })
}
