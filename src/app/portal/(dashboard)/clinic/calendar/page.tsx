import { redirect } from 'next/navigation'
import { getPortalUser } from '@/lib/portal'
import { prisma } from '@/lib/db'
import { PortalCalendarView } from '@/components/portal/portal-calendar-view'
import { CalendarDays } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const user = await getPortalUser()
  if (!user || !user.clinicId) redirect('/portal/login')

  const clinic = await prisma.clinic.findUnique({
    where: { id: user.clinicId },
    select: { claimedPlan: true, name: true },
  })

  if (!clinic?.claimedPlan || clinic.claimedPlan === 'free') {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center space-y-4">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <CalendarDays className="h-7 w-7 text-amber-600" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Calendar not available</h1>
        <p className="text-sm text-gray-500">
          The Calendar is available on Pay-Per-Lead (£15/lead) and Subscription (£99/mo) plans.
          Upgrade your plan to manage appointments and accept online bookings.
        </p>
        <a
          href="/portal/clinic/upgrade"
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          View Plans
        </a>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your appointments. Click <strong>New Appointment</strong> to manually book a patient.
            {clinic.claimedPlan === 'subscription' && ' Bookings from Consentz Core sync here automatically.'}
          </p>
        </div>
      </div>
      <PortalCalendarView />
    </div>
  )
}
