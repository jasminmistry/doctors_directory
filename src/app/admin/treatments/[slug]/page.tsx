'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { TreatmentForm } from '@/components/admin/forms/TreatmentForm'

export default function TreatmentEditor() {
  return (
    <AdminLayout title="Treatments">
      <TreatmentForm />
    </AdminLayout>
  )
}
