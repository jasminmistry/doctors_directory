'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin/AdminLayout'
import {
  Building2, Clock, Package, Stethoscope, Users,
  PoundSterling, TrendingUp, Unlock, CalendarDays,
  RotateCcw, ArrowUp, ArrowDown, Minus, Percent,
  UserCheck, Mail, Chrome, Apple, MessageSquare, BookOpen,
  Link2Off, Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PPL_LEAD_PRICE } from '@/lib/pricing'

export const dynamic = 'force-dynamic'

interface Stats {
  clinics: number
  practitioners: number
  products: number
  treatments: number
  pendingClaims: number
  pendingUnlinkRequests: number
  pendingDirectoryRemovalRequests: number
}

interface PatientStats {
  patients: {
    total: number
    newThisMonth: number
    newLastMonth: number
    authMethods: { google: number; apple: number; magicLink: number }
    withBookings: number
    withChats: number
  }
  leads: {
    total: number
    thisMonth: number
    lastMonth: number
    unlocked: number
    ghost: number
    byType: { pricing: number; callback: number }
  }
}

interface EarningsData {
  planBreakdown: { free: number; pay_per_lead: number; subscription: number }
  subscription: { activeCount: number; mrr: number; newThisMonth: number; newLastMonth: number }
  payPerLead: {
    allTimeCount: number; allTimeRevenue: number
    thisMonthCount: number; thisMonthRev: number
    lastMonthCount: number; lastMonthRev: number
  }
  bookingDeposits: {
    allTimeRevenue: number; allTimeCount: number
    thisMonthRev: number; lastMonthRev: number
    byPlan: {
      pay_per_lead: { count: number; gross: number }
      subscription: { count: number; gross: number }
      free: { count: number; gross: number }
      unknown: { count: number; gross: number }
    }
  }
  commission: {
    allTime: number; thisMonth: number; lastMonth: number
    fromPpl: number; fromSub: number
    bookingCount: number; grossTotal: number
  }
  totals: { mrr: number; allTime: number; thisMonth: number; lastMonth: number }
}

const STAT_CARDS = [
  { key: 'clinics' as const,       label: 'Clinics',       href: '/admin/clinics',       icon: Building2,   color: 'text-black bg-blue-50' },
  { key: 'practitioners' as const, label: 'Practitioners', href: '/admin/practitioners', icon: Users,       color: 'text-violet-600 bg-violet-50' },
  { key: 'products' as const,      label: 'Products',      href: '/admin/products',      icon: Package,     color: 'text-emerald-600 bg-emerald-50' },
  { key: 'treatments' as const,    label: 'Treatments',    href: '/admin/treatments',    icon: Stethoscope, color: 'text-orange-600 bg-orange-50' },
]

function fmt(n: number) {
  return n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return <span className="text-xs text-gray-500">—</span>
  if (previous === 0) return <span className="text-xs text-emerald-600 flex items-center gap-0.5"><ArrowUp className="h-3 w-3" />New</span>
  const pct = ((current - previous) / previous) * 100
  if (Math.abs(pct) < 0.5) return <span className="text-xs text-gray-500 flex items-center gap-0.5"><Minus className="h-3 w-3" />Flat</span>
  return pct > 0 ? (
    <span className="text-xs text-emerald-600 flex items-center gap-0.5"><ArrowUp className="h-3 w-3" />{pct.toFixed(0)}%</span>
  ) : (
    <span className="text-xs text-red-500 flex items-center gap-0.5"><ArrowDown className="h-3 w-3" />{Math.abs(pct).toFixed(0)}%</span>
  )
}

function EarningsTile({
  icon: Icon,
  iconBg,
  label,
  primary,
  secondary,
  sub,
  delta,
}: {
  icon: React.ElementType
  iconBg: string
  label: string
  primary: string
  secondary?: string
  sub?: string
  delta?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', iconBg)}>
          <Icon className="h-4 w-4" />
        </div>
        {delta}
      </div>
      <div>
        <p className="text-2xl font-medium text-gray-900">{primary}</p>
        {secondary && <p className="text-sm text-gray-500 mt-0.5">{secondary}</p>}
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
    </div>
  )
}

