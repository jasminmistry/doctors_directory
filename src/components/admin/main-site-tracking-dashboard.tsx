"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MainSiteApiResponse {
  rows: Record<string, unknown>[]
  total: number
  page: number
  page_size: number
}

interface MainSiteOverviewItem {
  label: string
  value: number
}

interface MainSiteOverviewResponse {
  windowDays: number | null
  from: string | null
  to: string | null
  totalClicks: number
  formActions: number
  totalLeads: number
  loginActions: number
  top20Clicks: MainSiteOverviewItem[]
  top10BlogClicks: MainSiteOverviewItem[]
  top10ArticleClicks: MainSiteOverviewItem[]
  top10BlogViews: MainSiteOverviewItem[]
  top10ArticleViews: MainSiteOverviewItem[]
}

type OverviewWindow = "7" | "30" | "all"

function apiBase(): string {
  if (typeof window === "undefined") return "/directory"
  return window.location.pathname.startsWith("/directory") ? "/directory" : ""
}

function parseOverviewWindow(value: string | null): OverviewWindow {
  if (value === "30") return "30"
  if (value === "all") return "all"
  return "7"
}

export function MainSiteTrackingDashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [q, setQ] = useState(() => searchParams.get("q") ?? "")
  const [eventType, setEventType] = useState(() => searchParams.get("event_type") ?? "")
  const [from, setFrom] = useState(() => searchParams.get("from") ?? "")
  const [to, setTo] = useState(() => searchParams.get("to") ?? "")
  const [overviewWindow, setOverviewWindow] = useState<OverviewWindow>(() =>
    parseOverviewWindow(searchParams.get("window_days"))
  )
  const [overviewFrom, setOverviewFrom] = useState(() => searchParams.get("overview_from") ?? "")
  const [overviewTo, setOverviewTo] = useState(() => searchParams.get("overview_to") ?? "")
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [total, setTotal] = useState(0)
  const [overview, setOverview] = useState<MainSiteOverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [overviewLoading, setOverviewLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const token = searchParams.get("token")
  const page = useMemo(() => {
    const n = Number.parseInt(searchParams.get("page") || "1", 10)
    return Number.isNaN(n) || n < 1 ? 1 : n
  }, [searchParams])
  const pageSize = useMemo(() => {
    const n = Number.parseInt(searchParams.get("page_size") || "25", 10)
    return Number.isNaN(n) ? 25 : Math.min(100, Math.max(1, n))
  }, [searchParams])
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const searchKey = useMemo(() => searchParams.toString(), [searchParams])

  const pushUrl = useCallback(
    (next: URLSearchParams) => {
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [router, pathname]
  )

  useEffect(() => {
    setQ(searchParams.get("q") ?? "")
    setEventType(searchParams.get("event_type") ?? "")
    setFrom(searchParams.get("from") ?? "")
    setTo(searchParams.get("to") ?? "")
    setOverviewWindow(parseOverviewWindow(searchParams.get("window_days")))
    setOverviewFrom(searchParams.get("overview_from") ?? "")
    setOverviewTo(searchParams.get("overview_to") ?? "")
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${apiBase()}/api/admin/main-site-tracking/?${searchKey}`)
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          if (!cancelled) {
            setError((body as { error?: string }).error || `HTTP ${res.status}`)
            setRows([])
            setTotal(0)
          }
          return
        }
        const data = (await res.json()) as MainSiteApiResponse
        if (!cancelled) {
          setRows(data.rows)
          setTotal(data.total)
        }
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
        const res = await fetch(`${apiBase()}/api/admin/main-site-tracking/?${sp.toString()}`)
        if (!res.ok) {
          if (!cancelled) setOverview(null)
          return
        }
        const data = (await res.json()) as MainSiteOverviewResponse
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
    if (q.trim()) sp.set("q", q.trim())
    if (eventType) sp.set("event_type", eventType)
    if (from) sp.set("from", from)
    if (to) sp.set("to", to)
    sp.set("page", "1")
    pushUrl(sp)
  }

  const goPage = (nextPage: number) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (nextPage <= 1) sp.delete("page")
    else sp.set("page", String(nextPage))
    pushUrl(sp)
  }

  return (
    <AdminLayout title="Main site tracking">
      <div className="space-y-6 overflow-x-hidden">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
          <Link href="/admin/tracking" className="text-sm underline">
            Directory tracking
          </Link>
          <Link href="/admin" className="ml-auto text-sm underline">
            Admin home
          </Link>
        </div>

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

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase text-gray-500">Total clicks</div>
            <div className="mt-2 text-2xl font-semibold">{overviewLoading ? "…" : overview?.totalClicks ?? 0}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase text-gray-500">Form actions</div>
            <div className="mt-2 text-2xl font-semibold">{overviewLoading ? "…" : overview?.formActions ?? 0}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase text-gray-500">Leads</div>
            <div className="mt-2 text-2xl font-semibold">{overviewLoading ? "…" : overview?.totalLeads ?? 0}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase text-gray-500">Login actions</div>
            <div className="mt-2 text-2xl font-semibold">{overviewLoading ? "…" : overview?.loginActions ?? 0}</div>
          </div>
        </div>

        <div className="grid w-full min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            ["Top 20 clicks", overview?.top20Clicks ?? []],
            ["Top 10 blog clicks", overview?.top10BlogClicks ?? []],
            ["Top 10 article clicks", overview?.top10ArticleClicks ?? []],
            ["Top 10 blog views", overview?.top10BlogViews ?? []],
            ["Top 10 article views", overview?.top10ArticleViews ?? []],
          ].map(([title, items]) => (
            <div key={String(title)} className="w-full min-w-0 rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-2 text-sm font-medium text-gray-700">{String(title)}</div>
              <div className="space-y-1">
                {(items as MainSiteOverviewItem[]).map((item) => (
                  <div key={`${String(title)}-${item.label}`} className="flex items-start justify-between gap-3 text-sm">
                    <span className="min-w-0 flex-1 truncate text-gray-600" title={item.label}>
                      {item.label || "unknown"}
                    </span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
                {!overviewLoading && (items as MainSiteOverviewItem[]).length === 0 && (
                  <div className="text-sm text-gray-500">No data</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
          <Input
            placeholder="Search (URL, event, target...)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select value={eventType || "all"} onValueChange={(value) => setEventType(value === "all" ? "" : value)}>
            <SelectTrigger className="h-9 w-full text-sm">
              <SelectValue placeholder="All event types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All event types</SelectItem>
              <SelectItem value="click">click</SelectItem>
              <SelectItem value="form_click">form_click</SelectItem>
              <SelectItem value="form_complete">form_complete</SelectItem>
              <SelectItem value="login_click">login_click</SelectItem>
              <SelectItem value="page_view">page_view</SelectItem>
            </SelectContent>
          </Select>
          <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
          <div className="flex flex-wrap gap-2 md:col-span-2 lg:col-span-4">
            <Button type="button" onClick={applyFilters}>
              Apply filters
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
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Page</th>
                <th className="px-3 py-2">Referrer</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Device</th>
                <th className="px-3 py-2">Event type</th>
                <th className="px-3 py-2">Event name</th>
                <th className="px-3 py-2">Target</th>
                <th className="px-3 py-2">Content type</th>
                <th className="px-3 py-2">Content slug</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)} className="border-t border-gray-100">
                  <td className="px-3 py-2 whitespace-nowrap">{String(row.timestamp)}</td>
                  <td className="px-3 py-2 max-w-[220px] truncate" title={String(row.page_url)}>
                    {String(row.page_url)}
                  </td>
                  <td className="px-3 py-2 max-w-[180px] truncate" title={String(row.referrer)}>
                    {String(row.referrer)}
                  </td>
                  <td className="px-3 py-2">{String(row.country)}</td>
                  <td className="px-3 py-2">{String(row.device_type)}</td>
                  <td className="px-3 py-2">{String(row.event_type)}</td>
                  <td className="px-3 py-2">{String(row.event_name)}</td>
                  <td className="px-3 py-2 max-w-[180px] truncate" title={row.target_url ? String(row.target_url) : ""}>
                    {row.target_url ? String(row.target_url) : "—"}
                  </td>
                  <td className="px-3 py-2">{row.content_type ? String(row.content_type) : "—"}</td>
                  <td className="px-3 py-2">{row.content_slug ? String(row.content_slug) : "—"}</td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-gray-500" colSpan={10}>
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
