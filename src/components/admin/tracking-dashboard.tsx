"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { TrackingTab } from "@/lib/tracking/dashboard-queries"

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

interface ApiResponse {
  tab: TrackingTab
  rows: Record<string, unknown>[]
  total: number
  page: number
  page_size: number
}

interface OverviewItem {
  label: string
  value: number
}

interface OverviewResponse {
  windowDays: number | null
  from: string | null
  to: string | null
  totalClicks: number
  totalLeads: number
  conversionRate: number
  pricingClicks: number
  consultationClicks: number
  topPagesByClicks: OverviewItem[]
  topPagesByLeads: OverviewItem[]
  topCitiesByClicks: OverviewItem[]
  topCitiesByLeads: OverviewItem[]
  topSearches: OverviewItem[]
  deviceBreakdown: OverviewItem[]
  pageTypeBreakdown: OverviewItem[]
  referrerBreakdown: OverviewItem[]
  trend: Array<{ date: string; clicks: number; leads: number }>
}

type OverviewWindow = "7" | "30" | "all"

function apiBase(): string {
  if (typeof window === "undefined") return "/directory"
  return window.location.pathname.startsWith("/directory") ? "/directory" : ""
}

function parseTab(value: string | null): TrackingTab {
  return value === "leads" ? "leads" : "events"
}

function parseOverviewWindow(value: string | null): OverviewWindow {
  if (value === "30") return "30"
  if (value === "all") return "all"
  return "7"
}

