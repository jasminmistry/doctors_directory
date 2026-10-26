import {
  batchRunReports,
  getGa4AppConfig,
  keyed,
  scalar,
  type GaFilterExpression,
  type GaReport,
  type GaReportRequest,
} from "@/lib/analytics/ga-data-api"
import { prisma } from "@/lib/db"

/**
 * Consentz app (control.consentz.com — the ConsentzLive codebase) section of the
 * admin GA4 report. Reads the app's own GA4 property (`GA4_APP_PROPERTY_ID`,
 * measurement ID G-HBK6JB62H4), not the directory/marketing one.
 *
 * Event names come from ConsentzLive's `AnalyticsEventSubscriber::ROUTE_EVENTS`
 * and `templates/_analytics.html.twig` (documented in its
 * `docs/system-overview/workflows/google_analytics.md`). Keep `APP_EVENT_AREAS`
 * in step with that file when events are added there.
 */

export interface NamedValue {
  label: string
  value: number
}

export interface AppEventCount {
  name: string
  label: string
  count: number
}

export interface AppArea {
  area: string
  label: string
  total: number
  events: AppEventCount[]
}

export interface AppStats {
  configured: boolean
  /** Set when the app property failed but the rest of the dashboard loaded. */
  error?: string
  users: number
  sessions: number
  pageViews: number
  activeClinics: number
  logins: number
  signUps: number
  appointmentsCreated: number
  invoicesPaid: number
  purchases: number
  /** Sum of every tracked key action (excludes plain calendar clicks, login and sign-up). */
  keyActions: number
  areas: AppArea[]
  checkout: { begun: number; purchased: number; cancelled: number }
  signUpsBySource: NamedValue[]
  signUpsByProgram: NamedValue[]
  topScreens: NamedValue[]
  calendarViews: NamedValue[]
  paymentLinks: NamedValue[]
  roles: NamedValue[]
  topClinics: NamedValue[]
  trend: { date: string; users: number; keyEvents: number }[]
  /** Every event GA4 recorded on the app property, highest count first. `label` for our own events. */
  events: { name: string; count: number; label?: string }[]
}

