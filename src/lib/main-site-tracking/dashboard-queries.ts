import { Prisma } from "@prisma/client"
import { hasTrackingDatabaseConfig, prisma } from "@/lib/prisma"

export interface MainSiteListParams {
  q: string
  eventType: string
  from: string
  to: string
  page: number
  pageSize: number
}

export interface MainSiteOverviewItem {
  label: string
  value: number
}

export interface MainSiteOverview {
  windowDays: number | null
  from: string | null
  to: string | null
  totalClicks: number
  formActions: number
  totalLeads: number
  loginActions: number
  top20Clicks: MainSiteOverviewItem[]
  top10BlogClicks: MainSiteOverviewItem[]
  top10ArticleClicks: MainSiteOverviewItem[]
  top10BlogViews: MainSiteOverviewItem[]
  top10ArticleViews: MainSiteOverviewItem[]
}

export interface MainSiteOverviewParams {
  windowDays: number | null
  from: string
  to: string
}

function parseDateValue(value: string): Date | null {
  const raw = value.trim()
  if (!raw) return null
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T")
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return null
  return date
}

function buildEndOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function getWindowStart(windowDays: number): Date {
  const days = Number.isFinite(windowDays) ? Math.max(1, Math.min(365, windowDays)) : 7
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))
  return start
}

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function buildTimestampFilter(from: Date | null, to: Date | null) {
  if (!from && !to) return undefined
  if (from && to) return { gte: from, lte: to }
  if (from) return { gte: from }
  return { lte: to as Date }
}

function toItems(rows: Array<{ key: string; value: number }>): MainSiteOverviewItem[] {
  return rows.map((row) => ({ label: row.key, value: row.value }))
}

function blankOverview(windowDays: number | null, from: string | null, to: string | null): MainSiteOverview {
  return {
    windowDays,
    from,
    to,
    totalClicks: 0,
    formActions: 0,
    totalLeads: 0,
    loginActions: 0,
    top20Clicks: [],
    top10BlogClicks: [],
    top10ArticleClicks: [],
    top10BlogViews: [],
    top10ArticleViews: [],
  }
}

function mapRow(row: {
  id: bigint
  timestamp: Date
  pageUrl: string
  referrer: string
  country: string
  deviceType: string
  eventType: string
  eventName: string
  targetUrl: string | null
  contentType: string | null
  contentSlug: string | null
  contactName: string | null
  contactValue: string | null
  metaJson: string | null
}) {
  return {
    id: row.id.toString(),
    timestamp: row.timestamp.toISOString(),
    page_url: row.pageUrl,
    referrer: row.referrer,
    country: row.country,
    device_type: row.deviceType,
    event_type: row.eventType,
    event_name: row.eventName,
    target_url: row.targetUrl,
    content_type: row.contentType,
    content_slug: row.contentSlug,
    contact_name: row.contactName,
    contact_value: row.contactValue,
    meta_json: row.metaJson,
  }
}

export async function listMainSiteRows(
  params: MainSiteListParams
): Promise<{ rows: Record<string, unknown>[]; total: number }> {
  if (!hasTrackingDatabaseConfig) return { rows: [], total: 0 }

  const q = params.q.trim()
  const from = parseDateValue(params.from)
  const toRaw = parseDateValue(params.to)
  const to = toRaw ? buildEndOfDay(toRaw) : null
  const timestamp = buildTimestampFilter(from, to)
  const eventType = params.eventType.trim()

  const skip = Math.max(0, (params.page - 1) * params.pageSize)
  const take = Math.min(100, Math.max(1, params.pageSize))

  const where: Prisma.MainSiteEventWhereInput = {}
  if (timestamp) where.timestamp = timestamp
  if (eventType) where.eventType = eventType
  if (q) {
    where.OR = [
      { pageUrl: { contains: q } },
      { referrer: { contains: q } },
      { eventType: { contains: q } },
      { eventName: { contains: q } },
      { targetUrl: { contains: q } },
      { contentType: { contains: q } },
      { contentSlug: { contains: q } },
      { contactName: { contains: q } },
      { contactValue: { contains: q } },
    ]
  }

  const [items, total] = await prisma.$transaction([
    prisma.mainSiteEvent.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip,
      take,
    }),
    prisma.mainSiteEvent.count({ where }),
  ])

  return { rows: items.map(mapRow), total }
}

