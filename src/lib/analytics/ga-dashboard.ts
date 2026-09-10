import { sourceBucketLabel } from "@/lib/attribution"
import {
  batchRunReports,
  getGa4Config,
  keyed,
  scalar,
  type GaFilterExpression,
  type GaReport,
  type GaReportRequest,
} from "@/lib/analytics/ga-data-api"

export interface GaDashboardParams {
  /** GA4 date expressions — "YYYY-MM-DD" or relative like "28daysAgo" / "today". */
  startDate: string
  endDate: string
}

export interface NamedValue {
  label: string
  value: number
}

/**
 * Marketing-site (consentz.com WordPress) slice of the same GA4 property.
 * Every hit from that site carries the event param `site=main`; the directory
 * app sends `site=directory`. All figures here are filtered to `site=main`.
 */
export interface MainSiteStats {
  pageViews: number
  users: number
  sessions: number
  contentClicks: number
  formStarts: number
  leads: number
  logins: number
  topBlogPosts: NamedValue[]
  topArticles: NamedValue[]
  topBlogClicks: NamedValue[]
  topArticleClicks: NamedValue[]
  leadFunnel: { formName: string; label: string; starts: number; leads: number }[]
}

export interface GaDashboard {
  configured: boolean
  range: { startDate: string; endDate: string }
  kpis: {
    sessions: number
    users: number
    pageViews: number
    signUpStarts: number
    signUps: number
    leads: number
    enquiries: number
    bookings: number
    chats: number
    revenue: number
  }
  signUpFunnel: { stage: string; label: string; count: number }[]
  bookingFunnel: { stage: string; label: string; count: number }[]
  signUpsBySource: NamedValue[]
  channels: { channel: string; sessions: number; keyEvents: number }[]
  topPages: { path: string; views: number }[]
  devices: NamedValue[]
  trend: { date: string; sessions: number; keyEvents: number }[]
  /** Every event GA4 recorded in the range, highest count first. */
  events: { name: string; count: number }[]
  mainSite: MainSiteStats
}

const FUNNEL_STAGES: { event: string; label: string }[] = [
  { event: "sign_up_start", label: "Started" },
  { event: "sign_up_otp_verified", label: "Email verified" },
  { event: "sign_up_plan_selected", label: "Plan selected" },
  { event: "sign_up", label: "Submitted" },
  { event: "sign_up_approved", label: "Approved" },
]

const BOOKING_STAGES: { event: string; label: string }[] = [
  { event: "booking_start", label: "Started" },
  { event: "booking_slot_select", label: "Slot selected" },
  { event: "booking_complete", label: "Booked" },
]

function eventNameFilter(values: string[]): GaFilterExpression {
  return { filter: { fieldName: "eventName", inListFilter: { values } } }
}

function exactFilter(fieldName: string, value: string): GaFilterExpression {
  return { filter: { fieldName, stringFilter: { value, matchType: "EXACT" } } }
}

function andGroup(...expressions: GaFilterExpression[]): GaFilterExpression {
  return { andGroup: { expressions } }
}

/** `site=main` — the marketing-site slice of the shared GA4 property. */
const SITE_MAIN = exactFilter("customEvent:site", "main")

function emptyMainSite(): MainSiteStats {
  return {
    pageViews: 0,
    users: 0,
    sessions: 0,
    contentClicks: 0,
    formStarts: 0,
    leads: 0,
    logins: 0,
    topBlogPosts: [],
    topArticles: [],
    topBlogClicks: [],
    topArticleClicks: [],
    leadFunnel: [],
  }
}

function formLabel(name: string): string {
  if (name === "book_demo") return "Book a demo"
  if (name === "register") return "Register"
  return name || "(not set)"
}

/** [form_name, eventName] × eventCount  →  per-form { starts, leads }. */
function buildLeadFunnel(report: GaReport | undefined): MainSiteStats["leadFunnel"] {
  const map = new Map<string, { starts: number; leads: number }>()
  for (const row of report?.rows ?? []) {
    const formName = row.dimensionValues?.[0]?.value || "(not set)"
    const eventName = row.dimensionValues?.[1]?.value
    const count = Number(row.metricValues?.[0]?.value) || 0
    const entry = map.get(formName) ?? { starts: 0, leads: 0 }
    if (eventName === "form_start") entry.starts += count
    else if (eventName === "generate_lead") entry.leads += count
    map.set(formName, entry)
  }
  return [...map.entries()]
    .map(([formName, v]) => ({ formName, label: formLabel(formName), starts: v.starts, leads: v.leads }))
    .filter((r) => r.starts > 0 || r.leads > 0)
    .sort((a, b) => b.starts + b.leads - (a.starts + a.leads))
}

