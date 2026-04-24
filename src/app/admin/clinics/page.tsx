'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DataTable } from '@/components/admin/DataTable'
import { DEFAULT_PERSON, FallbackImage } from '@/components/ui/fallback-image'

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
  { key: 'name', label: 'Name' },
  { key: 'slug', label: 'Slug' },
  { key: 'category', label: 'Category' },
  { key: 'gmapsAddress', label: 'Address', render: (value: string) => value ? <span className="block max-w-xs truncate text-gray-500">{value}</span> : <span className="text-gray-300">—</span> },
  {
    key: 'rating',
    label: 'Rating',
    render: (value: number) => value ? <span className="text-amber-600 font-medium">{value}</span> : <span className="text-gray-300">—</span>,
  },
]

export default function ClinicsList() {
  const [clinics, setClinics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/directory/api/admin/clinics')
      .then((r) => r.json())
      .then((data) => { setClinics(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <AdminLayout title="Clinics">
      <DataTable
        data={clinics}
        columns={columns}
        loading={loading}
        onEdit={(clinic) => router.push(`/admin/clinics/${clinic.slug}`)}
        onDelete={async (clinic) => {
          if (!confirm(`Delete clinic "${clinic.name || clinic.slug}"?`)) return
          await fetch(`/directory/api/admin/clinics/${clinic.slug}`, { method: 'DELETE' })
          setClinics((prev) => prev.filter((c) => c.slug !== clinic.slug))
        }}
        onAdd={() => router.push('/admin/clinics/new')}
        addLabel="Add Clinic"
      />
    </AdminLayout>
  )
}
