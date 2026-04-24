'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Building2, Clock, Package, Stethoscope, Users } from 'lucide-react'

interface Stats {
  clinics: number
  practitioners: number
  products: number
  treatments: number
  pendingClinics: number
  pendingPractitioners: number
}

const STAT_CARDS = [
  {
    key: 'clinics' as const,
    label: 'Clinics',
    href: '/admin/clinics',
    icon: Building2,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    key: 'practitioners' as const,
    label: 'Practitioners',
    href: '/admin/practitioners',
    icon: Users,
    color: 'text-violet-600 bg-violet-50',
  },
  {
    key: 'products' as const,
    label: 'Products',
    href: '/admin/products',
    icon: Package,
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    key: 'treatments' as const,
    label: 'Treatments',
    href: '/admin/treatments',
    icon: Stethoscope,
    color: 'text-orange-600 bg-orange-50',
  },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/directory/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  const pending = stats ? stats.pendingClinics + stats.pendingPractitioners : 0

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STAT_CARDS.map(({ key, label, href, icon: Icon, color }) => (
            <Link
              key={key}
              href={href}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats ? stats[key].toLocaleString() : <span className="text-gray-300">-</span>}
                </div>
                <div className="mt-0.5 text-sm text-gray-500">{label}</div>
              </div>
            </Link>
          ))}
        </div>

        {pending > 0 && stats && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                {pending} pending approval{pending !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {stats.pendingClinics > 0 && `${stats.pendingClinics} clinic${stats.pendingClinics !== 1 ? 's' : ''}`}
                {stats.pendingClinics > 0 && stats.pendingPractitioners > 0 && ' · '}
                {stats.pendingPractitioners > 0 && `${stats.pendingPractitioners} practitioner${stats.pendingPractitioners !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex gap-2">
              {stats.pendingClinics > 0 && (
                <Link href="/admin/pending/clinics" className="text-xs font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2">
                  Review clinics
                </Link>
              )}
              {stats.pendingPractitioners > 0 && (
                <Link href="/admin/pending/practitioners" className="text-xs font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2">
                  Review practitioners
                </Link>
              )}
            </div>
          </div>
        )}

        {!stats && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-sm text-gray-500">
            Loading pending approvals...
          </div>
        )}

        {stats && pending === 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm font-medium text-emerald-800">
            No pending approvals.
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
