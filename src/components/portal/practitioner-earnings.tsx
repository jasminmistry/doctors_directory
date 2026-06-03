'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Loader2, PoundSterling, TrendingUp, CalendarDays, ReceiptText } from 'lucide-react'
import { cn } from '@/lib/utils'

type Period = 'all' | 'this_month' | 'last_month'

interface EarningsSummary {
  total: number
  thisMonth: number
  lastMonth: number
  bookingCount: number
}

interface EarningsBooking {
  id: number
  patientName: string
  patientEmail: string | null
  treatment: string | null
  slotStart: string
  slotEnd: string
  status: string
  depositAmount: number
  stripePaymentIntentId: string | null
  coreBookingId: string | null
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-green-50 text-green-700',
  completed: 'bg-blue-50 text-blue-700',
  pending: 'bg-yellow-50 text-yellow-700',
  no_show: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-50 text-red-600',
}

const PERIOD_LABELS: Record<Period, string> = {
  all: 'All time',
  this_month: 'This month',
  last_month: 'Last month',
}

function fmt(n: number) {
  return n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function PractitionerEarnings() {
  const [period, setPeriod] = useState<Period>('all')
  const [summary, setSummary] = useState<EarningsSummary | null>(null)
  const [bookings, setBookings] = useState<EarningsBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/directory/api/portal/earnings?period=${period}`)
      .then((r) => r.json())
      .then((d) => {
        setSummary(d.summary ?? null)
        setBookings(d.bookings ?? [])
      })
      .catch(() => {
        setSummary(null)
        setBookings([])
      })
      .finally(() => setLoading(false))
  }, [period])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Earnings</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Payments collected from patients who booked consultations through the directory.
          </p>
        </div>

        {/* Period filter */}
        <div className="flex gap-1 rounded-lg border border-gray-200 p-1 bg-gray-50 self-start sm:self-auto">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                period === p
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Summary cards — always show all-time stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SummaryCard
              icon={PoundSterling}
              label="Total earned"
              value={`£${fmt(summary?.total ?? 0)}`}
              sub="all time"
            />
            <SummaryCard
              icon={TrendingUp}
              label="This month"
              value={`£${fmt(summary?.thisMonth ?? 0)}`}
              sub="paid bookings"
            />
            <SummaryCard
              icon={CalendarDays}
              label="Last month"
              value={`£${fmt(summary?.lastMonth ?? 0)}`}
              sub="paid bookings"
            />
            <SummaryCard
              icon={ReceiptText}
              label="Total bookings"
              value={String(summary?.bookingCount ?? 0)}
              sub="paid via directory"
            />
          </div>

          {/* Bookings table */}
          {bookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
              <PoundSterling className="mx-auto h-8 w-8 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-700">
                {period === 'all' ? 'No paid bookings yet' : `No paid bookings for ${PERIOD_LABELS[period].toLowerCase()}`}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Earnings appear here when patients pay for consultations through the directory.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Consultation</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-xs font-medium text-gray-900">
                          {format(new Date(b.slotStart), 'd MMM yyyy')}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {format(new Date(b.slotStart), 'HH:mm')}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{b.patientName}</p>
                        {b.patientEmail && (
                          <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{b.patientEmail}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-sm text-gray-700">{b.treatment ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                          STATUS_STYLES[b.status] ?? 'bg-gray-100 text-gray-600',
                        )}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-semibold text-gray-900">£{fmt(b.depositAmount)}</p>
                        {b.stripePaymentIntentId && (
                          <p className="text-[10px] text-gray-400 font-mono">
                            {b.stripePaymentIntentId.slice(0, 12)}…
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td colSpan={3} className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">
                      {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} shown
                    </td>
                    <td colSpan={2} className="px-4 py-3 text-right">
                      <span className="text-xs text-gray-500 mr-2">Subtotal</span>
                      <span className="text-sm font-bold text-gray-900">
                        £{fmt(bookings.reduce((s, b) => s + b.depositAmount, 0))}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <p className="text-[10px] text-gray-400 text-center">
            These are directory booking deposits processed through Stripe. Contact support for payout details.
          </p>
        </>
      )}
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100">
          <Icon className="h-3.5 w-3.5 text-gray-600" />
        </div>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-400">{sub}</p>
    </div>
  )
}
