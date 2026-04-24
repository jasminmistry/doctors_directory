'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DataTable } from '@/components/admin/DataTable'
import { DEFAULT_PERSON, FallbackImage } from '@/components/ui/fallback-image'

const columns = [
  {
    key: 'imageUrl',
    label: 'Image',
    sortable: false,
    render: (value: string) => (
      value
        ? <FallbackImage src={value.replaceAll('"', '')} alt="Practitioner" className="w-9 h-9 rounded-full object-cover" fallback={DEFAULT_PERSON} />
        : <div className="w-9 h-9 rounded-full bg-gray-100" />
    ),
  },
  { key: 'displayName', label: 'Name' },
  { key: 'slug', label: 'Slug' },
  { key: 'specialty', label: 'Specialty' },
  { key: 'title', label: 'Title', render: (value: string) => value || <span className="text-gray-300">—</span> },
]

export default function PractitionersList() {
  const [practitioners, setPractitioners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/directory/api/admin/practitioners')
      .then((r) => r.json())
      .then((data) => { setPractitioners(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <AdminLayout title="Practitioners">
      <DataTable
        data={practitioners}
        columns={columns}
        loading={loading}
        onEdit={(p) => router.push(`/admin/practitioners/${p.slug}`)}
        onDelete={async (p) => {
          if (!confirm(`Delete practitioner "${p.displayName || p.slug}"?`)) return
          await fetch(`/directory/api/admin/practitioners/${p.slug}`, { method: 'DELETE' })
          setPractitioners((prev) => prev.filter((r) => r.slug !== p.slug))
        }}
        onAdd={() => router.push('/admin/practitioners/new')}
        addLabel="Add Practitioner"
      />
    </AdminLayout>
  )
}
