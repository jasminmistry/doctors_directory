/**
 * Synthetic GA4 dashboard payload for demos — lets the `/admin/ga-analytics`
 * page render a realistic-looking dashboard before real GA4 credentials are
 * wired up (add `?demo=1` to the URL). Numbers are deterministic per date
 * range (seeded), so they don't jump around on refresh, and clearly labelled
 * as sample data in the UI.
 *
 * Not used unless the request explicitly asks for it — see
 * `src/app/api/admin/ga-analytics/route.ts`.
 */

import { APP_EVENT_AREAS, APP_EVENT_LABELS, buildAppAreas, keyActionTotal } from "@/lib/analytics/ga-app-dashboard"
import type { AppStats } from "@/lib/analytics/ga-app-dashboard"
import type { GaDashboard, GaDashboardParams } from "@/lib/analytics/ga-dashboard"

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const CHANNELS = [
  "Organic Search",
  "Direct",
  "Paid Search",
  "Organic Social",
  "Referral",
  "Email",
]

const TOP_PAGES = [
  "/directory/london",
  "/directory/search",
  "/directory/london/clinic/the-cosmetic-skin-clinic",
  "/directory/manchester",
  "/directory/treatments/botox",
  "/directory/london/practitioner/dr-sophie-shotter",
  "/directory/birmingham",
  "/directory/products",
  "/directory/london/clinic/eden-skin-clinic",
  "/directory/claim",
]

/** Rough per-active-user rates for each app event over the range (scaled by `days`). */
const APP_EVENT_RATES: Record<string, number> = {
  appointment_created: 0.9, appointment_updated: 0.5, appointment_moved: 0.25,
  appointment_status_changed: 0.6, appointment_completed: 0.55, appointment_deleted: 0.08,
  appointment_details_sent: 0.2, blocker_created: 0.06, waiting_list_added: 0.03,
  calendar_private_mode_toggled: 0.01, patient_created: 0.3, consultation_note_created: 0.4,
  treatment_note_created: 0.35, audio_note_created: 0.05, patient_note_created: 0.15,
  patient_form_created: 0.1, form_sent_to_patient: 0.22, patient_document_uploaded: 0.07,
  patient_photo_uploaded: 0.09, treatment_photo_uploaded: 0.12, correspondence_sent: 0.06,
  incident_reported: 0.004, treatment_note_template_created: 0.005, patient_data_exported: 0.003,
  patient_portal_invite_sent: 0.18, video_invite_sent: 0.04, invoice_created: 0.5,
  invoice_sent: 0.2, invoice_card_payment_started: 0.12, invoice_paid: 0.3,
  invoice_terminal_payment: 0.1, payment_link_click: 0.05, invoice_refunded: 0.01,
  credit_note_created: 0.006, voucher_created: 0.01, voucher_sent: 0.008, prepay_created: 0.02,
  membership_created: 0.015, membership_checkout_started: 0.01, membership_paid: 0.008,
  membership_cancelled: 0.002, begin_checkout: 0.012, purchase: 0.007, checkout_cancelled: 0.003,
  feature_purchased: 0.003, payment_card_added: 0.004, subscription_paid: 0.02,
  subscription_payment_retried: 0.002, direct_debit_setup_completed: 0.003, message_sent: 0.7,
  bulk_message_sent: 0.02, campaign_created: 0.008, campaign_status_changed: 0.01,
  survey_created: 0.002, lead_stage_changed: 0.08, lead_email_sent: 0.03, task_board_created: 0.002,
  task_created: 0.05, team_member_added: 0.006, location_created: 0.001, room_created: 0.002,
  treatment_created: 0.01, product_created: 0.008, stock_received: 0.01, form_template_created: 0.003,
  integration_connect: 0.002, custom_report_created: 0.002, custom_report_generated: 0.02,
  data_imported: 0.001, data_exported: 0.01, ai_chat_used: 0.06, ai_website_builder_used: 0.004,
  ai_onboarding_step: 0.01, calendar_slot_click: 2.2, calendar_appointment_click: 3.1,
  calendar_view_change: 1.1, calendar_navigate: 2.6,
}

