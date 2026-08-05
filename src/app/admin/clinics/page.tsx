'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DataTable } from '@/components/admin/DataTable'
import { DEFAULT_PERSON, FallbackImage } from '@/components/ui/fallback-image'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'

export const dynamic = 'force-dynamic'

const PLAN_LABELS: Record<string, string> = {
  subscription: 'Subscription',
  pay_per_lead: 'Pay Per Lead',
  free: 'Free',
}

const PLAN_COLORS: Record<string, string> = {
  subscription: 'bg-cyan-100 text-cyan-700',
  pay_per_lead: 'bg-violet-100 text-violet-700',
  free: 'bg-gray-100 text-gray-600',
}

const columns = [
  {
    key: 'image',
    label: 'Image',
    sortable: false,
    searchable: false,
    render: (value: string) => (
      value
        ? <FallbackImage src={value.replaceAll('"', '')} alt="Clinic" className="w-9 h-9 rounded-lg object-cover" fallback={DEFAULT_PERSON} />
        : <div className="w-9 h-9 rounded-lg bg-gray-100" />
    ),
  },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email', render: (value: string) => value ? <span className="text-gray-600 text-xs">{value}</span> : <span className="text-gray-300">—</span> },
  { key: 'gmapsPhone', label: 'Phone', render: (value: string) => value ? <span className="text-gray-600 text-xs whitespace-nowrap">{value}</span> : <span className="text-gray-300">—</span> },
  { key: 'gmapsAddress', label: 'Address', render: (value: string) => value ? <span className="block max-w-xs text-gray-600 text-xs leading-snug">{value}</span> : <span className="text-gray-300">—</span> },
  {
    key: 'claimed',
    label: 'Claimed',
    render: (value: boolean) => value
      ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Claimed</span>
      : <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Unclaimed</span>,
  },
  {
    key: 'idVerified',
    label: 'Verified',
    render: (value: boolean) => value
      ? <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Verified</span>
      : <span className="text-gray-300 text-xs">—</span>,
  },
  {
    key: 'claimedPlan',
    label: 'Plan',
    render: (value: string | null) => value
      ? <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PLAN_COLORS[value] ?? 'bg-gray-100 text-gray-600'}`}>{PLAN_LABELS[value] ?? value}</span>
      : <span className="text-gray-300 text-xs">—</span>,
  },
  {
    key: 'rating',
    label: 'Rating',
    render: (value: number) => value ? <span className="text-amber-600 font-medium">{value}</span> : <span className="text-gray-300">—</span>,
  },
]

export default function ClinicsList() {
  const [clinics, setClinics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterClaimed, setFilterClaimed] = useState<'all' | 'claimed' | 'unclaimed'>('all')
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all')
  const router = useRouter()
  const { confirm, dialog } = useConfirmDialog()

  useEffect(() => {
    fetch('/directory/api/admin/clinics/')
      .then((r) => r.json())
      .then((data) => {
        const rows = Array.isArray(data) ? data : []
        setClinics(rows.map((c) => ({
          ...c,
          name: c.name || c.slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        })))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return clinics.filter((c) => {
      if (filterClaimed === 'claimed' && !c.claimed) return false
      if (filterClaimed === 'unclaimed' && c.claimed) return false
      if (filterVerified === 'verified' && !c.idVerified) return false
      if (filterVerified === 'unverified' && c.idVerified) return false
      return true
    })
  }, [clinics, filterClaimed, filterVerified])

  const filterControls = (
    <>
      <Select value={filterClaimed} onValueChange={(v) => setFilterClaimed(v as typeof filterClaimed)}>
        <SelectTrigger className="h-9 w-36 text-sm">
          <SelectValue placeholder="Claimed" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All clinics</SelectItem>
          <SelectItem value="claimed">Claimed only</SelectItem>
          <SelectItem value="unclaimed">Unclaimed only</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterVerified} onValueChange={(v) => setFilterVerified(v as typeof filterVerified)}>
        <SelectTrigger className="h-9 w-36 text-sm">
          <SelectValue placeholder="Verified" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any verified</SelectItem>
          <SelectItem value="verified">Verified only</SelectItem>
          <SelectItem value="unverified">Unverified only</SelectItem>
        </SelectContent>
      </Select>

      {(filterClaimed !== 'all' || filterVerified !== 'all') && (
        <button
          onClick={() => { setFilterClaimed('all'); setFilterVerified('all') }}
          className="text-xs text-gray-600 underline hover:text-gray-700"
        >
          Clear
        </button>
      )}
    </>
  )

  return (
    <AdminLayout title="Clinics">
      {dialog}
      <DataTable
        data={filtered}
        columns={columns}
        loading={loading}
        filters={filterControls}
        onEdit={(clinic) => router.push(`/admin/clinics/${clinic.slug}`)}
        onDelete={async (clinic) => {
          const name = clinic.name || clinic.slug
          const ok = await confirm({
            title: 'Delete clinic?',
            description: `This will permanently delete "${name}". This action cannot be undone.`,
            confirmLabel: 'Delete clinic',
          })
          if (!ok) return
          await fetch(`/directory/api/admin/clinics/${clinic.slug}/`, { method: 'DELETE' })
          setClinics((prev) => prev.filter((c) => c.slug !== clinic.slug))
        }}
        onAdd={() => router.push('/admin/clinics/new')}
        addLabel="Add Clinic"
      />
    </AdminLayout>
  )
}
