"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { IconInfoCircle } from "@tabler/icons-react"

import { AdminLayout } from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NamedValue {
  label: string
  value: number
}

interface GaDashboardResponse {
  configured: boolean
  demo?: boolean
  message?: string
  error?: string
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
  events: { name: string; count: number }[]
  mainSite: {
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
}

type Range = "7d" | "28d" | "90d"
const RANGES: { value: Range; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "28d", label: "28 days" },
  { value: "90d", label: "90 days" },
]

function apiBase(): string {
  if (typeof window === "undefined") return "/directory"
  return window.location.pathname.startsWith("/directory") ? "/directory" : ""
}

function parseRange(value: string | null): Range {
  return value === "7d" || value === "90d" ? value : "28d"
}

function nf(n: number): string {
  return n.toLocaleString("en-GB")
}

const EVENT_DESCRIPTIONS: Record<string, string> = {
  cta_click: "Someone clicked a button to get in touch — like Book Now, Contact, or opening a request/consultation form.",
  search: "Someone used the search bar or filters to find a treatment, clinic, or practitioner.",
  form_start: "Someone started filling in a form — a consultation request, a quick enquiry, a claim/registration form, or a form on the main website.",
  form_submit: "Someone finished and submitted a consultation request or quick enquiry form.",
  generate_lead: "Someone sent a full enquiry — either a patient's consultation request on a clinic page, or a demo/registration request on the main website.",
  enquiry_submitted: "A patient sent a quick enquiry to a clinic that hasn't been claimed yet.",
  sign_up_start: "A clinic or practitioner started claiming their listing.",
  sign_up_otp_verified: "A clinic or practitioner verified their email while claiming their listing.",
  sign_up_plan_selected: "A clinic or practitioner picked a pricing plan while claiming their listing.",
  sign_up: "A clinic or practitioner submitted their claim/registration, still waiting for approval.",
  sign_up_approved: "An admin approved a clinic or practitioner's claim/registration.",
  chat_open: "A patient opened the chat box on a clinic or practitioner page.",
  chat_message_sent: "A patient sent a message in the chat box.",
  booking_start: "Someone opened the appointment or event booking form.",
  booking_slot_select: "Someone picked an available appointment time.",
  booking_complete: "Someone successfully booked an appointment.",
  call_booking_start: "Someone opened the video call booking form.",
  call_booking_complete: "Someone successfully booked a video call appointment.",
  purchase: "Money changed hands — a clinic paid to unlock a lead, paid a booking deposit, or started a paid subscription.",
  sms_notification_sent: "A text message was sent to a clinic to let them know about a new lead.",
  sms_notification_delivered: "A text message about a new lead was delivered to a clinic's phone.",
  sms_notification_read: "A clinic tapped the link in a text message about a new lead.",
  content_click: "Someone clicked a link inside a blog post or article on the main website.",
  login_click: "Someone clicked a login link on the main website.",
  page_view: "Someone opened a page on the site.",
  click: "Someone clicked something on a page. Tracked automatically by Google, not something we set up ourselves.",
  scroll: "Someone scrolled down a page. Tracked automatically by Google, not something we set up ourselves.",
  session_start: "Someone started a new visit to the site. Tracked automatically by Google, not something we set up ourselves.",
  first_visit: "Someone visited the site for the very first time. Tracked automatically by Google, not something we set up ourselves.",
  user_engagement: "Someone spent active time on the site. Tracked automatically by Google, not something we set up ourselves.",
}

function eventDescription(name: string): string {
  return EVENT_DESCRIPTIONS[name] ?? "A standard action Google Analytics tracks automatically, not something we specifically set up."
}