function demoAppStats(days: number, rand: () => number): AppStats {
  const scale = days / 28
  const users = Math.round(1850 * Math.sqrt(scale) * (0.95 + rand() * 0.1))
  const sessions = Math.round(users * 6.4 * Math.sqrt(scale))
  const pageViews = Math.round(sessions * 9.2)
  const activeClinics = Math.round(users * 0.31)

  const counts: Record<string, number> = {}
  for (const name of APP_EVENT_AREAS.flatMap((a) => a.events.map(([n]) => n))) {
    counts[name] = Math.round(users * (APP_EVENT_RATES[name] ?? 0.01) * 6 * scale * (0.85 + rand() * 0.3))
  }
  counts.login = Math.round(sessions * 0.38)
  const signUps = Math.max(1, Math.round(42 * scale))
  counts.sign_up = signUps

  const areas = buildAppAreas(counts)
  const today = new Date()
  const trend: AppStats["trend"] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    const dow = d.getUTCDay()
    const weekend = dow === 0 ? 0.25 : dow === 6 ? 0.55 : 1
    const dayUsers = Math.round((users / Math.max(1, days ** 0.6)) * weekend * (0.85 + rand() * 0.3))
    trend.push({
      date: d.toISOString().slice(0, 10),
      users: dayUsers,
      keyEvents: Math.round(dayUsers * 1.4 * (0.8 + rand() * 0.4)),
    })
  }

  return {
    configured: true,
    users,
    sessions,
    pageViews,
    activeClinics,
    logins: counts.login,
    signUps,
    appointmentsCreated: counts.appointment_created,
    invoicesPaid: counts.invoice_paid + counts.invoice_terminal_payment,
    purchases: counts.purchase + counts.feature_purchased,
    keyActions: keyActionTotal(areas),
    areas,
    checkout: {
      begun: counts.begin_checkout,
      purchased: counts.purchase,
      cancelled: counts.checkout_cancelled,
    },
    signUpsBySource: [
      ["Consentz website", 0.41],
      ["Directory (claim → API)", 0.24],
      ["Direct", 0.17],
      ["Directory website", 0.1],
      ["Other website", 0.08],
    ].map(([label, share]) => ({ label: String(label), value: Math.round(signUps * Number(share)) })),
    signUpsByProgram: [
      ["Direct", 0.58],
      ["Directory", 0.24],
      ["Referral", 0.12],
      ["PartnerStack", 0.06],
    ].map(([label, share]) => ({ label: String(label), value: Math.round(signUps * Number(share)) })),
    topScreens: [
      "appointments_calendar",
      "clinics_dashboard",
      "patients_index",
      "patients_show",
      "patients_invoice_index",
      "admin_conversation_index",
      "patients_consultation_notes_index",
      "clinics_reports",
      "lead_board",
      "clinics_settings",
    ].map((label, i) => ({ label, value: Math.round(pageViews * (0.24 / (1 + i * 0.6))) })),
    calendarViews: [
      ["agendaWeek", 0.46],
      ["agendaDay", 0.34],
      ["month", 0.15],
      ["listWeek", 0.05],
    ].map(([label, share]) => ({ label: String(label), value: Math.round(counts.calendar_view_change * Number(share)) })),
    paymentLinks: [
      { label: "Stripe", value: Math.round(counts.payment_link_click * 0.72) },
      { label: "GoCardless", value: Math.round(counts.payment_link_click * 0.28) },
    ],
    roles: [
      ["Clinic User", 0.44],
      ["Clinic Admin", 0.3],
      ["Super Clinic Admin", 0.18],
      ["Clinic Receptionist", 0.08],
    ].map(([label, share]) => ({ label: String(label), value: Math.round(users * Number(share)) })),
    topClinics: [
      "Eden Skin Clinic (#1182)",
      "The Cosmetic Skin Clinic (#904)",
      "Clinic #2210",
      "Harley Aesthetics (#1517)",
      "Clinic #3051",
      "Clinic #788",
    ].map((label, i) => ({ label, value: Math.round(users * 3.2 * scale / (1 + i * 0.45)) })),
    trend,
    events: [
      { name: "page_view", count: pageViews },
      { name: "user_engagement", count: Math.round(sessions * 3.1) },
      { name: "session_start", count: sessions },
      ...Object.entries(counts).map(([name, count]) => ({ name, count })),
    ]
      .filter((e) => e.count > 0)
      .sort((a, b) => b.count - a.count)
      .map((e) => ({ ...e, label: APP_EVENT_LABELS[e.name] })),
  }
}

