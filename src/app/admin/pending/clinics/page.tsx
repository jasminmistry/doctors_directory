'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DataTable } from '@/components/admin/DataTable'
import { DEFAULT_PERSON, FallbackImage } from '@/components/ui/fallback-image'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
}

const columns = [
  {
    key: 'image',
    label: 'Image',
    sortable: false,
    render: (value: string) => (
      value
        ? <FallbackImage src={value.replaceAll('"', '')} alt="Clinic" className="w-9 h-9 rounded-lg object-cover" fallback={DEFAULT_PERSON} />
        : <div className="w-9 h-9 rounded-lg bg-gray-100" />
    ),
  },
  { key: 'slug', label: 'Slug' },
  { key: 'category', label: 'Category' },
  { key: 'City', label: 'City' },
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

export default function PendingClinicsPage() {
  const [clinics, setClinics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/directory/api/admin/pending/clinics')
      .then((r) => r.json())
      .then((data) => { setClinics(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <AdminLayout title="Pending Clinics">
      <DataTable
        data={clinics}
        columns={columns}
        loading={loading}
        onEdit={(clinic) => router.push(`/admin/clinics/${clinic.slug}`)}
        onApprove={async (clinic) => {
          const res = await fetch('/directory/api/admin/pending/clinics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clinic),
          })
          if (res.ok) {
            toast.success(`Clinic "${clinic.slug}" approved`)
            setClinics((prev) => prev.filter((c) => c._pendingId !== clinic._pendingId))
          } else {
            toast.error('Failed to approve clinic')
          }
        }}
      />
    </AdminLayout>
  )
}
