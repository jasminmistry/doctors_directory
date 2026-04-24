'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { PractitionerForm } from '@/components/admin/forms/PractitionerForm'

export default function PractitionerEditor() {
  return (
    <AdminLayout title="Practitioners">
      <PractitionerForm />
    </AdminLayout>
  )
}
