import { Prisma } from "@prisma/client"
import { getClinicDisplayName } from "@/lib/clinic-display"
import { hasTrackingDatabaseConfig, prisma } from "@/lib/prisma"
import { PPL_LEAD_PRICE, SUBSCRIPTION_MONTHLY_PRICE } from "@/lib/pricing"

const PAGE_TYPES = ["practitioner_page", "clinic_page", "collection_page", "other"] as const
const DEVICE_TYPES = ["mobile", "desktop"] as const

export type TrackingTab = "events" | "leads" | "signups" | "campaign"

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
  consultationLeads: number
  pricingLeads: number
  clinicSignUps: number
  practitionerSignUps: number
  conversionRate: number
  pricingClicks: number
  consultationClicks: number
  topPagesByClicks: TrackingOverviewItem[]
  topPagesByLeads: TrackingOverviewItem[]
  topCitiesByClicks: TrackingOverviewItem[]
  topCitiesByLeads: TrackingOverviewItem[]
  topSearches: TrackingOverviewItem[]
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
    consultationLeads: 0,
    pricingLeads: 0,
    clinicSignUps: 0,
    practitionerSignUps: 0,
    conversionRate: 0,
    pricingClicks: 0,
    consultationClicks: 0,
    topPagesByClicks: [],
    topPagesByLeads: [],
    topCitiesByClicks: [],
    topCitiesByLeads: [],
    topSearches: [],
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

// Slugs that can end up in this URL position but are not real cities — either a
// nationwide/country placeholder (from a historical routing bug that derived the
// slug from an address's country instead of its city) or another non-city route
// segment (e.g. /clinics/treatment-by-city). Old tracked events with these slugs
// would otherwise keep surfacing as fake "cities" in the dashboard forever.
const NON_CITY_SLUGS = new Set(["united-kingdom", "uk", "gb", "great-britain"])

