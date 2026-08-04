'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { Loader2, PoundSterling, TrendingUp, CalendarDays, ReceiptText } from 'lucide-react'
import { cn } from '@/lib/utils'

import { commissionRate, commissionPct, clinicNetRate } from '@/lib/pricing'

// Bookings are always shown in the clinic's own timezone, never the visitor's
// browser timezone — every clinic in this directory is UK-based.
const CLINIC_TIMEZONE = 'Europe/London'

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
  no_show: 'bg-gray-100 text-gray-600',
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
  const [claimedPlan, setClaimedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/directory/api/portal/earnings?period=${period}`)
      .then((r) => r.json())
      .then((d) => {
        setSummary(d.summary ?? null)
        setBookings(d.bookings ?? [])
        setClaimedPlan(d.claimedPlan ?? null)
      })
      .catch(() => {
        setSummary(null)
        setBookings([])
        setClaimedPlan(null)
      })
      .finally(() => setLoading(false))
  }, [period])

  const feeRate = commissionRate(claimedPlan)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Earnings</h1>
          <p className="mt-0.5 text-sm text-gray-600">
            Payments collected from patients who booked consultations through the directory.
          </p>
        </div>

        {/* Period filter */}
        <div className="flex gap-1 rounded-lg border border-gray-200 p-2 bg-gray-50 self-start sm:self-auto">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                period === p
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-700',
              )}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
        </div>
      ) : (
        <>
          {/* Summary cards — always show all-time stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SummaryCard
              icon={PoundSterling}
              label="Net earned"
              value={`£${fmt((summary?.total ?? 0) * (1 - feeRate))}`}
              sub={feeRate > 0 ? `after ${(feeRate * 100).toFixed(0)}% platform fee` : 'all time'}
            />
            <SummaryCard
              icon={TrendingUp}
              label="This month (net)"
              value={`£${fmt((summary?.thisMonth ?? 0) * (1 - feeRate))}`}
              sub="paid bookings"
            />
            <SummaryCard
              icon={CalendarDays}
              label="Last month (net)"
              value={`£${fmt((summary?.lastMonth ?? 0) * (1 - feeRate))}`}
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
            <div className="bg-white rounded-lg border border-dashed border-gray-200 py-16 text-center">
              <PoundSterling className="mx-auto h-8 w-8 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-700">
                {period === 'all' ? 'No paid bookings yet' : `No paid bookings for ${PERIOD_LABELS[period].toLowerCase()}`}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Earnings appear here when patients pay for consultations through the directory.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden sm:table-cell">Consultation</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden md:table-cell">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Gross</th>
                    {feeRate > 0 && (
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide hidden lg:table-cell">
                        Fee ({(feeRate * 100).toFixed(0)}%)
                      </th>
                    )}
                    {feeRate > 0 && (
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Net</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-xs font-medium text-gray-900">
                          {formatInTimeZone(b.slotStart, CLINIC_TIMEZONE, 'd MMM yyyy')}
                        </p>
                        <p className="text-[10px] text-gray-600">
                          {formatInTimeZone(b.slotStart, CLINIC_TIMEZONE, 'HH:mm')}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{b.patientName}</p>
                        {b.patientEmail && (
                          <p className="text-[10px] text-gray-600 truncate max-w-[140px]">{b.patientEmail}</p>
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
                        <p className="text-sm text-gray-600">£{fmt(b.depositAmount)}</p>
                        {b.stripePaymentIntentId && (
                          <p className="text-[10px] text-gray-600 font-mono">
                            {b.stripePaymentIntentId.slice(0, 12)}…
                          </p>
                        )}
                      </td>
                      {feeRate > 0 && (
                        <td className="px-4 py-3 text-right hidden lg:table-cell">
                          <p className="text-sm text-red-500">−£{fmt(b.depositAmount * feeRate)}</p>
                        </td>
                      )}
                      {feeRate > 0 && (
                        <td className="px-4 py-3 text-right">
                          <p className="text-sm font-semibold text-gray-900">£{fmt(b.depositAmount * (1 - feeRate))}</p>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td colSpan={3} className="px-4 py-3 text-xs text-gray-600 hidden sm:table-cell">
                      {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} shown
                    </td>
                    {feeRate > 0 ? (
                      <>
                        <td className="px-4 py-3 text-right hidden md:table-cell" />
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs text-gray-600 mr-2">Gross</span>
                          <span className="text-sm text-gray-600">
                            £{fmt(bookings.reduce((s, b) => s + b.depositAmount, 0))}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right hidden lg:table-cell">
                          <span className="text-xs text-gray-600 mr-2">Fee</span>
                          <span className="text-sm text-red-500">
                            −£{fmt(bookings.reduce((s, b) => s + b.depositAmount * feeRate, 0))}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs text-gray-600 mr-2">Net</span>
                          <span className="text-sm font-medium text-gray-900">
                            £{fmt(bookings.reduce((s, b) => s + b.depositAmount * (1 - feeRate), 0))}
                          </span>
                        </td>
                      </>
                    ) : (
                      <td colSpan={2} className="px-4 py-3 text-right">
                        <span className="text-xs text-gray-600 mr-2">Subtotal</span>
                        <span className="text-sm font-medium text-gray-900">
                          £{fmt(bookings.reduce((s, b) => s + b.depositAmount, 0))}
                        </span>
                      </td>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Commercial info */}
          <div className="rounded-lg bg-white border border-gray-200 bg-gray-50 p-4 space-y-3 text-sm text-gray-700">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">How earnings work</p>
            <p>
              <span className="font-medium text-gray-900">Platform fee: </span>
              {(claimedPlan === 'subscription' || claimedPlan === 'pay_per_lead')
                ? `Consentz retains ${commissionPct(claimedPlan)}% of each teleconsult fee (inclusive of Stripe processing). You keep ${Math.round(clinicNetRate(claimedPlan) * 100)}% of what patients pay.`
                : 'Teleconsult payments are not available on the Free plan.'}
            </p>
            <p>
              <span className="font-medium text-gray-900">Payouts: </span>
              Stripe pays out to your connected bank account on a rolling 7-day basis. Your first payout
              may take up to 14 days. Settlement details are visible in your Stripe dashboard.
            </p>
            <p>
              <span className="font-medium text-gray-900">No-refund policy: </span>
              All teleconsult fees are non-refundable. No-shows and patient cancellations are not
              automatically refunded. You may issue discretionary refunds from the Stripe dashboard
              if you choose to do so.
            </p>
          </div>
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
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100">
          <Icon className="h-3.5 w-3.5 text-gray-600" />
        </div>
        <p className="text-xs text-gray-600">{label}</p>
      </div>
      <p className="text-2xl font-medium text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-600">{sub}</p>
    </div>
  )
}
