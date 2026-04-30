'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DataTable } from '@/components/admin/DataTable'
import { DEFAULT_PRODUCT, FallbackImage } from '@/components/ui/fallback-image'

export const dynamic = 'force-dynamic'

const columns = [
  {
    key: 'imageUrl',
    label: 'Image',
    sortable: false,
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

  useEffect(() => {
    fetch('/directory/api/admin/products')
      .then((r) => r.json())
      .then((data) => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <AdminLayout title="Products">
      <DataTable
        data={products}
        columns={columns}
        loading={loading}
        onEdit={(p) => router.push(`/admin/products/${p.slug}`)}
        onDelete={async (p) => {
          if (!confirm(`Delete product "${p.productName || p.slug}"?`)) return
          await fetch(`/directory/api/admin/products/${p.slug}`, { method: 'DELETE' })
          setProducts((prev) => prev.filter((r) => r.slug !== p.slug))
        }}
        onAdd={() => router.push('/admin/products/new')}
        addLabel="Add Product"
      />
    </AdminLayout>
  )
}
