'use client'

import { useCallback, useEffect, useState } from 'react'
import { IconChartBarPopular, IconEye, IconHandFinger, IconSearch, IconTrendingUp, IconUsers, IconWorld } from '@tabler/icons-react'

interface InternalMetrics {
  pageViews: number
  contactClicks: number
  leadsReceived: number
}

interface GSCKeyword {
  keyword: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface GSCMetrics {
  impressions: number
  clicks: number
  avgPosition: number
  topKeywords: GSCKeyword[]
}

interface MetricsResponse {
  dateRange: { from: string; to: string }
  internal: InternalMetrics
  gsc: GSCMetrics | null
  gscConfigured: boolean
}

interface EntityMetricsPanelProps {
  entityType: 'clinic' | 'practitioner'
  slug: string
}

function defaultDateRange() {
  const end = new Date()
  const start = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'gray',
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color?: 'gray' | 'blue' | 'green' | 'violet' | 'amber'
}) {
  const colors = {
    gray: 'bg-gray-50 text-gray-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
  }
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`rounded-lg p-2 ${colors[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-600 truncate">{label}</p>
          <p className="mt-0.5 text-2xl font-medium text-gray-900">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-600">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

function apiBase() {
  if (typeof window === 'undefined') return '/directory'
  return window.location.pathname.startsWith('/directory') ? '/directory' : ''
}

export function EntityMetricsPanel({ entityType, slug }: EntityMetricsPanelProps) {
  const [dateRange, setDateRange] = useState(defaultDateRange)
  const [data, setData] = useState<MetricsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async (from: string, to: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ from, to })
      const res = await fetch(
        `${apiBase()}/api/admin/metrics/${entityType}/${slug}?${params}`
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
    } catch {
      setError('Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }, [entityType, slug])

  useEffect(() => {
    fetchMetrics(dateRange.from, dateRange.to)
  }, [fetchMetrics, dateRange.from, dateRange.to])

  const handleApply = () => fetchMetrics(dateRange.from, dateRange.to)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <IconChartBarPopular stroke={1.5} className="h-5 w-5 text-gray-600" />
          <h2 className="text-base font-semibold text-gray-900">Performance Metrics</h2>
        </div>

        {/* Date range */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={dateRange.from}
            max={dateRange.to}
            onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
            className="rounded-lg border border-[#e0e0e0]  bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">to</span>
          <input
            type="date"
            value={dateRange.to}
            min={dateRange.from}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
            className="rounded-lg border border-[#e0e0e0]  bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={loading}
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading…' : 'Apply'}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {loading && !data && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg border border-gray-100 bg-gray-50 animate-pulse" />
          ))}
        </div>
      )}

      {data && (
        <>
          {/* Internal metrics */}
          <div className="mb-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-600">
              Internal
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard
                icon={IconEye}
                label="Page Views"
                value={data.internal.pageViews.toLocaleString()}
                color="blue"
              />
              <StatCard
                icon={IconHandFinger}
                label="CTA / Contact Clicks"
                value={data.internal.contactClicks.toLocaleString()}
                color="violet"
              />
              <StatCard
                icon={IconUsers}
                label="Leads Received"
                value={data.internal.leadsReceived.toLocaleString()}
                color="green"
              />
            </div>
          </div>

          {/* GSC metrics */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                Google Search Console
              </p>
              {!data.gscConfigured && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                  Not configured
                </span>
              )}
            </div>

            {data.gscConfigured && !data.gsc && (
              <p className="text-sm text-gray-600">No GSC data for this period.</p>
            )}

            {!data.gscConfigured && (
              <p className="text-sm text-gray-600">
                Add <code className="rounded bg-gray-100 px-1 text-xs">GSC_SERVICE_ACCOUNT_CREDENTIALS</code> and{' '}
                <code className="rounded bg-gray-100 px-1 text-xs">GSC_SITE_URL</code> to enable Google Search Console metrics.
              </p>
            )}

            {data.gsc && (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-5">
                  <StatCard
                    icon={IconWorld}
                    label="Impressions (Google)"
                    value={data.gsc.impressions.toLocaleString()}
                    color="blue"
                  />
                  <StatCard
                    icon={IconHandFinger}
                    label="Clicks (Google)"
                    value={data.gsc.clicks.toLocaleString()}
                    color="violet"
                  />
                  <StatCard
                    icon={IconTrendingUp}
                    label="Avg. Position"
                    value={data.gsc.avgPosition > 0 ? data.gsc.avgPosition.toFixed(1) : '—'}
                    sub="lower is better"
                    color="amber"
                  />
                </div>

                {data.gsc.topKeywords.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <IconSearch stroke={1.5} className="h-3.5 w-3.5" />
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                        Top Keywords
                      </p>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50">
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Keyword</th>
                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">Clicks</th>
                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">Impressions</th>
                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">CTR</th>
                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">Position</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.gsc.topKeywords.map((kw, i) => (
                            <tr
                              key={kw.keyword}
                              className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                            >
                              <td className="px-4 py-2.5 font-medium text-gray-800">{kw.keyword}</td>
                              <td className="px-4 py-2.5 text-right text-gray-600">{kw.clicks.toLocaleString()}</td>
                              <td className="px-4 py-2.5 text-right text-gray-600">{kw.impressions.toLocaleString()}</td>
                              <td className="px-4 py-2.5 text-right text-gray-600">
                                {(kw.ctr * 100).toFixed(1)}%
                              </td>
                              <td className="px-4 py-2.5 text-right text-gray-600">{kw.position.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
