import { redirect } from 'next/navigation'
import { getPortalUser } from '@/lib/portal'
import { PractitionerEarnings } from '@/components/portal/practitioner-earnings'

export const dynamic = 'force-dynamic'

export default async function PractitionerEarningsPage() {
  const user = await getPortalUser()
  if (!user) redirect('/portal/login')

  return <PractitionerEarnings />
}