export async function getMainSiteOverview(params: MainSiteOverviewParams): Promise<MainSiteOverview> {
  const safeWindowDays =
    params.windowDays === null ? null : Math.max(1, Math.min(365, Math.floor(params.windowDays || 7)))
  const fromDate = parseDateValue(params.from)
  const toDateRaw = parseDateValue(params.to)
  const toDate = toDateRaw ? buildEndOfDay(toDateRaw) : null
  const effectiveFrom = fromDate ?? (safeWindowDays ? getWindowStart(safeWindowDays) : null)
  const effectiveTo = toDate

  if (!hasTrackingDatabaseConfig) {
    return blankOverview(
      safeWindowDays,
      effectiveFrom ? toDateKey(effectiveFrom) : null,
      effectiveTo ? toDateKey(effectiveTo) : null
    )
  }

  const whereTime: Prisma.DateTimeFilter = {}
  if (effectiveFrom) whereTime.gte = effectiveFrom
  if (effectiveTo) whereTime.lte = effectiveTo
  const where: Prisma.MainSiteEventWhereInput = Object.keys(whereTime).length ? { timestamp: whereTime } : {}

  const [
    totalClicks,
    formActions,
    totalLeads,
    loginActions,
    top20ClicksRaw,
    top10BlogClicksRaw,
    top10ArticleClicksRaw,
    top10BlogViewsRaw,
    top10ArticleViewsRaw,
  ] = await prisma.$transaction([
    prisma.mainSiteEvent.count({
      where: {
        ...where,
        eventType: { in: ["click", "form_click", "login_click"] },
      },
    }),
    prisma.mainSiteEvent.count({
      where: {
        ...where,
        eventType: { in: ["form_click", "form_complete"] },
        eventName: { in: ["book_demo", "register"] },
      },
    }),
    prisma.mainSiteEvent.count({
      where: {
        ...where,
        eventType: "form_complete",
        eventName: { in: ["book_demo", "register"] },
      },
    }),
    prisma.mainSiteEvent.count({
      where: {
        ...where,
        eventType: "login_click",
      },
    }),
    prisma.mainSiteEvent.groupBy({
      by: ["targetUrl"],
      where: {
        ...where,
        eventType: { in: ["click", "form_click", "login_click"] },
        targetUrl: { not: null },
      },
      _count: { targetUrl: true },
      orderBy: { _count: { targetUrl: "desc" } },
      take: 20,
    }),
    prisma.mainSiteEvent.groupBy({
      by: ["targetUrl"],
      where: {
        ...where,
        eventType: "click",
        contentType: "blog",
        targetUrl: { not: null },
      },
      _count: { targetUrl: true },
      orderBy: { _count: { targetUrl: "desc" } },
      take: 10,
    }),
    prisma.mainSiteEvent.groupBy({
      by: ["targetUrl"],
      where: {
        ...where,
        eventType: "click",
        contentType: "article",
        targetUrl: { not: null },
      },
      _count: { targetUrl: true },
      orderBy: { _count: { targetUrl: "desc" } },
      take: 10,
    }),
    prisma.mainSiteEvent.groupBy({
      by: ["pageUrl"],
      where: {
        ...where,
        eventType: "page_view",
        contentType: "blog",
      },
      _count: { pageUrl: true },
      orderBy: { _count: { pageUrl: "desc" } },
      take: 10,
    }),
    prisma.mainSiteEvent.groupBy({
      by: ["pageUrl"],
      where: {
        ...where,
        eventType: "page_view",
        contentType: "article",
      },
      _count: { pageUrl: true },
      orderBy: { _count: { pageUrl: "desc" } },
      take: 10,
    }),
  ])

  return {
    windowDays: safeWindowDays,
    from: effectiveFrom ? toDateKey(effectiveFrom) : null,
    to: effectiveTo ? toDateKey(effectiveTo) : null,
    totalClicks,
    formActions,
    totalLeads,
    loginActions,
    top20Clicks: toItems(
      top20ClicksRaw.map((row) => ({ key: row.targetUrl || "unknown", value: (row as any)._count?.targetUrl ?? 0 }))
    ),
    top10BlogClicks: toItems(
      top10BlogClicksRaw.map((row) => ({ key: row.targetUrl || "unknown", value: (row as any)._count?.targetUrl ?? 0 }))
    ),
    top10ArticleClicks: toItems(
      top10ArticleClicksRaw.map((row) => ({ key: row.targetUrl || "unknown", value: (row as any)._count?.targetUrl ?? 0 }))
    ),
    top10BlogViews: toItems(
      top10BlogViewsRaw.map((row) => ({ key: row.pageUrl, value: (row as any)._count?.pageUrl ?? 0 }))
    ),
    top10ArticleViews: toItems(
      top10ArticleViewsRaw.map((row) => ({ key: row.pageUrl, value: (row as any)._count?.pageUrl ?? 0 }))
    ),
  }
}
