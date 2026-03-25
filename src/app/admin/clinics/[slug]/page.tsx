"use client";
import AdminForm from "@/components/admin/AdminForm";

export default function ClinicEditor() {
  return (
    <AdminForm
      entityType="clinics"
      apiBasePath="/directory/api/admin/pending/clinics"
      redirectPath="/admin/clinics"
    />
  );
}