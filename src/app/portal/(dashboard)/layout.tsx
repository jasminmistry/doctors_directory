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
  let entityImage: string | null = null
  if (user.clinicId) {
    const clinic = await prisma.clinic.findUnique({
      where: { id: user.clinicId },
      select: { claimedPlan: true, coreClinicId: true, image: true },
    })
    plan = clinic?.claimedPlan ?? null
    hasCoreClinic = clinic?.coreClinicId != null
    entityImage = clinic?.image ?? null
  } else if (user.practitionerId) {
    const [association, practitioner] = await Promise.all([
      prisma.practitionerClinicAssociation.findFirst({
        where: { practitionerId: user.practitionerId },
        select: { clinic: { select: { claimedPlan: true, coreClinicId: true } } },
      }),
      prisma.practitioner.findUnique({
        where: { id: user.practitionerId },
        select: { imageUrl: true },
      }),
    ])
    plan = association?.clinic.claimedPlan ?? null
    hasCoreClinic = association?.clinic.coreClinicId != null
    entityImage = practitioner?.imageUrl ?? null
  }

  return (
    <PortalLayoutClient
      entityType={user.entityType}
      entityName={user.entityName}
      entityImage={entityImage}
      plan={plan}
      hasCoreClinic={hasCoreClinic}
    >
      {children}
    </PortalLayoutClient>
  )
}
