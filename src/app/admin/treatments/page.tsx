'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DataTable } from '@/components/admin/DataTable'
import { DEFAULT_PERSON, FallbackImage } from '@/components/ui/fallback-image'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'

export const dynamic = 'force-dynamic'

const columns = [
  {
    key: 'image',
    label: 'Image',
    sortable: false,
    searchable: false,
    render: (value: string, item: any) => {
      const src = String(item.imageUrl ?? item.image ?? value ?? '').replaceAll('"', '').trim()
      return src
        ? <FallbackImage src={src} alt="Treatment" className="w-9 h-9 rounded-lg object-cover" fallback={DEFAULT_PERSON} />
        : <div className="w-9 h-9 rounded-lg bg-gray-100" />
    },
  },
  { key: 'name', label: 'Name' },
  { key: 'slug', label: 'Slug' },
  {
    key: 'description',
    label: 'Description',
    sortable: false,
    render: (value: string) =>
      value ? <span className="block max-w-xs truncate text-gray-600">{value}</span> : <span className="text-gray-300">—</span>,
  },
]

export default function TreatmentsList() {
  const [treatments, setTreatments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { confirm, dialog } = useConfirmDialog()

  useEffect(() => {
    fetch('/directory/api/admin/treatments/')
      .then((r) => r.json())
      .then((data) => { setTreatments(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <AdminLayout title="Treatments">
      {dialog}
      <DataTable
        data={treatments}
        columns={columns}
        loading={loading}
        onEdit={(t) => router.push(`/admin/treatments/${t.slug}`)}
        onDelete={async (t) => {
          const name = t.name || t.slug
          const ok = await confirm({
            title: 'Delete treatment?',
            description: `This will permanently delete "${name}". This action cannot be undone.`,
            confirmLabel: 'Delete treatment',
          })
          if (!ok) return
          await fetch(`/directory/api/admin/treatments/${t.slug}`, { method: 'DELETE' })
          setTreatments((prev) => prev.filter((r) => r.slug !== t.slug))
        }}
        onAdd={() => router.push('/admin/treatments/new')}
        addLabel="Add Treatment"
      />
    </AdminLayout>
  )
}