/** Areas of the app, each with the GA events counted under it, in display order. */
export const APP_EVENT_AREAS: { area: string; label: string; events: [string, string][] }[] = [
  {
    area: "appointments",
    label: "Appointments",
    events: [
      ["appointment_created", "Appointments booked"],
      ["appointment_updated", "Appointments edited"],
      ["appointment_moved", "Appointments moved (drag & drop)"],
      ["appointment_status_changed", "Status changed"],
      ["appointment_completed", "Appointments completed"],
      ["appointment_deleted", "Appointments deleted"],
      ["appointment_details_sent", "Details sent to patient"],
      ["blocker_created", "Diary blockers added"],
      ["waiting_list_added", "Waiting-list entries"],
      ["calendar_private_mode_toggled", "Private mode toggled"],
    ],
  },
  {
    area: "patients",
    label: "Patients & clinical notes",
    events: [
      ["patient_created", "Patients added"],
      ["consultation_note_created", "Consultation notes"],
      ["treatment_note_created", "Treatment notes"],
      ["audio_note_created", "Audio notes"],
      ["patient_note_created", "Patient notes"],
      ["patient_form_created", "Patient forms"],
      ["form_sent_to_patient", "Forms sent to patients"],
      ["patient_document_uploaded", "Documents uploaded"],
      ["patient_photo_uploaded", "Patient photos"],
      ["treatment_photo_uploaded", "Treatment photos"],
      ["correspondence_sent", "Correspondence sent"],
      ["incident_reported", "Incidents reported"],
      ["treatment_note_template_created", "Note templates created"],
      ["patient_data_exported", "Patient data exports"],
    ],
  },
  {
    area: "invites",
    label: "Patient invites",
    events: [
      ["patient_portal_invite_sent", "Patient portal invites"],
      ["video_invite_sent", "Video call invites"],
    ],
  },
  {
    area: "payments",
    label: "Invoices & patient payments",
    events: [
      ["invoice_created", "Invoices created"],
      ["invoice_sent", "Invoices sent"],
      ["invoice_card_payment_started", "Card payments started"],
      ["invoice_paid", "Invoices paid"],
      ["invoice_terminal_payment", "Card-terminal payments"],
      ["payment_link_click", "Payment links clicked"],
      ["invoice_refunded", "Refunds"],
      ["credit_note_created", "Credit notes"],
      ["voucher_created", "Vouchers created"],
      ["voucher_sent", "Vouchers sent"],
      ["prepay_created", "Prepayments"],
      ["membership_created", "Memberships created"],
      ["membership_checkout_started", "Membership checkouts started"],
      ["membership_paid", "Memberships paid"],
      ["membership_cancelled", "Memberships cancelled"],
    ],
  },
  {
    area: "purchases",
    label: "Consentz purchases & billing",
    events: [
      ["begin_checkout", "Checkouts started"],
      ["purchase", "Plans / numbers purchased"],
      ["checkout_cancelled", "Checkouts cancelled"],
      ["feature_purchased", "Features purchased"],
      ["payment_card_added", "Payment cards added"],
      ["subscription_paid", "Subscription payments"],
      ["subscription_payment_retried", "Failed payments retried"],
      ["direct_debit_setup_completed", "Direct debits set up"],
    ],
  },
  {
    area: "messaging",
    label: "Messaging, marketing & leads",
    events: [
      ["message_sent", "Messages sent"],
      ["bulk_message_sent", "Bulk messages"],
      ["campaign_created", "Campaigns created"],
      ["campaign_status_changed", "Campaign status changes"],
      ["survey_created", "Surveys created"],
      ["lead_stage_changed", "Lead stage moves"],
      ["lead_email_sent", "Lead emails sent"],
      ["task_board_created", "Task boards created"],
      ["task_created", "Tasks created"],
    ],
  },
  {
    area: "setup",
    label: "Clinic setup & integrations",
    events: [
      ["team_member_added", "Team members added"],
      ["location_created", "Locations added"],
      ["room_created", "Rooms added"],
      ["treatment_created", "Treatments added"],
      ["product_created", "Products added"],
      ["stock_received", "Stock received"],
      ["form_template_created", "Form templates created"],
      ["integration_connect", "Integrations connected (Stripe / Xero / Zoom)"],
    ],
  },
  {
    area: "data",
    label: "Reports, imports & AI",
    events: [
      ["custom_report_created", "Custom reports created"],
      ["custom_report_generated", "Custom reports run"],
      ["data_imported", "Data imports"],
      ["data_exported", "Data exports"],
      ["ai_chat_used", "AI chat used"],
      ["ai_website_builder_used", "AI website builder used"],
      ["ai_onboarding_step", "AI onboarding steps"],
    ],
  },
  {
    area: "calendar",
    label: "Calendar usage (clicks)",
    events: [
      ["calendar_slot_click", "Empty slots clicked"],
      ["calendar_appointment_click", "Appointments opened"],
      ["calendar_view_change", "View switched (day / week / month)"],
      ["calendar_navigate", "Prev / next / today"],
    ],
  },
]

/** Areas that are clicks rather than completed actions — left out of `keyActions`. */
const NON_ACTION_AREAS = new Set(["calendar"])

export const APP_EVENT_LABELS: Record<string, string> = Object.fromEntries([
  ["login", "Clinic user logged in"],
  ["sign_up", "New clinic signed up (web or via the directory)"],
  ...APP_EVENT_AREAS.flatMap((a) => a.events),
])

const SIGNUP_SOURCE_LABELS: Record<string, string> = {
  consentz_website: "Consentz website",
  directory_website: "Directory website",
  directory_api: "Directory (claim → API)",
  external_site: "Other website",
  direct: "Direct",
}

function eventNameFilter(values: string[]): GaFilterExpression {
  return { filter: { fieldName: "eventName", inListFilter: { values } } }
}

function andGroup(...expressions: GaFilterExpression[]): GaFilterExpression {
  return { andGroup: { expressions } }
}