export function demoGaDashboard(params: GaDashboardParams & { days: number }): GaDashboard {
  const days = Math.max(1, Math.min(params.days || 28, 365))
  const rand = seededRandom(days * 7919 + 13)

  const today = new Date()
  const trend: GaDashboard["trend"] = []
  let sessions = 0
  let keyEvents = 0

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    const dow = d.getUTCDay()
    const weekend = dow === 0 || dow === 6 ? 0.62 : 1
    const growth = 1 + (days - i) / (days * 4) // gentle upward drift
    const base = 240 * growth
    const daySessions = Math.round((base + rand() * 130) * weekend)
    const dayKeyEvents = Math.round(daySessions * (0.05 + rand() * 0.045))
    trend.push({
      date: d.toISOString().slice(0, 10),
      sessions: daySessions,
      keyEvents: dayKeyEvents,
    })
    sessions += daySessions
    keyEvents += dayKeyEvents
  }

  const users = Math.round(sessions * 0.83)
  const pageViews = Math.round(sessions * 2.7)
  const perDay = sessions / days

  const signUpStarts = Math.round(perDay * days * 0.011)
  const signUps = Math.round(signUpStarts * 0.34)
  const leads = Math.round(perDay * days * 0.028)
  const enquiries = Math.round(perDay * days * 0.017)
  const bookings = Math.round(perDay * days * 0.014)
  const chats = Math.round(perDay * days * 0.019)
  const revenue = signUps * 99 + Math.round(leads * 0.3) * 55

  // Built as a standalone object (not an inline literal) so it satisfies the
  // GaDashboard["kpis"] shape without an excess-property check — `enquiries` is
  // present on branches that have the unclaimed-enquiry feature and harmless on
  // ones that don't.
  const kpis = {
    sessions,
    users,
    pageViews,
    signUpStarts,
    signUps,
    leads,
    enquiries,
    bookings,
    chats,
    revenue,
  }

  const signUpFunnel = [
    { stage: "sign_up_start", label: "Started", count: signUpStarts },
    { stage: "sign_up_otp_verified", label: "Email verified", count: Math.round(signUpStarts * 0.72) },
    { stage: "sign_up_plan_selected", label: "Plan selected", count: Math.round(signUpStarts * 0.46) },
    { stage: "sign_up", label: "Submitted", count: signUps },
    { stage: "sign_up_approved", label: "Approved", count: Math.round(signUps * 0.82) },
  ]

  const bookingFunnel = [
    { stage: "booking_start", label: "Started", count: Math.round(bookings / 0.34) },
    { stage: "booking_slot_select", label: "Slot selected", count: Math.round(bookings / 0.34 * 0.61) },
    { stage: "booking_complete", label: "Booked", count: bookings },
  ]

  const sourceWeights = [0.44, 0.24, 0.16, 0.1, 0.06]
  const signUpsBySource = ["Organic search", "Direct", "Paid", "Referral", "Social"].map(
    (label, i) => ({ label, value: Math.max(0, Math.round(signUps * (sourceWeights[i] ?? 0))) }),
  ).filter((s) => s.value > 0)

  const channelWeights = [0.46, 0.22, 0.14, 0.09, 0.06, 0.03]
  const channels = CHANNELS.map((channel, i) => {
    const s = Math.round(sessions * (channelWeights[i] ?? 0.02))
    return { channel, sessions: s, keyEvents: Math.round(s * (0.05 + rand() * 0.05)) }
  })

  const pageWeights = [0.19, 0.14, 0.09, 0.08, 0.07, 0.06, 0.05, 0.05, 0.04, 0.03]
  const topPages = TOP_PAGES.map((path, i) => ({
    path,
    views: Math.round(pageViews * (pageWeights[i] ?? 0.02)),
  }))

  const devices = [
    { label: "mobile", value: Math.round(sessions * 0.63) },
    { label: "desktop", value: Math.round(sessions * 0.32) },
    { label: "tablet", value: Math.round(sessions * 0.05) },
  ]

  // Marketing site (consentz.com) — a smaller, blog-heavy slice.
  const msPageViews = Math.round(pageViews * 0.22)
  const msDemoStarts = Math.round(perDay * days * 0.006)
  const msRegisterStarts = Math.round(perDay * days * 0.004)
  const mainSite = {
    pageViews: msPageViews,
    users: Math.round(msPageViews * 0.7),
    sessions: Math.round(msPageViews * 0.42),
    contentClicks: Math.round(msPageViews * 0.11),
    formStarts: msDemoStarts + msRegisterStarts,
    leads: Math.round((msDemoStarts + msRegisterStarts) * 0.38),
    logins: Math.round(perDay * days * 0.009),
    topBlogPosts: [
      "profhilo-vs-filler",
      "botox-aftercare-guide",
      "how-to-choose-a-clinic",
      "polynucleotides-explained",
      "skin-boosters-101",
    ].map((label, i) => ({ label, value: Math.round(msPageViews * (0.14 - i * 0.022)) })),
    topArticles: [
      "cqc-registration-for-clinics",
      "aesthetics-marketing-2026",
      "patient-retention-playbook",
    ].map((label, i) => ({ label, value: Math.round(msPageViews * (0.06 - i * 0.014)) })),
    topBlogClicks: [
      "Book a consultation",
      "Read the full guide",
      "See treatment prices",
    ].map((label, i) => ({ label, value: Math.round(msPageViews * (0.04 - i * 0.01)) })),
    topArticleClicks: [
      "Get a demo",
      "Download the checklist",
    ].map((label, i) => ({ label, value: Math.round(msPageViews * (0.02 - i * 0.006)) })),
    leadFunnel: [
      { formName: "book_demo", label: "Book a demo", starts: msDemoStarts, leads: Math.round(msDemoStarts * 0.4) },
      { formName: "register", label: "Register", starts: msRegisterStarts, leads: Math.round(msRegisterStarts * 0.34) },
    ],
  }

  const span = leads + signUpStarts
  const events = [
    { name: "page_view", count: pageViews },
    { name: "user_engagement", count: Math.round(sessions * 2.1) },
    { name: "session_start", count: Math.round(sessions * 1.02) },
    { name: "scroll", count: Math.round(sessions * 0.54) },
    { name: "first_visit", count: Math.round(users * 0.46) },
    { name: "search", count: Math.round(sessions * 0.14) },
    { name: "cta_click", count: Math.round(sessions * 0.09) },
    { name: "form_start", count: Math.round(span * 1.7) },
    { name: "form_submit", count: Math.round((signUps + leads) * 1.15) },
    { name: "generate_lead", count: leads },
    { name: "lead_submitted", count: leads },
    { name: "enquiry_submitted", count: enquiries },
    { name: "sms_notification_sent", count: Math.round((leads + enquiries) * 0.9) },
    { name: "sms_notification_delivered", count: Math.round((leads + enquiries) * 0.85) },
    { name: "sms_notification_read", count: Math.round((leads + enquiries) * 0.4) },
    { name: "chat_open", count: chats },
    { name: "chat_message_sent", count: Math.round(chats * 3.3) },
    { name: "sign_up_start", count: signUpFunnel[0].count },
    { name: "sign_up_otp_verified", count: signUpFunnel[1].count },
    { name: "sign_up_plan_selected", count: signUpFunnel[2].count },
    { name: "sign_up", count: signUps },
    { name: "sign_up_approved", count: signUpFunnel[4].count },
    { name: "booking_start", count: bookingFunnel[0].count },
    { name: "booking_slot_select", count: bookingFunnel[1].count },
    { name: "booking_complete", count: bookings },
    { name: "call_booking_start", count: Math.round(bookings * 0.55) },
    { name: "call_booking_complete", count: Math.round(bookings * 0.22) },
    { name: "purchase", count: Math.round(signUps * 0.5 + leads * 0.3) },
  ]
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count)

  return {
    configured: true,
    range: { startDate: params.startDate, endDate: params.endDate },
    kpis,
    signUpFunnel,
    bookingFunnel,
    signUpsBySource,
    channels,
    topPages,
    devices,
    trend,
    events,
    mainSite,
    app: demoAppStats(days, rand),
  }
}
