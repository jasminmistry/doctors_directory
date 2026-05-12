import { redirect } from 'next/navigation'
import { getPortalUser } from '@/lib/portal'
import { prisma } from '@/lib/db'
import { PortalCalendarView } from '@/components/portal/portal-calendar-view'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const user = await getPortalUser()
  if (!user || !user.clinicId) redirect('/portal/login')

  const clinic = await prisma.clinic.findUnique({
    where: { id: user.clinicId },
    select: { claimedPlan: true, name: true },
  })

  if (!clinic?.claimedPlan) {
    return null
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your appointments. Click <strong>New Appointment</strong> to manually book a patient.
            {clinic.claimedPlan === 'subscription' && ' Bookings synced from Consentz Core appear automatically.'}
          </p>
        </div>
      </div>
      <PortalCalendarView />
    </div>
  )
}
