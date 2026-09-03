import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'
import { WrongAccountNotice } from '@/components/portal/wrong-account-notice'
import { ReviewsManager } from '@/components/portal/gbp/reviews-manager'

export const dynamic = 'force-dynamic'

export default async function PortalReviewsPage() {
  const user = await getPortalUser()
  if (!user) redirect('/portal/login?next=/portal/clinic/reviews')
  if (!user.clinicId) return <WrongAccountNotice next="/portal/clinic/reviews" />

  const clinic = await prisma.clinic.findUnique({
    where: { id: user.clinicId },
    select: { claimedPlan: true },
  })
  const plan = clinic?.claimedPlan ?? 'free'

  return (
    <div className="w-full mx-auto space-y-6">
      <div>
        <h1 className="text-3xl text-gray-900">Reviews</h1>
        <p className="mt-1 text-sm text-gray-600">
          Send patients a private feedback link, then nudge them to review you on Google.
        </p>
      </div>

      {plan === 'free' ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Upgrade to collect reviews.</strong> Pay-Per-Lead and Verified Subscription plans can
          generate per-patient feedback links and track private ratings.
        </div>
      ) : (
        <ReviewsManager />
      )}
    </div>
  )
}
