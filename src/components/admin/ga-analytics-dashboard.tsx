"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { AdminLayout } from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"

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

function Bar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0
  return (
    <div className="h-2 flex-1 rounded bg-gray-100">
      <div className={`h-2 rounded ${className ?? "bg-blue-500"}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function ListCard({
  title,
  items,
  formatValue = nf,
}: {
  title: string
  items: NamedValue[]
  formatValue?: (n: number) => string
}) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 text-sm font-medium text-gray-700">{title}</div>
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
            Live from Google Analytics 4 via the Data API. This dashboard runs in parallel with{" "}
            <Link href="/admin/tracking" className="underline">
              Directory tracking
            </Link>{" "}
            — verify the numbers line up over a few days, then retire the old dashboard.
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
                ["Sessions", nf(data.kpis.sessions)],
                ["Users", nf(data.kpis.users)],
                ["Page views", nf(data.kpis.pageViews)],
                ["Business sign-ups", nf(data.kpis.signUps)],
                ["Sign-up starts", nf(data.kpis.signUpStarts)],
                ["Patient leads", nf(data.kpis.leads)],
                ["Unclaimed enquiries", nf(data.kpis.enquiries)],
                ["Bookings", nf(data.kpis.bookings)],
                ["Consultation chats", nf(data.kpis.chats)],
                ["Revenue", `£${nf(Math.round(data.kpis.revenue))}`],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="text-xs uppercase text-gray-600">{label}</div>
                  <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-1 text-sm font-medium text-gray-700">All events</div>
              <p className="mb-3 text-xs text-gray-500">
                Every event GA4 recorded in this range — custom events the app fires (
                <code>generate_lead</code>, <code>chat_open</code>, <code>sign_up</code>, …) plus
                GA4&apos;s automatically-collected events.
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
                        <td className="py-2 pr-4 font-mono text-xs">{ev.name}</td>
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
                <div className="mb-3 text-sm font-medium text-gray-700">
                  Business sign-up funnel
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
                <div className="mb-1 text-sm font-medium text-gray-700">
                  Business sign-ups by source
                </div>
                <p className="mb-3 text-xs text-gray-500">
                  First-touch attribution · GA4 event <code>sign_up</code> × <code>source_bucket</code>
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
              <div className="mb-1 text-sm font-medium text-gray-700">Booking funnel</div>
              <p className="mb-3 text-xs text-gray-500">
                In-person + event bookings · GA4 events <code>booking_start</code> → <code>booking_complete</code>
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
              <div className="mb-3 text-sm font-medium text-gray-700">Acquisition channels</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase text-gray-500">
                    <tr>
                      <th className="py-2 pr-4">Channel</th>
                      <th className="py-2 pr-4 text-right">Sessions</th>
                      <th className="py-2 text-right">Key events</th>
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
              <div className="mb-3 text-sm font-medium text-gray-700">
                Daily trend (sessions vs key events)
              </div>
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
                      <span className="w-16 text-xs text-gray-500">Key ev.</span>
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
              />
              <ListCard title="Devices" items={data.devices} />
            </div>

            {data.mainSite && (
              <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div>
                  <div className="text-sm font-semibold text-gray-800">Main site (consentz.com)</div>
                  <p className="mt-1 text-xs text-gray-500">
                    The marketing-site slice of this property · GA4 events tagged{" "}
                    <code>site=main</code>. Blog / article content lives here; the directory
                    figures above are property-wide (traffic) or patient-only (leads).
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                  {([
                    ["Page views", nf(data.mainSite.pageViews)],
                    ["Users", nf(data.mainSite.users)],
                    ["Content clicks", nf(data.mainSite.contentClicks)],
                    ["Form starts", nf(data.mainSite.formStarts)],
                    ["Demo / register leads", nf(data.mainSite.leads)],
                    ["Login clicks", nf(data.mainSite.logins)],
                  ] as [string, string][]).map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-gray-200 bg-white p-3">
                      <div className="text-[11px] uppercase text-gray-600">{label}</div>
                      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <ListCard title="Top blog posts (by views)" items={data.mainSite.topBlogPosts} />
                  <ListCard title="Top articles (by views)" items={data.mainSite.topArticles} />
                  <ListCard title="Top blog links clicked" items={data.mainSite.topBlogClicks} />
                  <ListCard title="Top article links clicked" items={data.mainSite.topArticleClicks} />
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="mb-1 text-sm font-medium text-gray-700">Lead funnel by form</div>
                  <p className="mb-3 text-xs text-gray-500">
                    GA4 events <code>form_start</code> → <code>generate_lead</code>, split by{" "}
                    <code>form_name</code>
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
  )
}