function Bar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0
  return (
    <div className="h-2 flex-1 rounded bg-gray-100">
      <div className={`h-2 rounded ${className ?? "bg-blue-500"}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function InfoTooltip({ label, text }: { label: string; text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label={`What does "${label}" mean?`} className="shrink-0 text-gray-400 hover:text-gray-600">
          <IconInfoCircle className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  )
}

function ListCard({
  title,
  items,
  formatValue = nf,
  tooltip,
}: {
  title: string
  items: NamedValue[]
  formatValue?: (n: number) => string
  tooltip?: string
}) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-1.5 text-sm font-medium text-gray-700">
        {title}
        {tooltip && <InfoTooltip label={title} text={tooltip} />}
      </div>
      <div className="space-y-2">
        {items.length === 0 && <div className="text-sm text-gray-500">No data yet</div>}
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 flex-1 truncate text-gray-600" title={item.label}>
                {item.label || "(not set)"}
              </span>
              <span className="font-medium tabular-nums">{formatValue(item.value)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Bar value={item.value} max={max} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function GaAnalyticsDashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const range = useMemo(() => parseRange(searchParams.get("range")), [searchParams])
  const demo = searchParams.get("demo") === "1"
  const [data, setData] = useState<GaDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setRange = useCallback(
    (next: Range) => {
      const sp = new URLSearchParams(searchParams.toString())
      sp.set("range", next)
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${apiBase()}/api/admin/ga-analytics/?range=${range}${demo ? "&demo=1" : ""}`,
        )
        const body = (await res.json()) as GaDashboardResponse
        if (cancelled) return
        if (!res.ok) {
          setError(body.error || `HTTP ${res.status}`)
          setData(null)
          return
        }
        setData(body)
      } catch {
        if (!cancelled) {
          setError("Failed to reach GA4")
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [range, demo])

  const funnelMax = Math.max(1, ...(data?.signUpFunnel ?? []).map((s) => s.count))
  const bookingFunnelMax = Math.max(1, ...(data?.bookingFunnel ?? []).map((s) => s.count))
  const sourceMax = Math.max(1, ...(data?.signUpsBySource ?? []).map((s) => s.value))
  const trendMax = Math.max(1, ...(data?.trend ?? []).flatMap((t) => [t.sessions, t.keyEvents]))
  const channelMax = Math.max(1, ...(data?.channels ?? []).map((c) => c.sessions))

  return (
    <TooltipProvider>
    <AdminLayout title="GA4 analytics">
      <div className="space-y-6">
        {data?.demo && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-900">
            <p className="font-medium">Sample data — for demonstration only</p>
            <p className="mt-1">
              These numbers are synthetic and illustrate the dashboard layout before GA4 is
              connected. Remove <code>?demo=1</code> from the URL to see the real (or
              not-yet-connected) state.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="max-w-2xl text-sm text-gray-600">
            Live numbers from Google Analytics. We're also still running the older{" "}
            <Link href="/admin/tracking" className="underline">
              Directory tracking
            </Link>{" "}
            dashboard alongside this one for a few days, to check the numbers match up before we retire it.
          </p>
          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-sm text-blue-700 underline"
          >
            Open in GA4 ↗
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Date range:</span>
          {RANGES.map((r) => (
            <Button
              key={r.value}
              type="button"
              variant={range === r.value ? "default" : "outline"}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>

        {data && !data.configured && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-medium">GA4 is not connected yet</p>
            <p className="mt-1">
              {data.message ??
                "Set GA4_PROPERTY_ID and GA4_SA_CREDENTIALS (or reuse GSC_SERVICE_ACCOUNT_CREDENTIALS), then grant the service account Viewer on the GA4 property."}
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {loading && <div className="text-sm text-gray-500">Loading…</div>}

        {data?.configured && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {([
                ["Sessions", nf(data.kpis.sessions), "How many visits there were to the website(s) in this date range. One person visiting twice counts as two sessions."],
                ["Users", nf(data.kpis.users), "How many different people visited the website(s) in this date range."],
                ["Page views", nf(data.kpis.pageViews), "How many pages were opened in total across the whole website (directory + main site). This is a bigger number than the \"Page Views\" shown on a single clinic's page, which only counts that one page."],
                ["Business sign-ups", nf(data.kpis.signUps), "How many clinics or practitioners finished claiming their listing."],
                ["Sign-up starts", nf(data.kpis.signUpStarts), "How many clinics or practitioners started claiming their listing, whether or not they finished."],
                ["Patient leads", nf(data.kpis.leads), "How many patients asked a clinic about a consultation or pricing (not counting clinics signing up to the site themselves)."],
                ["Unclaimed enquiries", nf(data.kpis.enquiries), "How many people filled in the short enquiry form shown on a clinic page that hasn't been claimed yet."],
                ["Bookings", nf(data.kpis.bookings), "How many appointments were booked, in person or by video call."],
                ["Consultation chats", nf(data.kpis.chats), "How many times a patient opened the chat box to talk to a clinic."],
                ["Revenue", `£${nf(Math.round(data.kpis.revenue))}`, "Total money taken through the website in this date range."],
              ] as [string, string, string][]).map(([label, value, tooltip]) => (
                <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-1 text-xs uppercase text-gray-600">
                    {label}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" aria-label={`What does "${label}" measure?`} className="shrink-0 normal-case text-gray-400 hover:text-gray-600">
                          <IconInfoCircle className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{tooltip}</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                All events
                <InfoTooltip
                  label="All events"
                  text="Every action Google Analytics recorded on the site in this date range."
                />
              </div>
              <p className="mb-3 text-xs text-gray-500">
                Hover the (i) next to each event name below to see what it means.
              </p>
              <div className="max-h-[420px] overflow-y-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="sticky top-0 bg-white text-xs uppercase text-gray-500">
                    <tr>
                      <th className="py-2 pr-4">Event</th>
                      <th className="py-2 pr-4 text-right">Count</th>
                      <th className="w-1/3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {(data.events?.length ?? 0) === 0 && (
                      <tr>
                        <td colSpan={3} className="py-3 text-gray-500">
                          No events recorded yet
                        </td>
                      </tr>
                    )}
                    {(data.events ?? []).map((ev) => (
                      <tr key={ev.name} className="border-t border-gray-100">
                        <td className="py-2 pr-4">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" aria-label={`What does "${ev.name}" mean?`} className="inline-flex items-center gap-1 font-mono text-xs">
                                {ev.name} <IconInfoCircle className="h-3 w-3 shrink-0 text-gray-400" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>{eventDescription(ev.name)}</TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="py-2 pr-4 text-right tabular-nums">{nf(ev.count)}</td>
                        <td className="py-2">
                          <Bar
                            value={ev.count}
                            max={Math.max(1, ...(data.events ?? []).map((e) => e.count))}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  Business sign-up funnel
                  <InfoTooltip
                    label="Business sign-up funnel"
                    text="How many people moved through each step of a clinic or practitioner signing up — from starting the process to being approved by us. The percentage shows how many made it from one step to the next."
                  />
                </div>
                <div className="space-y-3">
                  {data.signUpFunnel.map((stage, i) => {
                    const prev = i > 0 ? data.signUpFunnel[i - 1].count : stage.count
                    const rate = prev > 0 ? Math.round((stage.count / prev) * 100) : 0
                    return (
                      <div key={stage.stage} className="space-y-1">
                        <div className="flex items-baseline justify-between text-sm">
                          <span className="text-gray-600">
                            {stage.label}
                            {i > 0 && (
                              <span className="ml-2 text-xs text-gray-400">{rate}% of previous</span>
                            )}
                          </span>
                          <span className="font-medium tabular-nums">{nf(stage.count)}</span>
                        </div>
                        <Bar value={stage.count} max={funnelMax} className="bg-gray-900" />
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  Business sign-ups by source
                  <InfoTooltip
                    label="Business sign-ups by source"
                    text="Where clinics/practitioners came from before they signed up — the very first place they arrived from."
                  />
                </div>
                <p className="mb-3 text-xs text-gray-500">
                  Where clinics/practitioners came from before they signed up (the very first place they
                  arrived from, e.g. Google search, a social link, or a direct visit).
                </p>
                <div className="space-y-2">
                  {data.signUpsBySource.length === 0 && (
                    <div className="text-sm text-gray-500">No sign-ups in this range yet</div>
                  )}
                  {data.signUpsBySource.map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium tabular-nums">{nf(item.value)}</span>
                      </div>
                      <Bar value={item.value} max={sourceMax} className="bg-blue-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                Booking funnel
                <InfoTooltip
                  label="Booking funnel"
                  text="How many people started booking an appointment and how many actually completed it."
                />
              </div>
              <p className="mb-3 text-xs text-gray-500">
                How many people started booking an appointment (in person or by video call) and how many
                went on to actually complete the booking.
              </p>
              <div className="space-y-3">
                {data.bookingFunnel.map((stage, i) => {
                  const prev = i > 0 ? data.bookingFunnel[i - 1].count : stage.count
                  const rate = prev > 0 ? Math.round((stage.count / prev) * 100) : 0
                  return (
                    <div key={stage.stage} className="space-y-1">
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="text-gray-600">
                          {stage.label}
                          {i > 0 && <span className="ml-2 text-xs text-gray-400">{rate}% of previous</span>}
                        </span>
                        <span className="font-medium tabular-nums">{nf(stage.count)}</span>
                      </div>
                      <Bar value={stage.count} max={bookingFunnelMax} className="bg-gray-900" />
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                Where visitors come from
                <InfoTooltip
                  label="Where visitors come from"
                  text="How visitors found the site — a Google search, a link, a social post — and how many went on to do something important, like sign up or send a lead."
                />
              </div>
              <p className="mb-3 text-xs text-gray-500">
                How visitors found the site (e.g. a Google search, a link, a social post) and how many of
                them went on to do something important, like sign up or send a lead.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase text-gray-500">
                    <tr>
                      <th className="py-2 pr-4">Channel</th>
                      <th className="py-2 pr-4 text-right">Visits</th>
                      <th className="py-2 text-right">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" aria-label="What are key events?" className="inline-flex items-center gap-1">
                              Results <IconInfoCircle className="h-3 w-3 text-gray-400" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Important actions from that channel's visitors — like signing up, booking, or sending a lead.</TooltipContent>
                        </Tooltip>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.channels.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-3 text-gray-500">
                          No data yet
                        </td>
                      </tr>
                    )}
                    {data.channels.map((c) => (
                      <tr key={c.channel} className="border-t border-gray-100">
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-1.5 rounded bg-blue-500"
                              style={{
                                width: `${Math.max(6, Math.round((c.sessions / channelMax) * 80))}px`,
                              }}
                            />
                            {c.channel || "(not set)"}
                          </div>
                        </td>
                        <td className="py-2 pr-4 text-right tabular-nums">{nf(c.sessions)}</td>
                        <td className="py-2 text-right tabular-nums">{nf(c.keyEvents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                Daily trend
                <InfoTooltip
                  label="Daily trend"
                  text="Visits per day, compared with how many of those visits led to an important action like a sign-up or a lead."
                />
              </div>
              <p className="mb-3 text-xs text-gray-500">
                Visits per day compared with how many of those visits led to an important action (like a
                sign-up or a lead).
              </p>
              <div className="max-h-[360px] space-y-2 overflow-y-auto">
                {data.trend.length === 0 && <div className="text-sm text-gray-500">No data yet</div>}
                {data.trend.map((point) => (
                  <div key={point.date} className="space-y-1">
                    <div className="text-xs text-gray-500">{point.date}</div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-xs text-gray-500">Sessions</span>
                      <Bar value={point.sessions} max={trendMax} />
                      <span className="w-10 text-right text-xs tabular-nums">{point.sessions}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-xs text-gray-500">Results</span>
                      <Bar value={point.keyEvents} max={trendMax} className="bg-emerald-500" />
                      <span className="w-10 text-right text-xs tabular-nums">{point.keyEvents}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ListCard
                title="Top pages (by views)"
                items={data.topPages.map((p) => ({ label: p.path, value: p.views }))}
                tooltip="The pages on the site that got the most views, ranked from most to least, across the whole property."
              />
              <ListCard
                title="Devices"
                items={data.devices}
                tooltip="What kind of device visitors used to browse the site — phone, computer, or tablet."
              />
            </div>

            {data.mainSite && (
              <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                    Main site (consentz.com)
                    <InfoTooltip
                      label="Main site (consentz.com)"
                      text="Everything in this section is activity on our main marketing website, consentz.com — separate from the clinic directory figures above."
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Activity on our main marketing website (consentz.com) — separate from the clinic
                    directory figures above.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                  {([
                    ["Page views", nf(data.mainSite.pageViews), "How many pages were opened on the main consentz.com website — not the clinic directory."],
                    ["Users", nf(data.mainSite.users), "How many different people visited the main consentz.com website."],
                    ["Content clicks", nf(data.mainSite.contentClicks), "How many times someone clicked a link inside a blog post or article on the main website."],
                    ["Form starts", nf(data.mainSite.formStarts), "How many times someone started filling in a form on the main website, whether or not they finished it."],
                    ["Demo / register leads", nf(data.mainSite.leads), "How many people asked for a demo or registered interest on the main website. This is separate from patient leads on the clinic directory, shown above."],
                    ["Login clicks", nf(data.mainSite.logins), "How many times someone clicked a login link on the main website."],
                  ] as [string, string, string][]).map(([label, value, tooltip]) => (
                    <div key={label} className="rounded-lg border border-gray-200 bg-white p-3">
                      <div className="flex items-center gap-1 text-[11px] uppercase text-gray-600">
                        {label}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" aria-label={`What does "${label}" measure?`} className="shrink-0 normal-case text-gray-400 hover:text-gray-600">
                              <IconInfoCircle className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>{tooltip}</TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <ListCard
                    title="Top blog posts (by views)"
                    items={data.mainSite.topBlogPosts}
                    tooltip="The blog posts on the main website that were opened the most, ranked from most to least."
                  />
                  <ListCard
                    title="Top articles (by views)"
                    items={data.mainSite.topArticles}
                    tooltip="The articles on the main website that were opened the most, ranked from most to least."
                  />
                  <ListCard
                    title="Top blog links clicked"
                    items={data.mainSite.topBlogClicks}
                    tooltip="Which links inside blog posts got clicked the most by readers."
                  />
                  <ListCard
                    title="Top article links clicked"
                    items={data.mainSite.topArticleClicks}
                    tooltip="Which links inside articles got clicked the most by readers."
                  />
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    Lead funnel by form
                    <InfoTooltip
                      label="Lead funnel by form"
                      text="For each form on the main site: how many people started filling it in, and how many went on to submit it as a lead."
                    />
                  </div>
                  <p className="mb-3 text-xs text-gray-500">
                    For each form on the main site: how many people started filling it in, and how many
                    went on to submit it as a lead.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="text-xs uppercase text-gray-500">
                        <tr>
                          <th className="py-2 pr-4">Form</th>
                          <th className="py-2 pr-4 text-right">Starts</th>
                          <th className="py-2 pr-4 text-right">Leads</th>
                          <th className="py-2 text-right">Conv.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.mainSite.leadFunnel.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-3 text-gray-500">
                              No data yet
                            </td>
                          </tr>
                        )}
                        {data.mainSite.leadFunnel.map((f) => (
                          <tr key={f.formName} className="border-t border-gray-100">
                            <td className="py-2 pr-4">{f.label}</td>
                            <td className="py-2 pr-4 text-right tabular-nums">{nf(f.starts)}</td>
                            <td className="py-2 pr-4 text-right tabular-nums">{nf(f.leads)}</td>
                            <td className="py-2 text-right tabular-nums">
                              {f.starts > 0 ? `${Math.round((f.leads / f.starts) * 100)}%` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
    </TooltipProvider>
  )
}
