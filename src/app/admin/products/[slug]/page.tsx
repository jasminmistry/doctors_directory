'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { ProductForm } from '@/components/admin/forms/ProductForm'

export const dynamic = 'force-dynamic'

export default function ProductEditor() {
  return (
    <AdminLayout title="Products">
      <ProductForm />
    </AdminLayout>
  )
}
