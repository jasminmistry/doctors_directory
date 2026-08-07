import { redirect } from 'next/navigation'
import { getPortalUser } from '@/lib/portal'
import { PortalScheduleView } from '@/components/portal/portal-schedule-view'
import { WrongAccountNotice } from '@/components/portal/wrong-account-notice'

export const dynamic = 'force-dynamic'

export default async function ClinicSchedulePage() {
  const user = await getPortalUser()
  if (!user) redirect('/portal/login?next=/portal/clinic/schedule')
  if (!user.clinicId) {
    return (
      <WrongAccountNotice
        next="/portal/clinic/schedule"
      />
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl text-gray-900">Schedule</h1>
        <p className="mt-1 text-sm text-gray-600">
          Set your weekly opening hours. Patients can only book appointments on enabled days within these times.
        </p>
      </div>
      <PortalScheduleView />
    </div>
  )
}
