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

function apiBase(): string {
  if (typeof window === "undefined") return "/directory"
  return window.location.pathname.startsWith("/directory") ? "/directory" : ""
}

function parseTab(value: string | null): TrackingTab {
  return value === "leads" ? "leads" : "events"
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

  const applyFilters = () => {
    const sp = new URLSearchParams()
    if (token) sp.set("token", token)
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

  return (
    <AdminLayout title="Directory tracking">
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Filters are reflected in the URL so you can bookmark or share a view. If the server has{" "}
          <code className="text-xs">TRACKING_DASHBOARD_TOKEN</code> set, add the same value as{" "}
          <code className="text-xs">?token=…</code> in the URL (including when you use Copy link).
        </p>

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

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 bg-white p-4 rounded-lg border border-gray-200">
          <Input placeholder="Search (URL, label, referrer…)" value={q} onChange={(e) => setQ(e.target.value)} />
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
                  <td className="px-3 py-6 text-center text-gray-500" colSpan={tab === "events" ? 8 : 11}>
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
