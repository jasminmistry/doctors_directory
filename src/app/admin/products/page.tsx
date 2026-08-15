'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DataTable } from '@/components/admin/DataTable'
import { DEFAULT_PRODUCT, FallbackImage } from '@/components/ui/fallback-image'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'

export const dynamic = 'force-dynamic'

const columns = [
  {
    key: 'imageUrl',
    label: 'Image',
    sortable: false,
    searchable: false,
    render: (value: string) => (
      value
        ? <FallbackImage src={value.replaceAll('"', '')} alt="Product" className="w-9 h-9 rounded-lg object-cover" fallback={DEFAULT_PRODUCT} />
        : <div className="w-9 h-9 rounded-lg bg-gray-100" />
    ),
  },
  { key: 'productName', label: 'Product Name' },
  { key: 'slug', label: 'Slug' },
  { key: 'productCategory', label: 'Category' },
  { key: 'brand', label: 'Brand', render: (value: string) => value || <span className="text-gray-300">—</span> },
]

export default function ProductsList() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { confirm, dialog } = useConfirmDialog()

  useEffect(() => {
    fetch('/directory/api/admin/products/')
      .then((r) => r.json())
      .then((data) => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <AdminLayout title="Products">
      {dialog}
      <DataTable
        data={products}
        columns={columns}
        loading={loading}
        onEdit={(p) => router.push(`/admin/products/${p.slug}`)}
        onDelete={async (p) => {
          const name = p.productName || p.slug
          const ok = await confirm({
            title: 'Delete product?',
            description: `This will permanently delete "${name}". This action cannot be undone.`,
            confirmLabel: 'Delete product',
          })
          if (!ok) return
          await fetch(`/directory/api/admin/products/${p.slug}`, { method: 'DELETE' })
          setProducts((prev) => prev.filter((r) => r.slug !== p.slug))
        }}
        onAdd={() => router.push('/admin/products/new')}
        addLabel="Add Product"
      />
    </AdminLayout>
  )
}
