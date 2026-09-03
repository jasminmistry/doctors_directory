import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'
import { WrongAccountNotice } from '@/components/portal/wrong-account-notice'
import { GbpGoogleBody } from '@/components/portal/gbp/gbp-google-body'

export const dynamic = 'force-dynamic'

export default async function PortalGooglePage() {
  const user = await getPortalUser()
  if (!user) redirect('/portal/login?next=/portal/clinic/google')
  if (!user.clinicId) return <WrongAccountNotice next="/portal/clinic/google" />

  const clinic = await prisma.clinic.findUnique({
    where: { id: user.clinicId },
    select: { claimedPlan: true, idVerified: true },
  })
  const plan = clinic?.claimedPlan ?? 'free'

  return (
    <div className="w-full mx-auto space-y-6">
      <div>
        <h1 className="text-3xl text-gray-900">Google Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Keep the details that mirror your Google Business Profile in one place.
        </p>
      </div>

      {plan === 'free' ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Upgrade to manage your Google Profile.</strong> Pay-Per-Lead and Verified Subscription
          plans can edit these fields; one-click sync to Google is included with Verified Subscription.
        </div>
      ) : !clinic?.idVerified ? (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
          Editing these fields requires ID verification. Complete verification from the
          <span className="font-medium"> My Clinic </span> page first.
        </div>
      ) : (
        <GbpGoogleBody plan={plan as 'pay_per_lead' | 'subscription'} />
      )}
    </div>
  )
}
