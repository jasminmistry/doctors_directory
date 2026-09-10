import { sourceBucketLabel } from "@/lib/attribution"
import {
  batchRunReports,
  getGa4Config,
  keyed,
  scalar,
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

function eventNameFilter(values: string[]) {
  return { filter: { fieldName: "eventName", inListFilter: { values } } }
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
  ]

  const reports = await batchRunReports(requests)
  const [totals, events, bySource, channels, pages, devices, trend] = reports
  const counts = eventCounts(events)

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
      leads: counts.generate_lead ?? 0,
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
  }
}
