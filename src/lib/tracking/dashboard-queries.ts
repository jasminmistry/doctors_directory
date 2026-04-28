import { Prisma } from "@prisma/client"
import { hasTrackingDatabaseConfig, prisma } from "@/lib/prisma"

const PAGE_TYPES = ["practitioner_page", "clinic_page", "collection_page", "other"] as const
const DEVICE_TYPES = ["mobile", "desktop"] as const

export type TrackingTab = "events" | "leads"

export interface TrackingListParams {
  tab: TrackingTab
  q: string
  pageType: string
  country: string
  deviceType: string
  from: string
  to: string
  page: number
  pageSize: number
}

export interface TrackingOverviewItem {
  label: string
  value: number
}

export interface TrackingTrendPoint {
  date: string
  clicks: number
  leads: number
}

export interface TrackingOverview {
  windowDays: number | null
  from: string | null
  to: string | null
  totalClicks: number
  totalLeads: number
  conversionRate: number
  pricingClicks: number
  consultationClicks: number
  topPagesByClicks: TrackingOverviewItem[]
  topPagesByLeads: TrackingOverviewItem[]
  topCitiesByLeads: TrackingOverviewItem[]
  deviceBreakdown: TrackingOverviewItem[]
  pageTypeBreakdown: TrackingOverviewItem[]
  referrerBreakdown: TrackingOverviewItem[]
  trend: TrackingTrendPoint[]
}

export interface TrackingOverviewParams {
  windowDays: number | null
  from: string
  to: string
}

function normalizePageType(value: string): string | null {
  const v = value.trim()
  if (!v) return null
  return PAGE_TYPES.includes(v as (typeof PAGE_TYPES)[number]) ? v : null
}

function normalizeDeviceType(value: string): string | null {
  const v = value.trim().toLowerCase()
  if (!v) return null
  return DEVICE_TYPES.includes(v as (typeof DEVICE_TYPES)[number]) ? v : null
}

function parseDateValue(value: string): Date | null {
  const raw = value.trim()
  if (!raw) return null
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T")
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return null
  return date
}

function getWindowStart(windowDays: number): Date {
  const days = Number.isFinite(windowDays) ? Math.max(1, Math.min(30, windowDays)) : 7
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))
  return start
}

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function blankOverview(windowDays: number | null, from: string | null, to: string | null): TrackingOverview {
  return {
    windowDays,
    from,
    to,
    totalClicks: 0,
    totalLeads: 0,
    conversionRate: 0,
    pricingClicks: 0,
    consultationClicks: 0,
    topPagesByClicks: [],
    topPagesByLeads: [],
    topCitiesByLeads: [],
    deviceBreakdown: [],
    pageTypeBreakdown: [],
    referrerBreakdown: [],
    trend: [],
  }
}

function normalizePathInput(value: string): string {
  if (value.startsWith("http://") || value.startsWith("https://")) return value
  if (value.startsWith("/")) return `https://consentz.com${value}`
  return `https://consentz.com/${value}`
}

function extractCity(pageUrl: string): string | null {
  try {
    const url = new URL(normalizePathInput(pageUrl))
    const segments = url.pathname.split("/").filter(Boolean)
    const idx = segments.findIndex((segment) => segment === "clinics" || segment === "practitioners")
    if (idx === -1) return null
    const citySegment = segments[idx + 1]
    if (!citySegment) return null
    const formatted = citySegment
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
      .trim()
    return formatted || null
  } catch {
    return null
  }
}

function toOverviewItems(rows: Array<{ key: string; value: number }>): TrackingOverviewItem[] {
  return rows.map((row) => ({ label: row.key, value: row.value }))
}

function buildEndOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function buildTimestampFilter(from: Date | null, to: Date | null) {
  if (!from && !to) return undefined
  if (from && to) return { gte: from, lte: to }
  if (from) return { gte: from }
  return { lte: to as Date }
}

function mapEventRow(row: {
  id: bigint
  timestamp: Date
  pageUrl: string
  pageType: string
  referrer: string
  country: string
  deviceType: string
  ctaLabel: string
  ctaTargetUrl: string | null
}) {
  return {
    id: row.id.toString(),
    timestamp: row.timestamp.toISOString(),
    page_url: row.pageUrl,
    page_type: row.pageType,
    referrer: row.referrer,
    country: row.country,
    device_type: row.deviceType,
    cta_label: row.ctaLabel,
    cta_target_url: row.ctaTargetUrl,
  }
}

