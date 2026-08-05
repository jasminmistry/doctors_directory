import { redirect } from 'next/navigation'
import { getPortalUser } from '@/lib/portal'
import { prisma } from '@/lib/db'
import { PractitionerEvents } from '@/components/portal/practitioner-events'
import { CalendarCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PractitionerEventsPage() {
  const user = await getPortalUser()
  if (!user) redirect('/portal/login')

  let hasCoreClinic = false
  if (user.clinicId) {
    const clinic = await prisma.clinic.findUnique({
      where: { id: user.clinicId },
      select: { coreClinicId: true },
    })
    hasCoreClinic = clinic?.coreClinicId != null
  } else if (user.practitionerId) {
    const association = await prisma.practitionerClinicAssociation.findFirst({
      where: { practitionerId: user.practitionerId },
      select: { clinic: { select: { coreClinicId: true } } },
    })
    hasCoreClinic = association?.clinic.coreClinicId != null
  }

  if (!hasCoreClinic) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center space-y-4">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <CalendarCheck className="h-7 w-7 text-amber-600" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Events not available</h1>
        <p className="text-sm text-gray-600">
          Events require your clinic to be linked to Consentz Core — otherwise patients can&apos;t see
          or book them on your public profile. Contact support to get your clinic linked.
        </p>
      </div>
    )
  }

  return <PractitionerEvents />
}
