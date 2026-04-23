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
