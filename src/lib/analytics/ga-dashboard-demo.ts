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
  }
}
