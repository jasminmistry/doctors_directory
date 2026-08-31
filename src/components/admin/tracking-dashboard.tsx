"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileQuestion,
  LayoutGrid,
  Link2,
  Mail,
  MailX,
  MessageSquareText,
  Search,
  Share2,
  UserRound,
  XCircle,
} from "lucide-react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
  consultationLeads: number
  pricingLeads: number
  clinicSignUps: number
  practitionerSignUps: number
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
  if (value === "leads") return "leads"
  if (value === "signups") return "signups"
  if (value === "campaign") return "campaign"
  return "events"
}

function parseOverviewWindow(value: string | null): OverviewWindow {
  if (value === "30") return "30"
  if (value === "all") return "all"
  return "7"
}

function formatShortTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return String(iso)
  const now = new Date()
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  const time = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  if (sameDay) return time
  const day = date.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" })
  return `${day} ${time}`
}

const PAGE_TYPE_ICON: Record<string, { icon: typeof UserRound; label: string }> = {
  practitioner_page: { icon: UserRound, label: "practitioner_page" },
  clinic_page: { icon: Building2, label: "clinic_page" },
  collection_page: { icon: LayoutGrid, label: "collection_page" },
}

function TypeIcon({ pageType }: { pageType: string }) {
  const entry = PAGE_TYPE_ICON[pageType] ?? { icon: FileQuestion, label: pageType || "other" }
  const Icon = entry.icon
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Icon className="size-4 text-gray-600" aria-label={entry.label} />
      </TooltipTrigger>
      <TooltipContent>{entry.label}</TooltipContent>
    </Tooltip>
  )
}

function referrerIcon(referrer: string): typeof Search {
  const value = (referrer || "").toLowerCase()
  if (!value || value === "direct") return ArrowRight
  if (value === "consultation_form") return MessageSquareText
  if (/google|bing|search/.test(value)) return Search
  if (/facebook|instagram|twitter|x\.com/.test(value)) return Share2
  return Link2
}

function ReferrerIcon({ referrer }: { referrer: string }) {
  const Icon = referrerIcon(referrer)
  const label = referrer && referrer.trim().length > 0 ? referrer : "direct"
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Icon className="size-4 text-gray-600" aria-label={label} />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function EntityTypeIcon({ entityType }: { entityType: string }) {
  const Icon = entityType === "practitioner" ? UserRound : Building2
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Icon className="size-4 text-gray-600" aria-label={entityType} />
      </TooltipTrigger>
      <TooltipContent className="capitalize">{entityType}</TooltipContent>
    </Tooltip>
  )
}

function EmailSentCell({ sentAt, status }: { sentAt: unknown; status?: unknown }) {
  const iso = typeof sentAt === "string" ? sentAt : null
  if (!iso) {
    if (status === "no_clinic_email") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 text-amber-600">
              <MailX className="size-4" />
              No clinic email
            </span>
          </TooltipTrigger>
          <TooltipContent>
            No contact email on record for this clinic, so no notification could be sent.
          </TooltipContent>
        </Tooltip>
      )
    }
    if (status === "not_tracked") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-gray-400">—</span>
          </TooltipTrigger>
          <TooltipContent>Legacy lead — notification emails were not tracked.</TooltipContent>
        </Tooltip>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 text-gray-400">
        <XCircle className="size-4" />
        Not sent
      </span>
    )
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 text-emerald-700">
          <CheckCircle2 className="size-4" />
          {formatShortTime(iso)}
        </span>
      </TooltipTrigger>
      <TooltipContent>{new Date(iso).toLocaleString()}</TooltipContent>
    </Tooltip>
  )
}

