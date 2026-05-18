'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ClinicForm } from '@/components/admin/forms/ClinicForm'
import { CalendarDays } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function ClinicEditor() {
  const params = useParams()
  const slug = params?.slug as string | undefined

  return (
    <AdminLayout title="Clinics">
      {slug && slug !== 'new' && (
        <div className="mb-4 flex justify-end">
          <Link
            href={`/directory/admin/clinics/${slug}/calendar`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <CalendarDays className="h-4 w-4 text-gray-500" />
            View Calendar
          </Link>
        </div>
      )}
      <ClinicForm />
    </AdminLayout>
  )
}
