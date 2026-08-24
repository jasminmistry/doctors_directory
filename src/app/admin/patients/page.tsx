'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const dynamic = 'force-dynamic'

interface Patient {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  emailVerified: boolean
  createdAt: string
  oauthAccounts: { provider: string }[]
  _count: { bookings: number; chatSessions: number; leads: number }
}

function authMethod(p: Patient): string {
  if (p.oauthAccounts.some((a) => a.provider === 'google')) return 'Google'
  if (p.oauthAccounts.some((a) => a.provider === 'apple')) return 'Apple'
  return 'Magic link'
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAuth, setFilterAuth] = useState<'all' | 'Google' | 'Apple' | 'Magic link'>('all')
  const [filterActivity, setFilterActivity] = useState<'all' | 'bookings' | 'chats' | 'leads'>('all')

  useEffect(() => {
    fetch('/directory/api/admin/patients/', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setPatients(data?.patients ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const rows = useMemo(
    () =>
      patients.map((p) => ({
        ...p,
        name: [p.firstName, p.lastName].filter(Boolean).join(' ') || '—',
        authMethod: authMethod(p),
      })),
    [patients],
  )

  const filtered = useMemo(() => {
    return rows.filter((p) => {
      if (filterAuth !== 'all' && p.authMethod !== filterAuth) return false
      if (filterActivity === 'bookings' && p._count.bookings === 0) return false
      if (filterActivity === 'chats' && p._count.chatSessions === 0) return false
      if (filterActivity === 'leads' && p._count.leads === 0) return false
      return true
    })
  }, [rows, filterAuth, filterActivity])

  const columns: Column<(typeof filtered)[number]>[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email', render: (v: string) => <span className="text-gray-600 text-xs">{v}</span> },
    {
      key: 'phone',
      label: 'Phone',
      render: (v: string | null) => (v ? <span className="text-gray-600 text-xs whitespace-nowrap">{v}</span> : <span className="text-gray-300">—</span>),
    },
    {
      key: 'emailVerified',
      label: 'Verified',
      render: (v: boolean) =>
        v ? (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Verified</span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Unverified</span>
        ),
    },
    { key: 'authMethod', label: 'Sign-in', render: (v: string) => <span className="text-xs text-gray-600">{v}</span> },
    {
      key: 'bookings',
      label: 'Bookings',
      render: (_v: unknown, item) => <span className="text-xs font-medium">{item._count.bookings}</span>,
    },
    {
      key: 'chats',
      label: 'Chats',
      render: (_v: unknown, item) => <span className="text-xs font-medium">{item._count.chatSessions}</span>,
    },
    {
      key: 'leads',
      label: 'Leads',
      render: (_v: unknown, item) => <span className="text-xs font-medium">{item._count.leads}</span>,
    },
    {
      key: 'createdAt',
      label: 'Registered',
      render: (v: string) => <span className="text-xs text-gray-600 whitespace-nowrap">{formatDistanceToNow(new Date(v), { addSuffix: true })}</span>,
    },
  ]

  const filterControls = (
    <>
      <Select value={filterAuth} onValueChange={(v) => setFilterAuth(v as typeof filterAuth)}>
        <SelectTrigger className="h-9 w-36 text-sm">
          <SelectValue placeholder="Sign-in" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any sign-in</SelectItem>
          <SelectItem value="Google">Google</SelectItem>
          <SelectItem value="Apple">Apple</SelectItem>
          <SelectItem value="Magic link">Magic link</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterActivity} onValueChange={(v) => setFilterActivity(v as typeof filterActivity)}>
        <SelectTrigger className="h-9 w-40 text-sm">
          <SelectValue placeholder="Activity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any activity</SelectItem>
          <SelectItem value="bookings">Has bookings</SelectItem>
          <SelectItem value="chats">Has chats</SelectItem>
          <SelectItem value="leads">Has leads</SelectItem>
        </SelectContent>
      </Select>

      {(filterAuth !== 'all' || filterActivity !== 'all') && (
        <button onClick={() => { setFilterAuth('all'); setFilterActivity('all') }} className="text-xs text-gray-600 underline hover:text-gray-700">
          Clear
        </button>
      )}
    </>
  )

  return (
    <AdminLayout title="Patients">
      <DataTable data={filtered} columns={columns} loading={loading} filters={filterControls} />
    </AdminLayout>
  )
}
