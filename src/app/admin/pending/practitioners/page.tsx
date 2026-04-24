'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DataTable } from '@/components/admin/DataTable'
import { DEFAULT_PERSON, FallbackImage } from '@/components/ui/fallback-image'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
}

const columns = [
  {
    key: 'practitioner_image_link',
    label: 'Image',
    sortable: false,
    render: (value: string) => (
      value
        ? <FallbackImage src={value.replaceAll('"', '')} alt="Practitioner" className="w-9 h-9 rounded-lg object-cover" fallback={DEFAULT_PERSON} />
        : <div className="w-9 h-9 rounded-lg bg-gray-100" />
    ),
  },
  { key: 'practitioner_name', label: 'Name' },
  { key: 'practitioner_title', label: 'Title' },
  { key: 'practitioner_specialty', label: 'Specialty' },
  {
    key: 'submittedAt',
    label: 'Submitted',
    render: (value: string) =>
      value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: string) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[value] ?? 'bg-gray-100 text-gray-600'}`}>
        {value ?? 'pending'}
      </span>
    ),
  },
]

export default function PendingPractitionersPage() {
  const [practitioners, setPractitioners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/directory/api/admin/pending/practitioners')
      .then((r) => r.json())
      .then((data) => { setPractitioners(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <AdminLayout title="Pending Practitioners">
      <DataTable
        data={practitioners}
        columns={columns}
        loading={loading}
        onEdit={(p) => router.push(`/admin/practitioners/${p.slug}`)}
        onApprove={async (p) => {
          const res = await fetch('/directory/api/admin/pending/practitioners', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(p),
          })
          if (res.ok) {
            toast.success(`Practitioner "${p.practitioner_name || p.slug}" approved`)
            setPractitioners((prev) => prev.filter((r) => r._pendingId !== p._pendingId))
          } else {
            toast.error('Failed to approve practitioner')
          }
        }}
      />
    </AdminLayout>
  )
}