function EmailReadCell({ readAt, sentAt }: { readAt: unknown; sentAt: unknown }) {
  const readIso = typeof readAt === "string" ? readAt : null
  const sentIso = typeof sentAt === "string" ? sentAt : null
  if (!readIso) {
    return <span className="text-gray-400">{sentIso ? "Unread" : "—"}</span>
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 text-emerald-700">
          <Mail className="size-4" />
          {formatShortTime(readIso)}
        </span>
      </TooltipTrigger>
      <TooltipContent>{new Date(readIso).toLocaleString()}</TooltipContent>
    </Tooltip>
  )
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
  }, [overviewWindow, overviewFrom, overviewTo])

  const applyFilters = () => {
    const sp = new URLSearchParams()
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
          Filters are reflected in the URL so you can bookmark or share a view. Access is gated by
          admin login.
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

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase text-gray-600">CTA clicks</div>
            <div className="mt-2 text-2xl font-semibold">{overviewLoading ? "…" : overview?.totalClicks ?? 0}</div>
            <div className="mt-1 text-xs text-gray-600">
              Pricing {overviewLoading ? "…" : overview?.pricingClicks ?? 0} · Consultation{" "}
              {overviewLoading ? "…" : overview?.consultationClicks ?? 0}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase text-gray-600">Total patient leads</div>
            <div className="mt-2 text-2xl font-semibold">{overviewLoading ? "…" : overview?.totalLeads ?? 0}</div>
            <div className="mt-1 text-xs text-gray-600">
              Consultation {overviewLoading ? "…" : overview?.consultationLeads ?? 0} · Pricing{" "}
              {overviewLoading ? "…" : overview?.pricingLeads ?? 0}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase text-gray-600">Sign-ups</div>
            <div className="mt-2 text-2xl font-semibold">
              {overviewLoading
                ? "…"
                : (overview?.clinicSignUps ?? 0) + (overview?.practitionerSignUps ?? 0)}
            </div>
            <div className="mt-1 text-xs text-gray-600">
              Clinics {overviewLoading ? "…" : overview?.clinicSignUps ?? 0} · Practitioners{" "}
              {overviewLoading ? "…" : overview?.practitionerSignUps ?? 0}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase text-gray-600">Conversion rate</div>
            <div className="mt-2 text-2xl font-semibold">
              {overviewLoading ? "…" : `${(overview?.conversionRate ?? 0).toFixed(1)}%`}
            </div>
            <div className="mt-1 text-xs text-gray-600">Patient leads divided by CTA clicks</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase text-gray-600">Most searched term</div>
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
                    <div className="text-xs text-gray-600">{point.date}</div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 text-xs text-gray-600">Clicks</span>
                      <div className="h-2 flex-1 rounded bg-gray-100">
                        <div className="h-2 rounded bg-blue-500" style={{ width: `${clicksWidth}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs">{point.clicks}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 text-xs text-gray-600">Leads</span>
                      <div className="h-2 flex-1 rounded bg-gray-100">
                        <div className="h-2 rounded bg-emerald-500" style={{ width: `${leadsWidth}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs">{point.leads}</span>
                    </div>
                  </div>
                )
              })}
              {!overviewLoading && (overview?.trend.length ?? 0) === 0 && (
                <div className="text-sm text-gray-600">No activity in this range.</div>
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
                    <div className="text-sm text-gray-600">No data</div>
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
              sp.delete("q")
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
              sp.delete("q")
              pushUrl(sp)
            }}
          >
            Patient leads
          </Button>
          <Button
            type="button"
            variant={tab === "signups" ? "default" : "outline"}
            onClick={() => {
              const sp = new URLSearchParams(searchParams.toString())
              sp.set("tab", "signups")
              sp.set("page", "1")
              sp.delete("q")
              pushUrl(sp)
            }}
          >
            Sign-ups
          </Button>
          <Button
            type="button"
            variant={tab === "campaign" ? "default" : "outline"}
            onClick={() => {
              const sp = new URLSearchParams(searchParams.toString())
              sp.set("tab", "campaign")
              sp.set("page", "1")
              sp.delete("q")
              pushUrl(sp)
            }}
          >
            Campaign emails
          </Button>
          <Link href="/admin" className="ml-auto self-center text-sm underline">
            Admin home
          </Link>
          <Link href="/admin/main-site-tracking" className="self-center text-sm underline">
            Main site tracking
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
          <Input
            placeholder={
              tab === "signups"
                ? "Search (clinic, practitioner, claimer, email...)"
                : tab === "campaign"
                ? "Search (clinic name, slug, email...)"
                : "Search (URL, CTA label, referrer, target...)"
            }
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {tab !== "signups" && tab !== "campaign" && (
            <>
              <Select value={pageType || "all"} onValueChange={(value) => setPageType(value === "all" ? "" : value)}>
                <SelectTrigger className="h-9 w-full text-sm">
                  <SelectValue placeholder="All page types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All page types</SelectItem>
                  <SelectItem value="practitioner_page">practitioner_page</SelectItem>
                  <SelectItem value="clinic_page">clinic_page</SelectItem>
                  <SelectItem value="collection_page">collection_page</SelectItem>
                  <SelectItem value="other">other</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Country code (e.g. GB)" value={country} onChange={(e) => setCountry(e.target.value)} />
              <Select value={deviceType || "all"} onValueChange={(value) => setDeviceType(value === "all" ? "" : value)}>
                <SelectTrigger className="h-9 w-full text-sm">
                  <SelectValue placeholder="All devices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All devices</SelectItem>
                  <SelectItem value="desktop">desktop</SelectItem>
                  <SelectItem value="mobile">mobile</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
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
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        )}

        <div className="text-sm text-gray-600">
          {loading ? "Loading…" : `${total} row(s) · page ${page} / ${totalPages}`}
        </div>

        <TooltipProvider>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                {tab === "events" ? (
                  <>
                    <th className="px-2 py-2">Time</th>
                    <th className="px-3 py-2">Page</th>
                    <th className="px-2 py-2">Type</th>
                    <th className="px-2 py-2">Referrer</th>
                    <th className="px-3 py-2">Country</th>
                    <th className="px-3 py-2">CTA</th>
                    <th className="px-3 py-2">Search terms</th>
                    <th className="px-3 py-2">Target</th>
                  </>
                ) : tab === "signups" ? (
                  <>
                    <th className="px-2 py-2">Approved</th>
                    <th className="px-2 py-2">Type</th>
                    <th className="px-3 py-2">Clinic / Practitioner</th>
                    <th className="px-3 py-2">Slug</th>
                    <th className="px-3 py-2">Claimer</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Plan</th>
                  </>
                ) : tab === "campaign" ? (
                  <>
                    <th className="px-3 py-2">Clinic</th>
                    <th className="px-3 py-2">City</th>
                    <th className="px-3 py-2">Email sent</th>
                    <th className="px-3 py-2">Email read</th>
                    <th className="px-3 py-2">Recipient</th>
                  </>
                ) : (
                  <>
                    <th className="px-2 py-2">Time</th>
                    <th className="px-3 py-2">Page</th>
                    <th className="px-2 py-2">Type</th>
                    <th className="px-2 py-2">Referrer</th>
                    <th className="px-3 py-2">Country</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Contact</th>
                    <th className="px-3 py-2">Treatment</th>
                    <th className="px-3 py-2">Location</th>
                    <th className="px-3 py-2">Budget</th>
                    <th className="px-3 py-2">Email sent</th>
                    <th className="px-3 py-2">Email read</th>
                    <th className="px-3 py-2">Recipient</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)} className="border-t border-gray-100">
                  {tab === "events" ? (
                    <>
                      <td className="px-2 py-2 whitespace-nowrap" title={new Date(String(row.timestamp)).toLocaleString()}>
                        {formatShortTime(String(row.timestamp))}
                      </td>
                      <td className="px-3 py-2 max-w-[220px] truncate">
                        <a
                          href={String(row.page_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 underline decoration-dotted hover:decoration-solid"
                          title={String(row.page_url)}
                        >
                          {String(row.page_url)}
                        </a>
                      </td>
                      <td className="px-2 py-2">
                        <TypeIcon pageType={String(row.page_type)} />
                      </td>
                      <td className="px-2 py-2">
                        <ReferrerIcon referrer={String(row.referrer)} />
                      </td>
                      <td className="px-3 py-2">{String(row.country)}</td>
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
                  ) : tab === "signups" ? (
                    <>
                      <td className="px-2 py-2 whitespace-nowrap" title={new Date(String(row.timestamp)).toLocaleString()}>
                        {formatShortTime(String(row.timestamp))}
                      </td>
                      <td className="px-2 py-2">
                        <EntityTypeIcon entityType={String(row.entity_type)} />
                      </td>
                      <td className="px-3 py-2 max-w-[220px] truncate">
                        {row.entity_slug && row.entity_slug !== "—" ? (
                          <Link
                            href={`/admin/${row.entity_type === "practitioner" ? "practitioners" : "clinics"}/${row.entity_slug}`}
                            className="text-blue-700 underline decoration-dotted hover:decoration-solid"
                            title={String(row.entity_name)}
                          >
                            {String(row.entity_name)}
                          </Link>
                        ) : (
                          <span title={String(row.entity_name)}>{String(row.entity_name)}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 max-w-[180px] truncate" title={String(row.entity_slug)}>
                        {String(row.entity_slug)}
                      </td>
                      <td className="px-3 py-2">{String(row.claimer_name)}</td>
                      <td className="px-3 py-2 max-w-[220px] truncate" title={String(row.claimer_email)}>
                        {String(row.claimer_email)}
                      </td>
                      <td className="px-3 py-2">{String(row.plan_label)}</td>
                    </>
                  ) : tab === "campaign" ? (
                    <>
                      <td className="px-3 py-2 max-w-[220px] truncate">
                        <Link
                          href={`/admin/clinics/${row.clinic_slug}`}
                          className="text-blue-700 underline decoration-dotted hover:decoration-solid"
                          title={String(row.clinic_slug)}
                        >
                          {String(row.clinic_name)}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{row.city ? String(row.city) : "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <EmailSentCell sentAt={row.email_sent_at} />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <EmailReadCell readAt={row.email_read_at} sentAt={row.email_sent_at} />
                      </td>
                      <td className="px-3 py-2 max-w-[220px] truncate" title={row.email_recipient ? String(row.email_recipient) : ""}>
                        {row.email_recipient ? String(row.email_recipient) : "—"}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-2 py-2 whitespace-nowrap" title={new Date(String(row.timestamp)).toLocaleString()}>
                        {formatShortTime(String(row.timestamp))}
                      </td>
                      <td className="px-3 py-2 max-w-[200px] truncate">
                        <a
                          href={String(row.page_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 underline decoration-dotted hover:decoration-solid"
                          title={String(row.page_url)}
                        >
                          {String(row.page_url)}
                        </a>
                      </td>
                      <td className="px-2 py-2">
                        <TypeIcon pageType={String(row.page_type)} />
                      </td>
                      <td className="px-2 py-2">
                        <ReferrerIcon referrer={String(row.referrer)} />
                      </td>
                      <td className="px-3 py-2">{String(row.country)}</td>
                      <td className="px-3 py-2">{String(row.name)}</td>
                      <td className="px-3 py-2">{String(row.contact)}</td>
                      <td className="px-3 py-2">{row.treatment ? String(row.treatment) : "—"}</td>
                      <td className="px-3 py-2">{row.location ? String(row.location) : "—"}</td>
                      <td className="px-3 py-2">{row.budget ? String(row.budget) : "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <EmailSentCell sentAt={row.email_sent_at} status={row.email_status} />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <EmailReadCell readAt={row.email_read_at} sentAt={row.email_sent_at} />
                      </td>
                      <td
                        className="px-3 py-2 max-w-[180px] truncate"
                        title={String(row.email_recipient || row.clinic_email || "")}
                      >
                        {row.email_recipient ? (
                          String(row.email_recipient)
                        ) : row.clinic_email ? (
                          <span className="text-gray-400">{String(row.clinic_email)}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-gray-600"
                    colSpan={tab === "events" ? 8 : tab === "signups" ? 7 : tab === "campaign" ? 5 : 13}
                  >
                    No rows match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </TooltipProvider>

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
