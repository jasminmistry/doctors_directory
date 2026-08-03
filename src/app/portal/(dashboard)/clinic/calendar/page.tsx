import { redirect } from 'next/navigation'
import { getPortalUser } from '@/lib/portal'
import { prisma } from '@/lib/db'
import { resolveClinicTimezone } from '@/lib/core-api'
import { PortalCalendarView } from '@/components/portal/portal-calendar-view'
import { WrongAccountNotice } from '@/components/portal/wrong-account-notice'
import { CalendarDays } from 'lucide-react'
import { PPL_LEAD_PRICE, SUBSCRIPTION_MONTHLY_PRICE } from '@/lib/pricing'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const user = await getPortalUser()
  if (!user) redirect('/portal/login?next=/portal/clinic/calendar')
  if (!user.clinicId) {
    return (
      <WrongAccountNotice
        requiredEntityType="clinic"
        currentEntityType={user.entityType}
        next="/portal/clinic/calendar"
      />
    )
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: user.clinicId },
    select: { claimedPlan: true, name: true, coreClinicId: true },
  })

  if (!clinic?.claimedPlan || clinic.claimedPlan === 'free') {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center space-y-4">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <CalendarDays className="h-7 w-7 text-amber-600" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Calendar not available</h1>
        <p className="text-sm text-gray-600">
          The Calendar is available on Pay-Per-Lead (£{PPL_LEAD_PRICE}/lead) and Subscription (£{SUBSCRIPTION_MONTHLY_PRICE}/mo) plans.
          Upgrade your plan to manage appointments and accept online bookings.
        </p>
        <a
          href="/directory/portal/upgrade"
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          View Plans
        </a>
      </div>
    )
  }

  const clinicTimezone = await resolveClinicTimezone(clinic.coreClinicId)

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your appointments. Click <strong>New Appointment</strong> to manually book a patient.
            {clinic.claimedPlan === 'subscription' && ' Bookings from Consentz Core sync here automatically.'}
            {' '}Times are shown in the clinic&apos;s timezone ({clinicTimezone}).
          </p>
        </div>
      </div>
      <PortalCalendarView clinicTimezone={clinicTimezone} />
    </div>
  )
}
