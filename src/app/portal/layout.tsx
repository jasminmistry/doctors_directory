import { redirect } from 'next/navigation'
import { PortalLayoutClient } from '@/components/portal/PortalLayoutClient'
import { getPortalUser } from '@/lib/portal'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getPortalUser()

  // Not a portal user (no approved claim) — send to admin or login
  if (!user) {
    redirect('/admin/login?next=/portal')
  }

  return (
    <PortalLayoutClient entityType={user.entityType} entityName={user.entityName}>
      {children}
    </PortalLayoutClient>
  )
}