/** Drops rows where a user-scoped dimension was never set (logged-out pages). */
function isSet(fieldName: string): GaFilterExpression {
  return { notExpression: { filter: { fieldName, inListFilter: { values: ["", "(not set)"] } } } }
}

function eventCounts(report: GaReport | undefined): Record<string, number> {
  const out: Record<string, number> = {}
  for (const row of report?.rows ?? []) {
    const name = row.dimensionValues?.[0]?.value
    if (name) out[name] = Number(row.metricValues?.[0]?.value) || 0
  }
  return out
}

function formatDateKey(ga4Date: string): string {
  if (/^\d{8}$/.test(ga4Date)) {
    return `${ga4Date.slice(0, 4)}-${ga4Date.slice(4, 6)}-${ga4Date.slice(6, 8)}`
  }
  return ga4Date
}

/** Page paths on the app are `/<route_name>` (no real URLs are sent) — show the route name. */
function routeLabel(path: string): string {
  return path.replace(/^\//, "") || "(home)"
}

function roleLabel(role: string): string {
  return role
    .replace(/^ROLE_/, "")
    .toLowerCase()
    .split("_")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ")
}

export function buildAppAreas(counts: Record<string, number>): AppArea[] {
  return APP_EVENT_AREAS.map((a) => {
    const events = a.events.map(([name, label]) => ({ name, label, count: counts[name] ?? 0 }))
    return {
      area: a.area,
      label: a.label,
      total: events.reduce((sum, e) => sum + e.count, 0),
      events,
    }
  })
}

export function keyActionTotal(areas: AppArea[]): number {
  return areas.filter((a) => !NON_ACTION_AREAS.has(a.area)).reduce((sum, a) => sum + a.total, 0)
}

export function emptyAppStats(configured: boolean, error?: string): AppStats {
  return {
    configured,
    ...(error ? { error } : {}),
    users: 0,
    sessions: 0,
    pageViews: 0,
    activeClinics: 0,
    logins: 0,
    signUps: 0,
    appointmentsCreated: 0,
    invoicesPaid: 0,
    purchases: 0,
    keyActions: 0,
    areas: buildAppAreas({}),
    checkout: { begun: 0, purchased: 0, cancelled: 0 },
    signUpsBySource: [],
    signUpsByProgram: [],
    topScreens: [],
    calendarViews: [],
    paymentLinks: [],
    roles: [],
    topClinics: [],
    trend: [],
    events: [],
  }
}

/**
 * GA only has the app's numeric clinic ID. Directory clinics linked to Core carry the
 * same ID in `coreClinicId`, so show their name where we have one.
 */
async function clinicLabels(ids: string[]): Promise<Record<string, string>> {
  const numeric = ids.map(Number).filter((n) => Number.isInteger(n) && n > 0)
  if (numeric.length === 0) return {}
  try {
    const rows = await prisma.clinic.findMany({
      where: { coreClinicId: { in: numeric } },
      select: { coreClinicId: true, name: true },
    })
    return Object.fromEntries(
      rows.filter((r) => r.name).map((r) => [String(r.coreClinicId), `${r.name} (#${r.coreClinicId})`]),
    )
  } catch (error) {
    console.error("[ga-app-dashboard] clinic name lookup failed:", error)
    return {}
  }
}

export async function getAppStats(params: { startDate: string; endDate: string }): Promise<AppStats> {
  const config = getGa4AppConfig()
  if (!config) return emptyAppStats(false)

  const dateRanges = [{ startDate: params.startDate, endDate: params.endDate }]

  const requests: GaReportRequest[] = [
    // 0 — headline totals
    {
      dateRanges,
      metrics: [{ name: "totalUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
    },
    // 1 — every event's count (feeds KPIs, areas and the events table)
    {
      dateRanges,
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 200,
    },
    // 2 — sign-ups by source (consentz_website / directory_website / directory_api / …)
    {
      dateRanges,
      dimensions: [{ name: "customEvent:signup_source" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: eventNameFilter(["sign_up"]),
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    },
    // 3 — sign-ups by program (Direct / Referral / PartnerStack / Directory)
    {
      dateRanges,
      dimensions: [{ name: "customEvent:signup_program" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: eventNameFilter(["sign_up"]),
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    },
    // 4 — most-used screens (page path = /<route_name>)
    {
      dateRanges,
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 12,
    },
    // 5 — calendar views switched to
    {
      dateRanges,
      dimensions: [{ name: "customEvent:calendar_view" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: eventNameFilter(["calendar_view_change"]),
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 10,
    },
    // 6 — payment-link clicks by provider
    {
      dateRanges,
      dimensions: [{ name: "customEvent:link_provider" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: eventNameFilter(["payment_link_click"]),
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    },
    // 7 — users by role
    {
      dateRanges,
      dimensions: [{ name: "customUser:user_role" }],
      metrics: [{ name: "totalUsers" }],
      dimensionFilter: isSet("customUser:user_role"),
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 10,
    },
    // 8 — most active clinics; rowCount = number of clinics active in range
    {
      dateRanges,
      dimensions: [{ name: "customUser:clinic_id" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: andGroup(
        isSet("customUser:clinic_id"),
        { notExpression: eventNameFilter(["page_view", "user_engagement", "session_start", "first_visit", "scroll"]) },
      ),
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 10,
    },
    // 9 — daily trend
    {
      dateRanges,
      dimensions: [{ name: "date" }],
      metrics: [{ name: "totalUsers" }, { name: "keyEvents" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
      keepEmptyRows: true,
    },
  ]

  const [totals, events, bySource, byProgram, screens, calViews, payLinks, roles, clinics, trend] =
    await batchRunReports(requests, config)
  const counts = eventCounts(events)
  const areas = buildAppAreas(counts)
  const topClinicRows = keyed(clinics)
  const names = await clinicLabels(topClinicRows.map((r) => r.key))

  return {
    configured: true,
    users: scalar(totals, 0),
    sessions: scalar(totals, 1),
    pageViews: scalar(totals, 2),
    activeClinics: clinics?.rowCount ?? 0,
    logins: counts.login ?? 0,
    signUps: counts.sign_up ?? 0,
    appointmentsCreated: counts.appointment_created ?? 0,
    invoicesPaid: (counts.invoice_paid ?? 0) + (counts.invoice_terminal_payment ?? 0),
    purchases: (counts.purchase ?? 0) + (counts.feature_purchased ?? 0),
    keyActions: keyActionTotal(areas),
    areas,
    checkout: {
      begun: counts.begin_checkout ?? 0,
      purchased: counts.purchase ?? 0,
      cancelled: counts.checkout_cancelled ?? 0,
    },
    signUpsBySource: keyed(bySource).map((r) => ({
      label: SIGNUP_SOURCE_LABELS[r.key] ?? r.key,
      value: r.value,
    })),
    signUpsByProgram: keyed(byProgram).map((r) => ({ label: r.key, value: r.value })),
    topScreens: keyed(screens).map((r) => ({ label: routeLabel(r.key), value: r.value })),
    calendarViews: keyed(calViews).map((r) => ({ label: r.key, value: r.value })),
    paymentLinks: keyed(payLinks).map((r) => ({
      label: r.key === "gocardless" ? "GoCardless" : r.key === "stripe" ? "Stripe" : r.key,
      value: r.value,
    })),
    roles: keyed(roles).map((r) => ({ label: roleLabel(r.key), value: r.value })),
    topClinics: topClinicRows.map((r) => ({ label: names[r.key] ?? `Clinic #${r.key}`, value: r.value })),
    trend: (trend?.rows ?? []).map((row) => ({
      date: formatDateKey(row.dimensionValues?.[0]?.value ?? ""),
      users: Number(row.metricValues?.[0]?.value) || 0,
      keyEvents: Number(row.metricValues?.[1]?.value) || 0,
    })),
    events: (events?.rows ?? [])
      .map((row) => ({
        name: row.dimensionValues?.[0]?.value ?? "(not set)",
        count: Number(row.metricValues?.[0]?.value) || 0,
      }))
      .filter((e) => e.count > 0)
      .map((e) => ({ ...e, label: APP_EVENT_LABELS[e.name] })),
  }
}