function mapLeadRow(row: {
  id: bigint
  timestamp: Date
  pageUrl: string
  pageType: string
  referrer: string
  country: string
  deviceType: string
  name: string
  contact: string
  treatment: string | null
  location: string | null
  budget: string | null
}) {
  return {
    id: row.id.toString(),
    timestamp: row.timestamp.toISOString(),
    page_url: row.pageUrl,
    page_type: row.pageType,
    referrer: row.referrer,
    country: row.country,
    device_type: row.deviceType,
    name: row.name,
    contact: row.contact,
    treatment: row.treatment,
    location: row.location,
    budget: row.budget,
  }
}

export async function listTrackingRows(
  params: TrackingListParams
): Promise<{ rows: Record<string, unknown>[]; total: number }> {
  if (!hasTrackingDatabaseConfig) {
    return { rows: [], total: 0 }
  }

  const pageType = normalizePageType(params.pageType)
  const deviceType = normalizeDeviceType(params.deviceType)
  const country = params.country.trim().toUpperCase()
  const from = parseDateValue(params.from)
  const to = parseDateValue(params.to)
  const timestamp = buildTimestampFilter(from, to)
  const q = params.q.trim()

  const skip = Math.max(0, (params.page - 1) * params.pageSize)
  const take = Math.min(100, Math.max(1, params.pageSize))

  if (params.tab === "events") {
    const where: Prisma.DirectoryEventWhereInput = {}
    if (pageType) where.pageType = pageType
    if (deviceType) where.deviceType = deviceType
    if (country) where.country = country
    if (timestamp) where.timestamp = timestamp
    if (q) {
      where.OR = [
        { pageUrl: { contains: q } },
        { referrer: { contains: q } },
        { ctaLabel: { contains: q } },
        { ctaTargetUrl: { contains: q } },
      ]
    }

    const [items, total] = await prisma.$transaction([
      prisma.directoryEvent.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip,
        take,
      }),
      prisma.directoryEvent.count({ where }),
    ])

    return { rows: items.map(mapEventRow), total }
  }

  const where: Prisma.DirectoryLeadWhereInput = {}
  if (pageType) where.pageType = pageType
  if (deviceType) where.deviceType = deviceType
  if (country) where.country = country
  if (timestamp) where.timestamp = timestamp
  if (q) {
    where.OR = [
      { pageUrl: { contains: q } },
      { referrer: { contains: q } },
      { name: { contains: q } },
      { contact: { contains: q } },
      { treatment: { contains: q } },
      { location: { contains: q } },
      { budget: { contains: q } },
    ]
  }

  const [items, total] = await prisma.$transaction([
    prisma.directoryLead.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip,
      take,
    }),
    prisma.directoryLead.count({ where }),
  ])

  return { rows: items.map(mapLeadRow), total }
}

