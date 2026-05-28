import { redirect } from 'next/navigation'
import { getPortalUser } from '@/lib/portal'
import { PortalScheduleView } from '@/components/portal/portal-schedule-view'

export const dynamic = 'force-dynamic'

export default async function PractitionerSchedulePage() {
  const user = await getPortalUser()
  if (!user || !user.practitionerId) redirect('/portal/login')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Schedule</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set your weekly availability. Patients can only book appointments on enabled days within these times.
        </p>
      </div>
      <PortalScheduleView />
    </div>
  )
}
