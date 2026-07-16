import { Suspense } from 'react'
import { ProspectsInbox } from '@/components/portal/prospects-inbox'
import { WrongAccountNotice } from '@/components/portal/wrong-account-notice'
import { getPortalUser } from '@/lib/portal'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ProspectsPage() {
  const user = await getPortalUser()
  if (!user) redirect('/portal/login?next=/portal/clinic/prospects')
  if (!user.clinicId) {
    return (
      <WrongAccountNotice
        requiredEntityType="clinic"
        currentEntityType={user.entityType}
        next="/portal/clinic/prospects"
      />
    )
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: user.clinicId },
    select: { claimedPlan: true },
  })

  const plan = clinic?.claimedPlan ?? 'free'

  return (
    <div className="w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Prospects</h1>
        <p className="mt-1 text-sm text-gray-500">
          Consultation requests from patients who found your clinic on Consentz Directory.
        </p>
      </div>

      {plan === 'free' && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Upgrade to see patient details.</strong> Free accounts can view that leads exist but names and contact
          details are hidden. Upgrade to Pay-Per-Lead (£15/lead) or Verified Subscription (£99/mo) to unlock them.
        </div>
      )}

      <Suspense>
        <ProspectsInbox plan={plan as 'free' | 'pay_per_lead' | 'subscription'} />
      </Suspense>
    </div>
  )
}