export async function getTrackingOverview(params: TrackingOverviewParams): Promise<TrackingOverview> {
  const safeWindowDays =
    params.windowDays === null ? null : Math.max(1, Math.min(30, Math.floor(params.windowDays || 7)))
  const fromDate = parseDateValue(params.from)
  const toDateRaw = parseDateValue(params.to)
  const toDate = toDateRaw ? buildEndOfDay(toDateRaw) : null
  const effectiveFrom = fromDate ?? (safeWindowDays ? getWindowStart(safeWindowDays) : null)
  const effectiveTo = toDate
  if (!hasTrackingDatabaseConfig) {
    return blankOverview(safeWindowDays, effectiveFrom ? toLocalDateKey(effectiveFrom) : null, effectiveTo ? toLocalDateKey(effectiveTo) : null)
  }

  const whereWindow: Prisma.DateTimeFilter = {}
  if (effectiveFrom) whereWindow.gte = effectiveFrom
  if (effectiveTo) whereWindow.lte = effectiveTo
  const whereWithTimestamp: Prisma.DirectoryEventWhereInput = Object.keys(whereWindow).length
    ? { timestamp: whereWindow }
    : {}
  const whereLeadWithTimestamp: Prisma.DirectoryLeadWhereInput = Object.keys(whereWindow).length
    ? { timestamp: whereWindow }
    : {}

  const [
    totalClicks,
    totalLeads,
    pricingClicks,
    consultationClicks,
    topPagesClicksRaw,
    topPagesLeadsRaw,
    deviceRaw,
    pageTypeRaw,
    referrerRaw,
    eventTrendRows,
    leadTrendRows,
    leadPagesForCities,
  ] = await prisma.$transaction([
    prisma.directoryEvent.count({ where: whereWithTimestamp }),
    prisma.directoryLead.count({ where: whereLeadWithTimestamp }),
    prisma.directoryEvent.count({
      where: {
        ...whereWithTimestamp,
        ctaLabel: { contains: "pricing" },
      },
    }),
    prisma.directoryEvent.count({
      where: {
        ...whereWithTimestamp,
        ctaLabel: { contains: "consultation" },
      },
    }),
    prisma.directoryEvent.groupBy({
      by: ["pageUrl"],
      where: whereWithTimestamp,
      _count: { pageUrl: true },
      orderBy: { _count: { pageUrl: "desc" } },
      take: 5,
    }),
    prisma.directoryLead.groupBy({
      by: ["pageUrl"],
      where: whereLeadWithTimestamp,
      _count: { pageUrl: true },
      orderBy: { _count: { pageUrl: "desc" } },
      take: 5,
    }),
    prisma.directoryEvent.groupBy({
      by: ["deviceType"],
      where: whereWithTimestamp,
      _count: { deviceType: true },
      orderBy: { _count: { deviceType: "desc" } },
    }),
    prisma.directoryEvent.groupBy({
      by: ["pageType"],
      where: whereWithTimestamp,
      _count: { pageType: true },
      orderBy: { _count: { pageType: "desc" } },
    }),
    prisma.directoryEvent.groupBy({
      by: ["referrer"],
      where: whereWithTimestamp,
      _count: { referrer: true },
      orderBy: { _count: { referrer: "desc" } },
      take: 5,
    }),
    prisma.directoryEvent.findMany({
      where: whereWithTimestamp,
      select: { timestamp: true },
      orderBy: { timestamp: "asc" },
    }),
    prisma.directoryLead.findMany({
      where: whereLeadWithTimestamp,
      select: { timestamp: true },
      orderBy: { timestamp: "asc" },
    }),
    prisma.directoryLead.findMany({
      where: whereLeadWithTimestamp,
      select: { pageUrl: true },
      take: 2000,
    }),
  ])

  const minTrendDate = effectiveFrom ?? (() => {
    const d = new Date()
    d.setDate(d.getDate() - 29)
    d.setHours(0, 0, 0, 0)
    return d
  })()
  const maxTrendDate = effectiveTo ?? (() => {
    const d = new Date()
    d.setHours(23, 59, 59, 999)
    return d
  })()

  const trendMap = new Map<string, TrackingTrendPoint>()
  const startCursor = new Date(minTrendDate)
  startCursor.setHours(0, 0, 0, 0)
  const endCursor = new Date(maxTrendDate)
  endCursor.setHours(0, 0, 0, 0)
  for (let day = new Date(startCursor); day <= endCursor; day.setDate(day.getDate() + 1)) {
    const key = toLocalDateKey(day)
    trendMap.set(key, { date: key, clicks: 0, leads: 0 })
  }

  for (const row of eventTrendRows) {
    const key = toLocalDateKey(row.timestamp)
    const item = trendMap.get(key)
    if (item) item.clicks += 1
  }
  for (const row of leadTrendRows) {
    const key = toLocalDateKey(row.timestamp)
    const item = trendMap.get(key)
    if (item) item.leads += 1
  }

  const cityCount = new Map<string, number>()
  for (const row of leadPagesForCities) {
    const city = extractCity(row.pageUrl)
    if (!city) continue
    cityCount.set(city, (cityCount.get(city) || 0) + 1)
  }
  const topCitiesByLeads = [...cityCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, value]) => ({ key, value }))

  const conversionRate = totalClicks > 0 ? (totalLeads / totalClicks) * 100 : 0

  return {
    windowDays: safeWindowDays,
    from: effectiveFrom ? toLocalDateKey(effectiveFrom) : null,
    to: effectiveTo ? toLocalDateKey(effectiveTo) : null,
    totalClicks,
    totalLeads,
    conversionRate,
    pricingClicks,
    consultationClicks,
    topPagesByClicks: toOverviewItems(
      topPagesClicksRaw.map((row) => ({ key: row.pageUrl, value: (row as any)._count?.pageUrl ?? 0 }))
    ),
    topPagesByLeads: toOverviewItems(
      topPagesLeadsRaw.map((row) => ({ key: row.pageUrl, value: (row as any)._count?.pageUrl ?? 0 }))
    ),
    topCitiesByLeads: toOverviewItems(topCitiesByLeads),
    deviceBreakdown: toOverviewItems(
      deviceRaw.map((row) => ({ key: row.deviceType, value: (row as any)._count?.deviceType ?? 0 }))
    ),
    pageTypeBreakdown: toOverviewItems(
      pageTypeRaw.map((row) => ({ key: row.pageType, value: (row as any)._count?.pageType ?? 0 }))
    ),
    referrerBreakdown: toOverviewItems(
      referrerRaw.map((row) => ({ key: row.referrer || "direct", value: (row as any)._count?.referrer ?? 0 }))
    ),
    trend: [...trendMap.values()],
  }
}