export function TrackingDashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [tab, setTab] = useState<TrackingTab>(() => parseTab(searchParams.get("tab")))
  const [q, setQ] = useState(() => searchParams.get("q") ?? "")
  const [pageType, setPageType] = useState(() => searchParams.get("page_type") ?? "")
  const [country, setCountry] = useState(() => searchParams.get("country") ?? "")
  const [deviceType, setDeviceType] = useState(() => searchParams.get("device_type") ?? "")
  const [from, setFrom] = useState(() => searchParams.get("from") ?? "")
  const [to, setTo] = useState(() => searchParams.get("to") ?? "")
  const page = useMemo(() => {
    const n = Number.parseInt(searchParams.get("page") || "1", 10)
    return Number.isNaN(n) || n < 1 ? 1 : n
  }, [searchParams])

  const pageSize = useMemo(() => {
    const n = Number.parseInt(searchParams.get("page_size") || "25", 10)
    return Number.isNaN(n) ? 25 : Math.min(100, Math.max(1, n))
  }, [searchParams])

  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overviewWindow, setOverviewWindow] = useState<OverviewWindow>(() =>
    parseOverviewWindow(searchParams.get("window_days"))
  )
  const [overviewFrom, setOverviewFrom] = useState(() => searchParams.get("overview_from") ?? "")
  const [overviewTo, setOverviewTo] = useState(() => searchParams.get("overview_to") ?? "")
  const [overview, setOverview] = useState<OverviewResponse | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(true)

  const token = searchParams.get("token")

  const searchKey = useMemo(() => searchParams.toString(), [searchParams])

  const pushUrl = useCallback(
    (next: URLSearchParams) => {
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [router, pathname]
  )

  const syncFromUrl = useCallback(() => {
    setTab(parseTab(searchParams.get("tab")))
    setQ(searchParams.get("q") ?? "")
    setPageType(searchParams.get("page_type") ?? "")
    setCountry(searchParams.get("country") ?? "")
    setDeviceType(searchParams.get("device_type") ?? "")
    setFrom(searchParams.get("from") ?? "")
    setTo(searchParams.get("to") ?? "")
    setOverviewWindow(parseOverviewWindow(searchParams.get("window_days")))
    setOverviewFrom(searchParams.get("overview_from") ?? "")
    setOverviewTo(searchParams.get("overview_to") ?? "")
  }, [searchParams])

  useEffect(() => {
    syncFromUrl()
  }, [syncFromUrl])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const url = `${apiBase()}/api/admin/tracking/?${searchKey}`
        const res = await fetch(url)
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError((body as { error?: string }).error || `HTTP ${res.status}`)
          setRows([])
          setTotal(0)
          return
        }
        const data = (await res.json()) as ApiResponse
        if (cancelled) return
        setRows(data.rows)
        setTotal(data.total)
      } catch {
        if (!cancelled) {
          setError("Failed to load data")
          setRows([])
          setTotal(0)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [searchKey])

  useEffect(() => {
    let cancelled = false
    const loadOverview = async () => {
      setOverviewLoading(true)
      try {
        const sp = new URLSearchParams()
        if (token) sp.set("token", token)
        sp.set("view", "overview")
        sp.set("window_days", overviewWindow)
        if (overviewFrom) sp.set("overview_from", overviewFrom)
        if (overviewTo) sp.set("overview_to", overviewTo)
        const res = await fetch(`${apiBase()}/api/admin/tracking/?${sp.toString()}`)
        if (!res.ok) {
          if (!cancelled) setOverview(null)
          return
        }
        const data = (await res.json()) as OverviewResponse
        if (!cancelled) setOverview(data)
      } catch {
        if (!cancelled) setOverview(null)
      } finally {
        if (!cancelled) setOverviewLoading(false)
      }
    }
    void loadOverview()
    return () => {
      cancelled = true
    }
  }, [token, overviewWindow, overviewFrom, overviewTo])

  const applyFilters = () => {
    const sp = new URLSearchParams()
    if (token) sp.set("token", token)
    sp.set("window_days", overviewWindow)
    if (overviewFrom) sp.set("overview_from", overviewFrom)
    if (overviewTo) sp.set("overview_to", overviewTo)
    sp.set("tab", tab)
    if (q.trim()) sp.set("q", q.trim())
    if (pageType) sp.set("page_type", pageType)
    if (country.trim()) sp.set("country", country.trim())
    if (deviceType) sp.set("device_type", deviceType)
    if (from) sp.set("from", from)
    if (to) sp.set("to", to)
    sp.set("page", "1")
    const existingPageSize = searchParams.get("page_size")
    if (existingPageSize && existingPageSize !== "25") {
      sp.set("page_size", existingPageSize)
    }
    pushUrl(sp)

    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "tracking_dashboard_filter", {
        tab,
        page_type: pageType || "",
        device_type: deviceType || "",
        country: country.trim() || "",
      })
    }
  }

  const goPage = (nextPage: number) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (nextPage <= 1) sp.delete("page")
    else sp.set("page", String(nextPage))
    pushUrl(sp)
  }

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const getOverviewLimit = (title: string): number =>
    title === "Top cities by clicks" || title === "Top cities by leads" ? 10 : 5

  return (
    <AdminLayout title="Directory tracking">
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Filters are reflected in the URL so you can bookmark or share a view. If the server has{" "}
          <code className="text-xs">TRACKING_DASHBOARD_TOKEN</code> set, add the same value as{" "}
          <code className="text-xs">?token=…</code> in the URL (including when you use Copy link).
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Overview window:</span>
          <Button
            type="button"
            variant={overviewWindow === "7" ? "default" : "outline"}
            onClick={() => {
              const sp = new URLSearchParams(searchParams.toString())
              sp.set("window_days", "7")
              pushUrl(sp)
            }}
          >
            7 days
          </Button>
          <Button
            type="button"
            variant={overviewWindow === "30" ? "default" : "outline"}
            onClick={() => {
              const sp = new URLSearchParams(searchParams.toString())
              sp.set("window_days", "30")
              pushUrl(sp)
            }}
          >
            30 days
          </Button>
          <Button
            type="button"
            variant={overviewWindow === "all" ? "default" : "outline"}
            onClick={() => {
              const sp = new URLSearchParams(searchParams.toString())
              sp.set("window_days", "all")
              pushUrl(sp)
            }}
          >
            All time
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-3 bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
          <Input
            type="date"
            value={overviewFrom}
            onChange={(e) => {
              const value = e.target.value
              setOverviewFrom(value)
              const sp = new URLSearchParams(searchParams.toString())
              if (value) sp.set("overview_from", value)
              else sp.delete("overview_from")
              pushUrl(sp)
            }}
          />
          <Input
            type="date"
            value={overviewTo}
            onChange={(e) => {
              const value = e.target.value
              setOverviewTo(value)
              const sp = new URLSearchParams(searchParams.toString())
              if (value) sp.set("overview_to", value)
              else sp.delete("overview_to")
              pushUrl(sp)
            }}
          />
          <div className="flex gap-2 md:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOverviewFrom("")
                setOverviewTo("")
                const sp = new URLSearchParams(searchParams.toString())
                sp.delete("overview_from")
                sp.delete("overview_to")
                pushUrl(sp)
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase text-gray-500">Total CTA clicks</div>
            <div className="mt-2 text-2xl font-semibold">{overviewLoading ? "…" : overview?.totalClicks ?? 0}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase text-gray-500">Total leads</div>
            <div className="mt-2 text-2xl font-semibold">{overviewLoading ? "…" : overview?.totalLeads ?? 0}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase text-gray-500">Conversion rate</div>
            <div className="mt-2 text-2xl font-semibold">
              {overviewLoading ? "…" : `${(overview?.conversionRate ?? 0).toFixed(1)}%`}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase text-gray-500">Pricing vs consultation</div>
            <div className="mt-2 text-2xl font-semibold">
              {overviewLoading
                ? "…"
                : `${overview?.pricingClicks ?? 0} / ${overview?.consultationClicks ?? 0}`}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase text-gray-500">Most searched term</div>
            <div className="mt-2 text-sm font-semibold truncate" title={overview?.topSearches?.[0]?.label || ""}>
              {overviewLoading ? "…" : overview?.topSearches?.[0]?.label || "No search data"}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4 lg:h-[460px] flex flex-col">
            <div className="mb-4 text-sm font-medium text-gray-700">Daily trend (clicks vs leads)</div>
            <div className="flex-1 overflow-y-auto overflow-x-auto">
              <div className="space-y-2 min-w-[300px] sm:min-w-[520px] lg:min-w-[640px]">
              {(overview?.trend ?? []).map((point) => {
                const maxValue = Math.max(
                  1,
                  ...(overview?.trend ?? []).map((item) => Math.max(item.clicks, item.leads))
                )
                const clicksWidth = Math.max(4, (point.clicks / maxValue) * 100)
                const leadsWidth = Math.max(4, (point.leads / maxValue) * 100)
                return (
                  <div key={point.date} className="space-y-1">
                    <div className="text-xs text-gray-500">{point.date}</div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 text-xs text-gray-500">Clicks</span>
                      <div className="h-2 flex-1 rounded bg-gray-100">
                        <div className="h-2 rounded bg-blue-500" style={{ width: `${clicksWidth}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs">{point.clicks}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 text-xs text-gray-500">Leads</span>
                      <div className="h-2 flex-1 rounded bg-gray-100">
                        <div className="h-2 rounded bg-emerald-500" style={{ width: `${leadsWidth}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs">{point.leads}</span>
                    </div>
                  </div>
                )
              })}
              {!overviewLoading && (overview?.trend.length ?? 0) === 0 && (
                <div className="text-sm text-gray-500">No activity in this range.</div>
              )}
              </div>
            </div>
          </div>

          <div className="w-full min-w-0 overflow-y-auto overflow-x-hidden pr-1 lg:h-[460px]">
            <div className="grid w-full min-w-0 gap-4 sm:grid-cols-2">
            {[
              ["Top pages by clicks", overview?.topPagesByClicks ?? []],
              ["Top pages by leads", overview?.topPagesByLeads ?? []],
              ["Top cities by clicks", overview?.topCitiesByClicks ?? []],
              ["Top cities by leads", overview?.topCitiesByLeads ?? []],
              ["Top 5 searches (from search_used)", overview?.topSearches ?? []],
              ["Device breakdown", overview?.deviceBreakdown ?? []],
              ["Page type breakdown", overview?.pageTypeBreakdown ?? []],
              ["Referrer/source", overview?.referrerBreakdown ?? []],
            ].map(([title, items]) => (
              <div key={title as string} className="w-full min-w-0 rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-2 text-sm font-medium text-gray-700">{title as string}</div>
                <div className="space-y-1">
                  {(items as OverviewItem[]).slice(0, getOverviewLimit(String(title))).map((item) => (
                    <div key={`${title as string}-${item.label}`} className="flex items-start justify-between gap-3 text-sm">
                      <span className="min-w-0 flex-1 truncate text-gray-600" title={item.label}>
                        {item.label || "unknown"}
                      </span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                  {!overviewLoading && (items as OverviewItem[]).length === 0 && (
                    <div className="text-sm text-gray-500">No data</div>
                  )}
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
          <Button
            type="button"
            variant={tab === "events" ? "default" : "outline"}
            onClick={() => {
              const sp = new URLSearchParams(searchParams.toString())
              sp.set("tab", "events")
              sp.set("page", "1")
              pushUrl(sp)
            }}
          >
            CTA events
          </Button>
          <Button
            type="button"
            variant={tab === "leads" ? "default" : "outline"}
            onClick={() => {
              const sp = new URLSearchParams(searchParams.toString())
              sp.set("tab", "leads")
              sp.set("page", "1")
              pushUrl(sp)
            }}
          >
            Leads
          </Button>
          <Link href="/admin" className="ml-auto self-center text-sm underline">
            Admin home
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
          <Input
            placeholder="Search (URL, CTA label, referrer, target...)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            value={pageType}
            onChange={(e) => setPageType(e.target.value)}
          >
            <option value="">All page types</option>
            <option value="practitioner_page">practitioner_page</option>
            <option value="clinic_page">clinic_page</option>
            <option value="collection_page">collection_page</option>
            <option value="other">other</option>
          </select>
          <Input placeholder="Country code (e.g. GB)" value={country} onChange={(e) => setCountry(e.target.value)} />
          <select
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
          >
            <option value="">All devices</option>
            <option value="desktop">desktop</option>
            <option value="mobile">mobile</option>
          </select>
          <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
          <div className="flex flex-wrap gap-2 md:col-span-2 lg:col-span-3">
            <Button type="button" onClick={applyFilters}>
              Apply filters
            </Button>
            <Button type="button" variant="outline" onClick={() => copyShareLink()}>
              Copy link
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        )}

        <div className="text-sm text-gray-600">
          {loading ? "Loading…" : `${total} row(s) · page ${page} / ${totalPages}`}
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                {tab === "events" ? (
                  <>
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2">Page</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Referrer</th>
                    <th className="px-3 py-2">Country</th>
                    <th className="px-3 py-2">Device</th>
                    <th className="px-3 py-2">CTA</th>
                    <th className="px-3 py-2">Search terms</th>
                    <th className="px-3 py-2">Target</th>
                  </>
                ) : (
                  <>
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2">Page</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Referrer</th>
                    <th className="px-3 py-2">Country</th>
                    <th className="px-3 py-2">Device</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Contact</th>
                    <th className="px-3 py-2">Treatment</th>
                    <th className="px-3 py-2">Location</th>
                    <th className="px-3 py-2">Budget</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)} className="border-t border-gray-100">
                  {tab === "events" ? (
                    <>
                      <td className="px-3 py-2 whitespace-nowrap">{String(row.timestamp)}</td>
                      <td className="px-3 py-2 max-w-[220px] truncate" title={String(row.page_url)}>
                        {String(row.page_url)}
                      </td>
                      <td className="px-3 py-2">{String(row.page_type)}</td>
                      <td className="px-3 py-2 max-w-[180px] truncate" title={String(row.referrer)}>
                        {String(row.referrer)}
                      </td>
                      <td className="px-3 py-2">{String(row.country)}</td>
                      <td className="px-3 py-2">{String(row.device_type)}</td>
                      <td className="px-3 py-2">{String(row.cta_label)}</td>
                      <td className="px-3 py-2 max-w-[220px] truncate" title={String(
                        [row.search_query, row.search_category, row.search_location]
                          .filter((value) => typeof value === "string" && value.trim().length > 0)
                          .join(" | ")
                      )}>
                        {(() => {
                          const parts = [row.search_query, row.search_category, row.search_location]
                            .filter((value) => typeof value === "string" && value.trim().length > 0)
                            .map((value) => String(value))
                          return parts.length ? parts.join(" | ") : "—"
                        })()}
                      </td>
                      <td className="px-3 py-2 max-w-[180px] truncate" title={row.cta_target_url ? String(row.cta_target_url) : ""}>
                        {row.cta_target_url ? String(row.cta_target_url) : "—"}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2 whitespace-nowrap">{String(row.timestamp)}</td>
                      <td className="px-3 py-2 max-w-[200px] truncate" title={String(row.page_url)}>
                        {String(row.page_url)}
                      </td>
                      <td className="px-3 py-2">{String(row.page_type)}</td>
                      <td className="px-3 py-2 max-w-[160px] truncate" title={String(row.referrer)}>
                        {String(row.referrer)}
                      </td>
                      <td className="px-3 py-2">{String(row.country)}</td>
                      <td className="px-3 py-2">{String(row.device_type)}</td>
                      <td className="px-3 py-2">{String(row.name)}</td>
                      <td className="px-3 py-2">{String(row.contact)}</td>
                      <td className="px-3 py-2">{row.treatment ? String(row.treatment) : "—"}</td>
                      <td className="px-3 py-2">{row.location ? String(row.location) : "—"}</td>
                      <td className="px-3 py-2">{row.budget ? String(row.budget) : "—"}</td>
                    </>
                  )}
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-gray-500" colSpan={tab === "events" ? 9 : 11}>
                    No rows match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={page <= 1} onClick={() => goPage(page - 1)}>
            Previous
          </Button>
          <Button type="button" variant="outline" disabled={page >= totalPages} onClick={() => goPage(page + 1)}>
            Next
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}