function extractCity(pageUrl: string): string | null {
  try {
    const url = new URL(normalizePathInput(pageUrl))
    const segments = url.pathname.split("/").filter(Boolean)
    const idx = segments.findIndex((segment) => segment === "clinics" || segment === "practitioners")
    if (idx === -1) return null
    const citySegment = segments[idx + 1]
    if (!citySegment || NON_CITY_SLUGS.has(citySegment.toLowerCase())) return null
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

function parseSearchQuery(ctaTargetUrl: string | null): string | null {
  if (!ctaTargetUrl) return null
  try {
    let params: URLSearchParams
    if (ctaTargetUrl.startsWith("http://") || ctaTargetUrl.startsWith("https://")) {
      params = new URL(ctaTargetUrl).searchParams
    } else {
      params = new URLSearchParams(ctaTargetUrl)
    }
    const query = (params.get("query") || "").trim()
    if (query) return query
    const category = (params.get("category") || "").trim()
    if (category) return category
    return null
  } catch {
    return null
  }
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
  const searchDetails = row.ctaLabel === "search_used" ? parseSearchParams(row.ctaTargetUrl) : null
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
    search_query: searchDetails?.query ?? null,
    search_category: searchDetails?.category ?? null,
    search_location: searchDetails?.location ?? null,
    search_type: searchDetails?.type ?? null,
  }
}

function parseSearchParams(ctaTargetUrl: string | null): {
  query: string | null
  category: string | null
  location: string | null
  type: string | null
} | null {
  if (!ctaTargetUrl) return null
  try {
    const params =
      ctaTargetUrl.startsWith("http://") || ctaTargetUrl.startsWith("https://")
        ? new URL(ctaTargetUrl).searchParams
        : new URLSearchParams(ctaTargetUrl)

    const query = (params.get("query") || "").trim() || null
    const category = (params.get("category") || "").trim() || null
    const location = (params.get("location") || "").trim() || null
    const type = (params.get("type") || "").trim() || null
    return { query, category, location, type }
  } catch {
    return null
  }
}

function mapConsultationLeadRow(row: {
  id: number
  createdAt: Date
  patientName: string | null
  patientPhone: string | null
  patientEmail: string | null
  treatment: string | null
  location: string | null
  notificationEmailTo: string | null
  notificationEmailSentAt: Date | null
  notificationEmailReadAt: Date | null
  notificationSmsTo: string | null
  notificationSmsStatus: string | null
  notificationSmsSentAt: Date | null
  notificationSmsDeliveredAt: Date | null
  notificationSmsReadAt: Date | null
  clinic: {
    slug: string
    email: string | null
    gmapsPhone: string | null
    city: { slug: string } | null
  }
}) {
  const citySlug = row.clinic.city?.slug ?? "unknown"
  const clinicEmail = row.clinic.email?.trim() || null
  const clinicPhone = row.clinic.gmapsPhone?.trim() || null
  // Distinguishes a genuine send failure ("not_sent") from the case where the
  // clinic has no contact address on record ("no_clinic_email") — the latter
  // renders differently in the dashboard so admins don't chase a non-bug.
  const emailStatus = row.notificationEmailSentAt
    ? "sent"
    : clinicEmail
      ? "not_sent"
      : "no_clinic_email"
  const smsStatus = row.notificationSmsSentAt
    ? "sent"
    : clinicPhone
      ? "not_sent"
      : "no_clinic_phone"
  return {
    id: `consultation-${row.id}`,
    timestamp: row.createdAt.toISOString(),
    page_url: `https://consentz.com/directory/clinics/${citySlug}/clinic/${row.clinic.slug}`,
    page_type: "clinic_page",
    referrer: "consultation_form",
    country: "GB",
    device_type: "unknown",
    name: row.patientName ?? "—",
    contact: row.patientEmail || row.patientPhone || "—",
    treatment: row.treatment,
    location: row.location,
    budget: null,
    lead_type: "consultation",
    email_status: emailStatus,
    clinic_email: clinicEmail,
    email_recipient: row.notificationEmailTo,
    email_sent_at: row.notificationEmailSentAt ? row.notificationEmailSentAt.toISOString() : null,
    email_read_at: row.notificationEmailReadAt ? row.notificationEmailReadAt.toISOString() : null,
    sms_status: smsStatus,
    sms_delivery_status: row.notificationSmsStatus,
    clinic_phone: clinicPhone,
    sms_recipient: row.notificationSmsTo,
    sms_sent_at: row.notificationSmsSentAt ? row.notificationSmsSentAt.toISOString() : null,
    sms_delivered_at: row.notificationSmsDeliveredAt ? row.notificationSmsDeliveredAt.toISOString() : null,
    sms_read_at: row.notificationSmsReadAt ? row.notificationSmsReadAt.toISOString() : null,
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
    lead_type: "pricing",
    // Legacy DirectoryLead rows predate clinic-notification tracking — there is
    // no email to report either way.
    email_status: "not_tracked",
    clinic_email: null,
    email_recipient: null,
    email_sent_at: null,
    email_read_at: null,
    sms_status: "not_tracked",
    sms_delivery_status: null,
    clinic_phone: null,
    sms_recipient: null,
    sms_sent_at: null,
    sms_delivered_at: null,
    sms_read_at: null,
  }
}

function planDisplayLabel(plan: string | null): string {
  if (plan === "subscription") return `Subscription (£${SUBSCRIPTION_MONTHLY_PRICE}/mo)`
  if (plan === "pay_per_lead") return `Pay per lead (£${PPL_LEAD_PRICE}/lead)`
  if (plan === "free") return "Free (£0)"
  return "Not selected"
}

function mapSignUpRow(row: {
  id: number
  entityType: string
  claimerName: string
  claimerEmail: string
  clinicSlug: string | null
  practitionerSlug: string | null
  clinicNameInput: string | null
  selectedPlan: string | null
  approvedAt: Date | null
  createdAt: Date
  clinic: { name: string | null; slug: string; gmapsUrl: string | null } | null
  practitioner: { displayName: string | null; slug: string } | null
}) {
  const entitySlug =
    row.entityType === "practitioner"
      ? row.practitioner?.slug || row.practitionerSlug || "—"
      : row.clinic?.slug || row.clinicSlug || "—"

  const entityName =
    row.entityType === "practitioner"
      ? row.practitioner?.displayName?.trim() ||
        (row.practitionerSlug
          ? getClinicDisplayName({ slug: row.practitionerSlug, url: undefined })
          : "Unknown practitioner")
      : row.clinic?.name?.trim() ||
        row.clinicNameInput?.trim() ||
        getClinicDisplayName({
          slug: row.clinic?.slug || row.clinicSlug || undefined,
          url: row.clinic?.gmapsUrl || undefined,
        })

  return {
    id: `signup-${row.id}`,
    timestamp: (row.approvedAt ?? row.createdAt).toISOString(),
    entity_type: row.entityType,
    entity_name: entityName,
    entity_slug: entitySlug,
    claimer_name: row.claimerName,
    claimer_email: row.claimerEmail,
    plan: row.selectedPlan,
    plan_label: planDisplayLabel(row.selectedPlan),
  }
}

function mapCampaignEmailRow(row: {
  id: number
  slug: string
  name: string | null
  email: string | null
  campaignEmailedAt: Date | null
  campaignEmailReadAt: Date | null
  city: { name: string | null } | null
}) {
  return {
    id: `campaign-${row.id}`,
    timestamp: (row.campaignEmailedAt ?? new Date(0)).toISOString(),
    clinic_name: row.name?.trim() || getClinicDisplayName({ slug: row.slug, url: undefined }),
    clinic_slug: row.slug,
    city: row.city?.name ?? null,
    email_recipient: row.email,
    email_sent_at: row.campaignEmailedAt ? row.campaignEmailedAt.toISOString() : null,
    email_read_at: row.campaignEmailReadAt ? row.campaignEmailReadAt.toISOString() : null,
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

  if (params.tab === "signups") {
    const where: Prisma.ClaimRequestWhereInput = {
      status: "approved",
    }
    if (timestamp) {
      where.OR = [
        { approvedAt: timestamp },
        { approvedAt: null, createdAt: timestamp },
      ]
    }
    if (q) {
      where.AND = [
        {
          OR: [
            { claimerName: { contains: q } },
            { claimerEmail: { contains: q } },
            { clinicSlug: { contains: q } },
            { practitionerSlug: { contains: q } },
            { clinic: { name: { contains: q } } },
            { clinic: { slug: { contains: q } } },
            { practitioner: { displayName: { contains: q } } },
            { practitioner: { slug: { contains: q } } },
          ],
        },
      ]
    }

    const [items, total] = await prisma.$transaction([
      prisma.claimRequest.findMany({
        where,
        include: {
          clinic: { select: { name: true, slug: true, gmapsUrl: true } },
          practitioner: { select: { displayName: true, slug: true } },
        },
        orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
        skip,
        take,
      }),
      prisma.claimRequest.count({ where }),
    ])

    return { rows: items.map(mapSignUpRow), total }
  }

  if (params.tab === "campaign") {
    const where: Prisma.ClinicWhereInput = {
      campaignEmailedAt: { not: null },
    }
    if (timestamp) where.campaignEmailedAt = timestamp
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { slug: { contains: q } },
        { email: { contains: q } },
      ]
    }

    const [items, total] = await prisma.$transaction([
      prisma.clinic.findMany({
        where,
        select: {
          id: true,
          slug: true,
          name: true,
          email: true,
          campaignEmailedAt: true,
          campaignEmailReadAt: true,
          city: { select: { name: true } },
        },
        orderBy: { campaignEmailedAt: "desc" },
        skip,
        take,
      }),
      prisma.clinic.count({ where }),
    ])

    return { rows: items.map(mapCampaignEmailRow), total }
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

  const consultationWhere: Prisma.ConsultationLeadWhereInput = {}
  if (timestamp) consultationWhere.createdAt = timestamp
  if (q) {
    consultationWhere.OR = [
      { patientName: { contains: q } },
      { patientEmail: { contains: q } },
      { patientPhone: { contains: q } },
      { treatment: { contains: q } },
      { location: { contains: q } },
      { clinic: { slug: { contains: q } } },
      { clinic: { name: { contains: q } } },
    ]
  }

  const [consultationItems, consultationTotal, pricingItems, pricingTotal] =
    await prisma.$transaction([
      prisma.consultationLead.findMany({
        where: consultationWhere,
        include: {
          clinic: {
            select: {
              slug: true,
              email: true,
              gmapsPhone: true,
              city: { select: { slug: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.consultationLead.count({ where: consultationWhere }),
      prisma.directoryLead.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip,
        take,
      }),
      prisma.directoryLead.count({ where }),
    ])

  const mergedRows = [
    ...consultationItems.map(mapConsultationLeadRow),
    ...pricingItems.map(mapLeadRow),
  ]
    .sort((left, right) => String(right.timestamp).localeCompare(String(left.timestamp)))
    .slice(0, take)

  return {
    rows: mergedRows,
    total: consultationTotal + pricingTotal,
  }
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
  const whereConsultationLead: Prisma.ConsultationLeadWhereInput = Object.keys(whereWindow).length
    ? { createdAt: whereWindow }
    : {}
  const whereApprovedClaim: Prisma.ClaimRequestWhereInput = {
    status: "approved",
  }
  if (Object.keys(whereWindow).length) {
    whereApprovedClaim.OR = [
      { approvedAt: whereWindow },
      { approvedAt: null, createdAt: whereWindow },
    ]
  }

  const [
    totalClicks,
    pricingLeads,
    consultationLeads,
    clinicSignUps,
    practitionerSignUps,
    pricingClicks,
    consultationClicks,
    topPagesClicksRaw,
    topPagesLeadsRaw,
    deviceRaw,
    pageTypeRaw,
    referrerRaw,
    eventTrendRows,
    consultationLeadTrendRows,
    pricingLeadTrendRows,
    eventPagesForCities,
    leadPagesForCities,
    searchEventRows,
  ] = await prisma.$transaction([
    prisma.directoryEvent.count({ where: whereWithTimestamp }),
    prisma.directoryLead.count({ where: whereLeadWithTimestamp }),
    prisma.consultationLead.count({ where: whereConsultationLead }),
    prisma.claimRequest.count({
      where: { ...whereApprovedClaim, entityType: "clinic" },
    }),
    prisma.claimRequest.count({
      where: { ...whereApprovedClaim, entityType: "practitioner" },
    }),
    prisma.directoryEvent.count({
      where: {
        ...whereWithTimestamp,
        ctaLabel: { contains: "pricing" },
      },
    }),
    prisma.directoryEvent.count({
      where: {
        ...whereWithTimestamp,
        OR: [
          { ctaLabel: { contains: "consultation" } },
          { ctaLabel: { contains: "Consultation" } },
        ],
      },
    }),
    prisma.directoryEvent.groupBy({
      by: ["pageUrl"],
      where: whereWithTimestamp,
      _count: { pageUrl: true },
      orderBy: { _count: { pageUrl: "desc" } },
      take: 5,
    }),
    prisma.consultationLead.groupBy({
      by: ["clinicId"],
      where: whereConsultationLead,
      _count: { clinicId: true },
      orderBy: { _count: { clinicId: "desc" } },
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
    prisma.consultationLead.findMany({
      where: whereConsultationLead,
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.directoryLead.findMany({
      where: whereLeadWithTimestamp,
      select: { timestamp: true },
      orderBy: { timestamp: "asc" },
    }),
    prisma.directoryEvent.findMany({
      where: whereWithTimestamp,
      select: { pageUrl: true },
      take: 3000,
    }),
    prisma.consultationLead.findMany({
      where: whereConsultationLead,
      select: {
        clinic: {
          select: {
            slug: true,
            city: { select: { slug: true } },
          },
        },
      },
      take: 2000,
    }),
    prisma.directoryEvent.findMany({
      where: {
        ...whereWithTimestamp,
        ctaLabel: "search_used",
      },
      select: { ctaTargetUrl: true },
      take: 3000,
    }),
  ])

  const totalLeads = consultationLeads + pricingLeads

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
  for (const row of consultationLeadTrendRows) {
    const key = toLocalDateKey(row.createdAt)
    const item = trendMap.get(key)
    if (item) item.leads += 1
  }
  for (const row of pricingLeadTrendRows) {
    const key = toLocalDateKey(row.timestamp)
    const item = trendMap.get(key)
    if (item) item.leads += 1
  }

  const clickCityCount = new Map<string, number>()
  for (const row of eventPagesForCities) {
    const city = extractCity(row.pageUrl)
    if (!city) continue
    clickCityCount.set(city, (clickCityCount.get(city) || 0) + 1)
  }
  const topCitiesByClicks = [...clickCityCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([key, value]) => ({ key, value }))

  const cityCount = new Map<string, number>()
  for (const row of leadPagesForCities) {
    const citySlug = row.clinic.city?.slug
    if (!citySlug) continue
    const city = citySlug
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
    cityCount.set(city, (cityCount.get(city) || 0) + 1)
  }
  const topCitiesByLeads = [...cityCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([key, value]) => ({ key, value }))

  const searchCount = new Map<string, number>()
  for (const row of searchEventRows) {
    const key = parseSearchQuery(row.ctaTargetUrl)
    if (!key) continue
    searchCount.set(key, (searchCount.get(key) || 0) + 1)
  }
  const topSearches = [...searchCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, value]) => ({ key, value }))

  const conversionRate = totalClicks > 0 ? (totalLeads / totalClicks) * 100 : 0

  const clinicSlugById = new Map(
    (
      await prisma.clinic.findMany({
        where: {
          id: {
            in: topPagesLeadsRaw.map((row) => row.clinicId),
          },
        },
        select: { id: true, slug: true },
      })
    ).map((clinic) => [clinic.id, clinic.slug])
  )

  return {
    windowDays: safeWindowDays,
    from: effectiveFrom ? toLocalDateKey(effectiveFrom) : null,
    to: effectiveTo ? toLocalDateKey(effectiveTo) : null,
    totalClicks,
    totalLeads,
    consultationLeads,
    pricingLeads,
    clinicSignUps,
    practitionerSignUps,
    conversionRate,
    pricingClicks,
    consultationClicks,
    topPagesByClicks: toOverviewItems(
      topPagesClicksRaw.map((row) => ({ key: row.pageUrl, value: (row as any)._count?.pageUrl ?? 0 }))
    ),
    topPagesByLeads: toOverviewItems(
      topPagesLeadsRaw.map((row) => ({
        key: clinicSlugById.get(row.clinicId) ?? `clinic-${row.clinicId}`,
        value: (row as any)._count?.clinicId ?? 0,
      }))
    ),
    topCitiesByClicks: toOverviewItems(topCitiesByClicks),
    topCitiesByLeads: toOverviewItems(topCitiesByLeads),
    topSearches: toOverviewItems(topSearches),
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