function PlanBar({ free, ppl, sub }: { free: number; ppl: number; sub: number }) {
  const total = free + ppl + sub
  if (total === 0) return null
  const freeW = (free / total) * 100
  const pplW  = (ppl / total) * 100
  const subW  = (sub / total) * 100
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan distribution — {total} claimed</p>
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        {freeW > 0 && <div className="bg-gray-300 rounded-l-full" style={{ width: `${freeW}%` }} title={`Free: ${free}`} />}
        {pplW  > 0 && <div className="bg-violet-400"              style={{ width: `${pplW}%`  }} title={`PPL: ${ppl}`} />}
        {subW  > 0 && <div className="bg-cyan-500 rounded-r-full" style={{ width: `${subW}%`  }} title={`Sub: ${sub}`} />}
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-gray-300 inline-block" />Free <span className="font-semibold text-gray-900">{free}</span></div>
        <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-violet-400 inline-block" />Pay per lead <span className="font-semibold text-gray-900">{ppl}</span></div>
        <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-cyan-500 inline-block" />Subscription <span className="font-semibold text-gray-900">{sub}</span></div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [patientStats, setPatientStats] = useState<PatientStats | null>(null)

  useEffect(() => {
    fetch('/directory/api/admin/stats').then((r) => r.json()).then(setStats).catch(() => {})
    fetch('/directory/api/admin/earnings').then((r) => r.ok ? r.json() : null).then(setEarnings).catch(() => {})
    fetch('/directory/api/admin/patient-stats').then((r) => r.ok ? r.json() : null).then(setPatientStats).catch(() => {})
  }, [])

  const pending = stats ? stats.pendingClaims : 0

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">

        {/* Directory stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STAT_CARDS.map(({ key, label, href, icon: Icon, color }) => (
            <Link
              key={key}
              href={href}
              className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-2xl font-medium text-gray-900">
                  {stats ? stats[key].toLocaleString() : <span className="text-gray-300">-</span>}
                </div>
                <div className="mt-0.5 text-sm text-gray-500">{label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pending approvals */}
        {pending > 0 && stats && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                {pending} pending approval{pending !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Claims and new listing registrations awaiting review
              </p>
            </div>
            <Link href="/admin/claims" className="text-xs font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2">
              Review claims
            </Link>
          </div>
        )}

        {stats && pending === 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm font-medium text-emerald-800">
            No pending approvals.
          </div>
        )}

        {/* Pending unlink requests */}
        {stats && stats.pendingUnlinkRequests > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Link2Off className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                {stats.pendingUnlinkRequests} Core unlink request{stats.pendingUnlinkRequests !== 1 ? 's' : ''} pending
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Clinic{stats.pendingUnlinkRequests !== 1 ? 's have' : ' has'} requested to disconnect from Consentz Core
              </p>
            </div>
            <Link
              href="/admin/unlink-requests"
              className="text-xs font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2"
            >
              Review
            </Link>
          </div>
        )}

        {/* Pending directory removal requests */}
        {stats && stats.pendingDirectoryRemovalRequests > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Trash2 className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                {stats.pendingDirectoryRemovalRequests} directory removal request{stats.pendingDirectoryRemovalRequests !== 1 ? 's' : ''} pending
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Clinic{stats.pendingDirectoryRemovalRequests !== 1 ? 's have' : ' has'} asked to be removed from the directory
              </p>
            </div>
            <Link
              href="/admin/directory-removal-requests"
              className="text-xs font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2"
            >
              Review
            </Link>
          </div>
        )}

        {/* ── Earnings ─────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Revenue</h2>
            <p className="text-xs text-gray-500">Across all clinics · all time</p>
          </div>

          {earnings ? (
            <>
              {/* Top-line totals */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <EarningsTile
                  icon={RotateCcw}
                  iconBg="bg-cyan-50 text-cyan-600"
                  label="Monthly recurring (MRR)"
                  primary={`£${fmt(earnings.totals.mrr)}`}
                  secondary={`${earnings.subscription.activeCount} active subscription${earnings.subscription.activeCount !== 1 ? 's' : ''}`}
                  sub="£99 × active subscription clinics"
                  delta={<Delta current={earnings.subscription.newThisMonth} previous={earnings.subscription.newLastMonth} />}
                />
                <EarningsTile
                  icon={Percent}
                  iconBg="bg-orange-50 text-orange-600"
                  label="Directory commission (all time)"
                  primary={`£${fmt(earnings.commission.allTime)}`}
                  secondary={`This month: £${fmt(earnings.commission.thisMonth)}`}
                  sub="18% PPL · 5% subscription teleconsults"
                  delta={<Delta current={earnings.commission.thisMonth} previous={earnings.commission.lastMonth} />}
                />
                <EarningsTile
                  icon={TrendingUp}
                  iconBg="bg-blue-50 text-blue-600"
                  label="This month (PPL + deposits)"
                  primary={`£${fmt(earnings.totals.thisMonth)}`}
                  delta={<Delta current={earnings.totals.thisMonth} previous={earnings.totals.lastMonth} />}
                />
                <EarningsTile
                  icon={PoundSterling}
                  iconBg="bg-emerald-50 text-emerald-600"
                  label="Total one-time (all time)"
                  primary={`£${fmt(earnings.totals.allTime)}`}
                  secondary="PPL + booking deposits"
                  sub="Excludes subscription MRR"
                />
              </div>

              {/* By type */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Subscriptions */}
                <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100">
                      <RotateCcw className="h-3.5 w-3.5 text-cyan-700" />
                    </div>
                    <p className="text-xs font-semibold text-cyan-800 uppercase tracking-wide">Subscriptions</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-cyan-700">Active clinics</span>
                      <span className="font-semibold text-cyan-900">{earnings.subscription.activeCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-cyan-700">MRR</span>
                      <span className="font-semibold text-cyan-900">£{fmt(earnings.subscription.mrr)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-cyan-700">New this month</span>
                      <span className="font-semibold text-cyan-900">+{earnings.subscription.newThisMonth}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-cyan-700">New last month</span>
                      <span className="font-semibold text-cyan-900">+{earnings.subscription.newLastMonth}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-cyan-600">£99/mo × active clinics. Collected by Stripe Billing.</p>
                </div>

                {/* Pay per lead */}
                <div className="rounded-lg border border-violet-100 bg-violet-50 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
                      <Unlock className="h-3.5 w-3.5 text-violet-700" />
                    </div>
                    <p className="text-xs font-semibold text-violet-800 uppercase tracking-wide">Pay Per Lead</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-violet-700">All-time unlocks</span>
                      <span className="font-semibold text-violet-900">{earnings.payPerLead.allTimeCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-violet-700">All-time revenue</span>
                      <span className="font-semibold text-violet-900">£{fmt(earnings.payPerLead.allTimeRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-violet-700">This month</span>
                      <span className="font-semibold text-violet-900">
                        {earnings.payPerLead.thisMonthCount} · £{fmt(earnings.payPerLead.thisMonthRev)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-violet-700">Last month</span>
                      <span className="font-semibold text-violet-900">
                        {earnings.payPerLead.lastMonthCount} · £{fmt(earnings.payPerLead.lastMonthRev)}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-violet-600">£{PPL_LEAD_PRICE} per lead unlock. One-time Stripe payment.</p>
                </div>

                {/* Booking deposits */}
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
                      <CalendarDays className="h-3.5 w-3.5 text-emerald-700" />
                    </div>
                    <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Booking Deposits</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-700">All-time bookings</span>
                      <span className="font-semibold text-emerald-900">{earnings.bookingDeposits.allTimeCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-700">All-time gross</span>
                      <span className="font-semibold text-emerald-900">£{fmt(earnings.bookingDeposits.allTimeRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-700">This month</span>
                      <span className="font-semibold text-emerald-900">£{fmt(earnings.bookingDeposits.thisMonthRev)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-700">Last month</span>
                      <span className="font-semibold text-emerald-900">£{fmt(earnings.bookingDeposits.lastMonthRev)}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-600">Patient deposits paid at booking time via Stripe.</p>
                </div>

                {/* Directory commission */}
                <div className="rounded-lg border border-orange-100 bg-orange-50 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100">
                      <Percent className="h-3.5 w-3.5 text-orange-700" />
                    </div>
                    <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide">Directory Commission</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-700">All-time commission</span>
                      <span className="font-semibold text-orange-900">£{fmt(earnings.commission.allTime)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-700">This month</span>
                      <span className="font-semibold text-orange-900">£{fmt(earnings.commission.thisMonth)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-700">Last month</span>
                      <span className="font-semibold text-orange-900">£{fmt(earnings.commission.lastMonth)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-orange-100 pt-2">
                      <span className="text-orange-700">PPL (18%) — {earnings.bookingDeposits.byPlan.pay_per_lead.count} booking{earnings.bookingDeposits.byPlan.pay_per_lead.count !== 1 ? 's' : ''}, £{fmt(earnings.bookingDeposits.byPlan.pay_per_lead.gross)} gross</span>
                      <span className="font-semibold text-orange-900">£{fmt(earnings.commission.fromPpl)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-700">Subscription (5%) — {earnings.bookingDeposits.byPlan.subscription.count} booking{earnings.bookingDeposits.byPlan.subscription.count !== 1 ? 's' : ''}, £{fmt(earnings.bookingDeposits.byPlan.subscription.gross)} gross</span>
                      <span className="font-semibold text-orange-900">£{fmt(earnings.commission.fromSub)}</span>
                    </div>
                    {(earnings.bookingDeposits.byPlan.free.count > 0 || earnings.bookingDeposits.byPlan.unknown.count > 0) && (
                      <div className="flex justify-between text-sm text-orange-500">
                        <span>No plan / free — {(earnings.bookingDeposits.byPlan.free.count + earnings.bookingDeposits.byPlan.unknown.count)} booking(s), £{fmt(earnings.bookingDeposits.byPlan.free.gross + earnings.bookingDeposits.byPlan.unknown.gross)} gross</span>
                        <span>£0.00</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-orange-600">
                    {earnings.commission.bookingCount} paid booking{earnings.commission.bookingCount !== 1 ? 's' : ''} · £{fmt(earnings.commission.grossTotal)} gross · commission applied per clinic plan
                  </p>
                </div>
              </div>

              {/* Plan distribution bar */}
              <PlanBar
                free={earnings.planBreakdown.free}
                ppl={earnings.planBreakdown.pay_per_lead}
                sub={earnings.planBreakdown.subscription}
              />
            </>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              Loading revenue data…
            </div>
          )}
        </div>

        {/* ── Patients & Prospects ─────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Patients &amp; Prospects</h2>
            <p className="text-xs text-gray-500">Registered patient accounts · all time</p>
          </div>

          {patientStats ? (
            <>
              {/* Top-line patient counts */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <EarningsTile
                  icon={Users}
                  iconBg="bg-indigo-50 text-indigo-600"
                  label="Registered patients"
                  primary={patientStats.patients.total.toLocaleString()}
                  secondary={`+${patientStats.patients.newThisMonth} this month`}
                  delta={<Delta current={patientStats.patients.newThisMonth} previous={patientStats.patients.newLastMonth} />}
                />
                <EarningsTile
                  icon={UserCheck}
                  iconBg="bg-emerald-50 text-emerald-600"
                  label="With bookings"
                  primary={patientStats.patients.withBookings.toLocaleString()}
                  secondary={`${patientStats.patients.total > 0 ? Math.round((patientStats.patients.withBookings / patientStats.patients.total) * 100) : 0}% of all patients`}
                />
                <EarningsTile
                  icon={MessageSquare}
                  iconBg="bg-blue-50 text-blue-600"
                  label="With chat sessions"
                  primary={patientStats.patients.withChats.toLocaleString()}
                  secondary={`${patientStats.patients.total > 0 ? Math.round((patientStats.patients.withChats / patientStats.patients.total) * 100) : 0}% of all patients`}
                />
                <EarningsTile
                  icon={BookOpen}
                  iconBg="bg-violet-50 text-violet-600"
                  label="Total leads generated"
                  primary={patientStats.leads.total.toLocaleString()}
                  secondary={`+${patientStats.leads.thisMonth} this month`}
                  delta={<Delta current={patientStats.leads.thisMonth} previous={patientStats.leads.lastMonth} />}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Auth method breakdown */}
                <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sign-in methods</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">
                        <Chrome className="h-3.5 w-3.5 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Google</span>
                          <span className="font-semibold text-gray-900">{patientStats.patients.authMethods.google}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full bg-red-400 rounded-full"
                            style={{ width: patientStats.patients.total > 0 ? `${(patientStats.patients.authMethods.google / patientStats.patients.total) * 100}%` : '0%' }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100">
                        <Apple className="h-3.5 w-3.5 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Apple</span>
                          <span className="font-semibold text-gray-900">{patientStats.patients.authMethods.apple}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full bg-gray-700 rounded-full"
                            style={{ width: patientStats.patients.total > 0 ? `${(patientStats.patients.authMethods.apple / patientStats.patients.total) * 100}%` : '0%' }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                        <Mail className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Magic link</span>
                          <span className="font-semibold text-gray-900">{patientStats.patients.authMethods.magicLink}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full bg-blue-400 rounded-full"
                            style={{ width: patientStats.patients.total > 0 ? `${(patientStats.patients.authMethods.magicLink / patientStats.patients.total) * 100}%` : '0%' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lead breakdown */}
                <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lead breakdown</p>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total leads</span>
                      <span className="font-semibold text-gray-900">{patientStats.leads.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Callback requests</span>
                      <span className="font-semibold text-gray-900">{patientStats.leads.byType.callback}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pricing enquiries</span>
                      <span className="font-semibold text-gray-900">{patientStats.leads.byType.pricing}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-2.5 flex justify-between text-sm">
                      <span className="text-gray-600">Unlocked by clinics</span>
                      <span className="font-semibold text-emerald-700">
                        {patientStats.leads.unlocked}
                        {patientStats.leads.total > 0 && (
                          <span className="text-gray-400 font-normal ml-1">
                            ({Math.round((patientStats.leads.unlocked / patientStats.leads.total) * 100)}%)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ghost leads (unclaimed clinics)</span>
                      <span className="font-semibold text-amber-600">{patientStats.leads.ghost}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">This month</span>
                      <span className="flex items-center gap-2 font-semibold text-gray-900">
                        {patientStats.leads.thisMonth}
                        <Delta current={patientStats.leads.thisMonth} previous={patientStats.leads.lastMonth} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              Loading patient data…
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  )
}
