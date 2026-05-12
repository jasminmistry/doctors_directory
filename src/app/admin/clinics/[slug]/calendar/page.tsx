import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { AdminCalendarView } from '@/components/admin/admin-calendar-view'

interface Props {
  params: { slug: string }
}

export default async function AdminClinicCalendarPage({ params }: Props) {
  const clinic = await prisma.clinic.findUnique({
    where: { slug: params.slug },
    select: { id: true, name: true, slug: true, claimedPlan: true },
  })

  if (!clinic) notFound()

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{clinic.name ?? clinic.slug} — Calendar</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Plan: <span className="font-medium capitalize">{clinic.claimedPlan?.replace('_', ' ') ?? 'unclaimed'}</span>
            {clinic.claimedPlan !== 'subscription' && (
              <span className="ml-2 text-amber-600">(Calendar sync requires Verified Subscription)</span>
            )}
          </p>
        </div>
        <a
          href={`/directory/admin/clinics/${params.slug}`}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          ← Back to clinic
        </a>
      </div>

      <AdminCalendarView slug={params.slug} />
    </div>
  )
}
