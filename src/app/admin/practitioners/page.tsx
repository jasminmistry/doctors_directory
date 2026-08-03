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
    key: 'imageUrl',
    label: 'Image',
    sortable: false,
    searchable: false,
    render: (value: string) => (
      value
        ? <FallbackImage src={value.replaceAll('"', '')} alt="Practitioner" className="w-9 h-9 rounded-full object-cover" fallback={DEFAULT_PERSON} />
        : <div className="w-9 h-9 rounded-full bg-gray-100" />
    ),
  },
  { key: 'displayName', label: 'Name' },
  { key: 'specialty', label: 'Specialty' },
  {
    key: 'cityName',
    label: 'City',
    render: (value: string | null) => value
      ? <span className="text-sm text-gray-700">{value}</span>
      : <span className="text-xs text-rose-500">Not set</span>,
  },
  {
    key: 'claimed',
    label: 'Claimed',
    render: (value: boolean) => value
      ? <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Claimed</span>
      : <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Unclaimed</span>,
  },
  {
    key: 'verified',
    label: 'Verified',
    render: (value: boolean) => value
      ? <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Verified</span>
      : <span className="text-gray-300 text-xs">—</span>,
  },
  {
    key: 'claimedPlan',
    label: 'Plan',
    render: (value: string | null) => value
      ? <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PLAN_COLORS[value] ?? 'bg-gray-100 text-gray-600'}`}>{PLAN_LABELS[value] ?? value}</span>
      : <span className="text-gray-300 text-xs">—</span>,
  },
]

export default function PractitionersList() {
  const [practitioners, setPractitioners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterClaimed, setFilterClaimed] = useState<'all' | 'claimed' | 'unclaimed'>('all')
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all')
  const router = useRouter()
  const { confirm, dialog } = useConfirmDialog()

  useEffect(() => {
    fetch('/directory/api/admin/practitioners')
      .then((r) => r.json())
      .then((data) => { setPractitioners(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return practitioners.filter((p) => {
      if (filterClaimed === 'claimed' && !p.claimed) return false
      if (filterClaimed === 'unclaimed' && p.claimed) return false
      if (filterVerified === 'verified' && !p.verified) return false
      if (filterVerified === 'unverified' && p.verified) return false
      return true
    })
  }, [practitioners, filterClaimed, filterVerified])

  const filterControls = (
    <>
      <Select value={filterClaimed} onValueChange={(v) => setFilterClaimed(v as typeof filterClaimed)}>
        <SelectTrigger className="h-9 w-36 text-sm">
          <SelectValue placeholder="Claimed" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All practitioners</SelectItem>
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
    <AdminLayout title="Practitioners">
      {dialog}
      <DataTable
        data={filtered}
        columns={columns}
        loading={loading}
        filters={filterControls}
        onEdit={(p) => router.push(`/admin/practitioners/${p.slug}`)}
        onDelete={async (p) => {
          const name = p.displayName || p.slug
          const ok = await confirm({
            title: 'Delete practitioner?',
            description: `This will permanently delete "${name}". This action cannot be undone.`,
            confirmLabel: 'Delete practitioner',
          })
          if (!ok) return
          await fetch(`/directory/api/admin/practitioners/${p.slug}`, { method: 'DELETE' })
          setPractitioners((prev) => prev.filter((r) => r.slug !== p.slug))
        }}
        onAdd={() => router.push('/admin/practitioners/new')}
        addLabel="Add Practitioner"
      />
    </AdminLayout>
  )
}
