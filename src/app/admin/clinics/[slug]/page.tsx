'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { ClinicForm } from '@/components/admin/forms/ClinicForm'

export default function ClinicEditor() {
  return (
    <AdminLayout title="Clinics">
      <ClinicForm />
    </AdminLayout>
  )
}
