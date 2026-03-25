'use client'
import AdminForm from "@/components/admin/AdminForm"

export default function PractitionerEditor() {
  return (
    <AdminForm
      entityType="practitioners"
      apiBasePath="/directory/api/admin/pending/practitioners"
      redirectPath="/admin/practitioners"
    />
  )
}