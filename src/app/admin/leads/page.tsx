'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const dynamic = 'force-dynamic'

interface Lead {
  id: number
  patientName: string
  patientPhone: string
  patientEmail: string | null
  treatment: string | null
  source: 'consultation' | 'pricing'
  status: string
  pipelineStatus: string
  isUnlocked: boolean
  isGhostLead: boolean
  createdAt: string
  clinic: { slug: string; name: string | null; claimedPlan: string | null }
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  booked: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-gray-100 text-gray-600',
  spam: 'bg-red-100 text-red-700',
  archived: 'bg-gray-100 text-gray-500',
  closed: 'bg-gray-100 text-gray-600',
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSource, setFilterSource] = useState<'all' | 'consultation' | 'pricing'>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetch('/directory/api/admin/leads/', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setLeads(data?.leads ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (filterSource !== 'all' && l.source !== filterSource) return false
      if (filterStatus !== 'all' && l.pipelineStatus !== filterStatus) return false
      return true
    })
  }, [leads, filterSource, filterStatus])

  const rows = useMemo(
    () =>
      filtered.map((l) => ({
        ...l,
        clinicName: l.clinic.name || l.clinic.slug,
      })),
    [filtered],
  )

  const columns: Column<(typeof rows)[number]>[] = [
    { key: 'patientName', label: 'Patient' },
    {
      key: 'patientPhone',
      label: 'Phone',
      render: (v: string) => <span className="text-gray-600 text-xs whitespace-nowrap">{v}</span>,
    },
    {
      key: 'patientEmail',
      label: 'Email',
      render: (v: string | null) => (v ? <span className="text-gray-600 text-xs">{v}</span> : <span className="text-gray-300">—</span>),
    },
    {
      key: 'clinicName',
      label: 'Clinic',
      render: (_v: string, item) => (
        <a
          href={`/directory/admin/clinics/${item.clinic.slug}`}
          className="text-xs text-gray-700 underline underline-offset-2 hover:text-gray-900"
        >
          {item.clinicName}
        </a>
      ),
    },
    {
      key: 'treatment',
      label: 'Treatment',
      render: (v: string | null) => (v ? <span className="text-xs">{v}</span> : <span className="text-gray-300">—</span>),
    },
    {
      key: 'source',
      label: 'Source',
      render: (v: string) => <span className="text-xs capitalize text-gray-600">{v}</span>,
    },
    {
      key: 'pipelineStatus',
      label: 'Status',
      render: (v: string) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[v] ?? 'bg-gray-100 text-gray-600'}`}>
          {v}
        </span>
      ),
    },
    {
      key: 'isUnlocked',
      label: 'Unlocked',
      render: (v: boolean, item) =>
        item.clinic.claimedPlan === 'pay_per_lead' ? (
          v ? (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Unlocked</span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Locked</span>
          )
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        ),
    },
    {
      key: 'isGhostLead',
      label: 'Ghost',
      render: (v: boolean) =>
        v ? <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Ghost</span> : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      key: 'createdAt',
      label: 'Received',
      render: (v: string) => <span className="text-xs text-gray-600 whitespace-nowrap">{formatDistanceToNow(new Date(v), { addSuffix: true })}</span>,
    },
  ]

  const filterControls = (
    <>
      <Select value={filterSource} onValueChange={(v) => setFilterSource(v as typeof filterSource)}>
        <SelectTrigger className="h-9 w-40 text-sm">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sources</SelectItem>
          <SelectItem value="consultation">Callback requests</SelectItem>
          <SelectItem value="pricing">Pricing enquiries</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="h-9 w-36 text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="contacted">Contacted</SelectItem>
          <SelectItem value="booked">Booked</SelectItem>
          <SelectItem value="lost">Lost</SelectItem>
          <SelectItem value="spam">Spam</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>

      {(filterSource !== 'all' || filterStatus !== 'all') && (
        <button onClick={() => { setFilterSource('all'); setFilterStatus('all') }} className="text-xs text-gray-600 underline hover:text-gray-700">
          Clear
        </button>
      )}
    </>
  )

  return (
    <AdminLayout title="Leads">
      <DataTable data={rows} columns={columns} loading={loading} filters={filterControls} />
    </AdminLayout>
  )
}
