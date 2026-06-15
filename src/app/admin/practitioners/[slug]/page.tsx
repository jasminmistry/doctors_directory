'use client'

import { useParams } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { PractitionerForm } from '@/components/admin/forms/PractitionerForm'
import { AdminScheduleCard } from '@/components/admin/AdminScheduleCard'
import { EntityMetricsPanel } from '@/components/admin/entity-metrics-panel'

export const dynamic = 'force-dynamic'

export default function PractitionerEditor() {
  const params = useParams()
  const slug = params?.slug as string | undefined

  return (
    <AdminLayout title="Practitioners">
      <PractitionerForm />
      {slug && slug !== 'new' && (
        <div className="mt-8">
          <EntityMetricsPanel entityType="practitioner" slug={slug} />
        </div>
      )}
      {slug && slug !== 'new' && (
        <div className="mt-8">
          <AdminScheduleCard entityType="practitioner" slug={slug} />
        </div>
      )}
    </AdminLayout>
  )
}
