import { redirect } from 'next/navigation'
import { getPortalUser } from '@/lib/portal'
import { PractitionerEvents } from '@/components/portal/practitioner-events'

export const dynamic = 'force-dynamic'

export default async function PractitionerEventsPage() {
  const user = await getPortalUser()
  if (!user) redirect('/portal/login')

  return <PractitionerEvents />
}
