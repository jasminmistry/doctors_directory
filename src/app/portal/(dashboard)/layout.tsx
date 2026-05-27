import { redirect } from 'next/navigation'
import { PortalLayoutClient } from '@/components/portal/PortalLayoutClient'
import { getPortalUser } from '@/lib/portal'
import { prisma } from '@/lib/db'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getPortalUser()

  if (!user) {
    redirect('/portal/login?next=/portal')
  }

  let plan: string | null = null
  if (user.clinicId) {
    const clinic = await prisma.clinic.findUnique({
      where: { id: user.clinicId },
      select: { claimedPlan: true },
    })
    plan = clinic?.claimedPlan ?? null
  }

  return (
    <PortalLayoutClient entityType={user.entityType} entityName={user.entityName} plan={plan}>
      {children}
    </PortalLayoutClient>
  )
}
