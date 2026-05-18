import { redirect } from 'next/navigation'
import { getPortalUser } from '@/lib/portal'

export default async function PortalPage() {
  const user = await getPortalUser()
  if (!user) redirect('/admin/login?next=/portal')
  redirect(user.entityType === 'clinic' ? '/portal/clinic' : '/portal/practitioner')
}
