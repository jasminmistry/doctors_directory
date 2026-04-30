'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { ClinicForm } from '@/components/admin/forms/ClinicForm'

export const dynamic = 'force-dynamic'

export default function ClinicEditor() {
  return (
    <AdminLayout title="Clinics">
      <ClinicForm />
    </AdminLayout>
  )
}
