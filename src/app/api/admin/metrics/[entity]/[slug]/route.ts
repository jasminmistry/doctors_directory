import { NextRequest, NextResponse } from 'next/server'
import { hasTrackingDatabaseConfig, prisma } from '@/lib/prisma'
import { fetchGSCMetrics } from '@/lib/gsc'

export const dynamic = 'force-dynamic'

function parseDateRange(from: string | null, to: string | null): { start: Date; end: Date } {
  const end = to ? new Date(to) : new Date()
  end.setHours(23, 59, 59, 999)
  const start = from ? new Date(from) : new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
  start.setHours(0, 0, 0, 0)
  return { start, end }
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { entity: string; slug: string } }
) {
  const { entity, slug } = params

  if (entity !== 'clinic' && entity !== 'practitioner') {
    return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 })
  }

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  const sp = request.nextUrl.searchParams
  const { start, end } = parseDateRange(sp.get('from'), sp.get('to'))

  const urlFragment = entity === 'clinic' ? `/clinic/${slug}` : `/profile/${slug}`
  const pageType = entity === 'clinic' ? 'clinic_page' : 'practitioner_page'

  const [internal, gsc] = await Promise.all([
    hasTrackingDatabaseConfig
      ? Promise.all([
          prisma.directoryEvent.count({
            where: {
              pageType,
              pageUrl: { contains: urlFragment },
              ctaLabel: 'page_view',
              timestamp: { gte: start, lte: end },
            },
          }),
          prisma.directoryEvent.count({
            where: {
              pageType,
              pageUrl: { contains: urlFragment },
              ctaLabel: { not: 'page_view' },
              timestamp: { gte: start, lte: end },
            },
          }),
          prisma.directoryLead.count({
            where: {
              pageType,
              pageUrl: { contains: urlFragment },
              timestamp: { gte: start, lte: end },
            },
          }),
        ])
      : Promise.resolve([0, 0, 0] as [number, number, number]),
    fetchGSCMetrics({
      pagePathFragment: urlFragment,
      startDate: toDateStr(start),
      endDate: toDateStr(end),
    }),
  ])

  const [pageViews, contactClicks, leadsReceived] = internal as [number, number, number]

  return NextResponse.json({
    dateRange: { from: toDateStr(start), to: toDateStr(end) },
    internal: { pageViews, contactClicks, leadsReceived },
    gsc: gsc ?? null,
    gscConfigured: Boolean(process.env.GSC_SERVICE_ACCOUNT_CREDENTIALS && process.env.GSC_SITE_URL),
  })
}
