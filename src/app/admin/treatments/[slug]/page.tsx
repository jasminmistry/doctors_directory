'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { TreatmentForm } from '@/components/admin/forms/TreatmentForm'

export const dynamic = 'force-dynamic'

export default function TreatmentEditor() {
  return (
    <AdminLayout title="Treatments">
      <TreatmentForm />
    </AdminLayout>
  )
}