function blank(params: GaDashboardParams): GaDashboard {
  return {
    configured: false,
    range: { startDate: params.startDate, endDate: params.endDate },
    kpis: { sessions: 0, users: 0, pageViews: 0, signUpStarts: 0, signUps: 0, leads: 0, enquiries: 0, bookings: 0, chats: 0, revenue: 0 },
    signUpFunnel: FUNNEL_STAGES.map((s) => ({ stage: s.event, label: s.label, count: 0 })),
    bookingFunnel: BOOKING_STAGES.map((s) => ({ stage: s.event, label: s.label, count: 0 })),
    signUpsBySource: [],
    channels: [],
    topPages: [],
    devices: [],
    trend: [],
    events: [],
    mainSite: emptyMainSite(),
  }
}

/** Reads `eventName`-dimensioned report into a map of event -> count. */
function eventCounts(report: GaReport | undefined): Record<string, number> {
  const out: Record<string, number> = {}
  for (const row of report?.rows ?? []) {
    const name = row.dimensionValues?.[0]?.value
    if (name) out[name] = Number(row.metricValues?.[0]?.value) || 0
  }
  return out
}

function formatDateKey(ga4Date: string): string {
  // GA4 returns YYYYMMDD for the `date` dimension.
  if (/^\d{8}$/.test(ga4Date)) {
    return `${ga4Date.slice(0, 4)}-${ga4Date.slice(4, 6)}-${ga4Date.slice(6, 8)}`
  }
  return ga4Date
}

