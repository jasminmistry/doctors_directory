import { redirect } from 'next/navigation'
import { PortalLayoutClient } from '@/components/portal/PortalLayoutClient'
import { getPortalUser } from '@/lib/portal'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getPortalUser()

  if (!user) {
    redirect('/portal/login?next=/portal')
  }

  let plan: string | null = null
  let hasCoreClinic = false
  if (user.clinicId) {
    const clinic = await prisma.clinic.findUnique({
      where: { id: user.clinicId },
      select: { claimedPlan: true, coreClinicId: true },
    })
    plan = clinic?.claimedPlan ?? null
    hasCoreClinic = clinic?.coreClinicId != null
  } else if (user.practitionerId) {
    const association = await prisma.practitionerClinicAssociation.findFirst({
      where: { practitionerId: user.practitionerId },
      select: { clinic: { select: { claimedPlan: true, coreClinicId: true } } },
    })
    plan = association?.clinic.claimedPlan ?? null
    hasCoreClinic = association?.clinic.coreClinicId != null
  }

  return (
    <PortalLayoutClient
      entityType={user.entityType}
      entityName={user.entityName}
      plan={plan}
      hasCoreClinic={hasCoreClinic}
    >
      {children}
    </PortalLayoutClient>
  )
}