export async function getGaDashboard(params: GaDashboardParams): Promise<GaDashboard> {
  if (!getGa4Config()) return blank(params)

  const dateRanges = [{ startDate: params.startDate, endDate: params.endDate }]

  const requests: GaReportRequest[] = [
    // 0 — headline totals
    {
      dateRanges,
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "screenPageViews" },
        { name: "totalRevenue" },
      ],
    },
    // 1 — every event's count (feeds KPIs, funnels, and the events table)
    {
      dateRanges,
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 100,
    },
    // 2 — sign-ups by first-touch source bucket
    {
      dateRanges,
      dimensions: [{ name: "customEvent:source_bucket" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: eventNameFilter(["sign_up"]),
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    },
    // 3 — acquisition channels
    {
      dateRanges,
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }, { name: "keyEvents" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 12,
    },
    // 4 — top pages
    {
      dateRanges,
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    },
    // 5 — devices
    {
      dateRanges,
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    },
    // 6 — daily trend
    {
      dateRanges,
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }, { name: "keyEvents" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
      keepEmptyRows: true,
    },

    // ---- Main site (consentz.com WordPress) — all filtered to site=main ----
    // 7 — headline
    {
      dateRanges,
      metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }, { name: "sessions" }],
      dimensionFilter: SITE_MAIN,
    },
    // 8 — event counts (content_click / form_start / generate_lead / login_click)
    {
      dateRanges,
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: SITE_MAIN,
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 50,
    },
    // 9 — top blog posts by views
    {
      dateRanges,
      dimensions: [{ name: "customEvent:content_slug" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: andGroup(
        SITE_MAIN,
        eventNameFilter(["page_view"]),
        exactFilter("customEvent:content_type", "blog"),
      ),
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 10,
    },
    // 10 — top articles by views
    {
      dateRanges,
      dimensions: [{ name: "customEvent:content_slug" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: andGroup(
        SITE_MAIN,
        eventNameFilter(["page_view"]),
        exactFilter("customEvent:content_type", "article"),
      ),
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 10,
    },
    // 11 — top blog links clicked
    {
      dateRanges,
      dimensions: [{ name: "customEvent:link_text" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: andGroup(
        SITE_MAIN,
        eventNameFilter(["content_click"]),
        exactFilter("customEvent:content_type", "blog"),
      ),
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 10,
    },
    // 12 — top article links clicked
    {
      dateRanges,
      dimensions: [{ name: "customEvent:link_text" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: andGroup(
        SITE_MAIN,
        eventNameFilter(["content_click"]),
        exactFilter("customEvent:content_type", "article"),
      ),
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 10,
    },
    // 13 — lead funnel by form (form_start → generate_lead)
    {
      dateRanges,
      dimensions: [{ name: "customEvent:form_name" }, { name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: andGroup(SITE_MAIN, eventNameFilter(["form_start", "generate_lead"])),
      limit: 25,
    },
  ]

  const reports = await batchRunReports(requests)
  const [
    totals,
    events,
    bySource,
    channels,
    pages,
    devices,
    trend,
    msTotals,
    msEvents,
    msBlogViews,
    msArticleViews,
    msBlogClicks,
    msArticleClicks,
    msFunnel,
  ] = reports
  const counts = eventCounts(events)
  const msCounts = eventCounts(msEvents)
  const mainSiteLeads = msCounts.generate_lead ?? 0

  return {
    configured: true,
    range: { startDate: params.startDate, endDate: params.endDate },
    kpis: {
      sessions: scalar(totals, 0),
      users: scalar(totals, 1),
      pageViews: scalar(totals, 2),
      revenue: scalar(totals, 3),
      signUpStarts: counts.sign_up_start ?? 0,
      signUps: counts.sign_up ?? 0,
      // Both surfaces fire `generate_lead` — subtract the marketing-site ones
      // (book_demo / register) so this stays a patient-lead count.
      leads: Math.max(0, (counts.generate_lead ?? 0) - mainSiteLeads),
      enquiries: counts.enquiry_submitted ?? 0,
      bookings: (counts.booking_complete ?? 0) + (counts.call_booking_complete ?? 0),
      chats: counts.chat_open ?? 0,
    },
    signUpFunnel: FUNNEL_STAGES.map((s) => ({
      stage: s.event,
      label: s.label,
      count: counts[s.event] ?? 0,
    })),
    bookingFunnel: BOOKING_STAGES.map((s) => ({
      stage: s.event,
      label: s.label,
      count: counts[s.event] ?? 0,
    })),
    signUpsBySource: keyed(bySource).map((r) => ({
      label: sourceBucketLabel(r.key === "(not set)" ? null : r.key),
      value: r.value,
    })),
    channels: (channels?.rows ?? []).map((row) => ({
      channel: row.dimensionValues?.[0]?.value ?? "(not set)",
      sessions: Number(row.metricValues?.[0]?.value) || 0,
      keyEvents: Number(row.metricValues?.[1]?.value) || 0,
    })),
    topPages: keyed(pages).map((r) => ({ path: r.key, views: r.value })),
    devices: keyed(devices).map((r) => ({ label: r.key, value: r.value })),
    trend: (trend?.rows ?? []).map((row) => ({
      date: formatDateKey(row.dimensionValues?.[0]?.value ?? ""),
      sessions: Number(row.metricValues?.[0]?.value) || 0,
      keyEvents: Number(row.metricValues?.[1]?.value) || 0,
    })),
    events: (events?.rows ?? [])
      .map((row) => ({
        name: row.dimensionValues?.[0]?.value ?? "(not set)",
        count: Number(row.metricValues?.[0]?.value) || 0,
      }))
      .filter((e) => e.count > 0),
    mainSite: {
      pageViews: scalar(msTotals, 0),
      users: scalar(msTotals, 1),
      sessions: scalar(msTotals, 2),
      contentClicks: msCounts.content_click ?? 0,
      formStarts: msCounts.form_start ?? 0,
      leads: mainSiteLeads,
      logins: msCounts.login_click ?? 0,
      topBlogPosts: keyed(msBlogViews).map((r) => ({ label: r.key, value: r.value })),
      topArticles: keyed(msArticleViews).map((r) => ({ label: r.key, value: r.value })),
      topBlogClicks: keyed(msBlogClicks).map((r) => ({ label: r.key, value: r.value })),
      topArticleClicks: keyed(msArticleClicks).map((r) => ({ label: r.key, value: r.value })),
      leadFunnel: buildLeadFunnel(msFunnel),
    },
  }
}
