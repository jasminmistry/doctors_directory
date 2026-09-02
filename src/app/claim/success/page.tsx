import Link from 'next/link'
import Stripe from 'stripe'
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { SignUpConversion } from '@/components/claim/sign-up-conversion'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: { session_id?: string }
}

type VerifyResult =
  | { ok: true; isRegister: boolean; plan: string | null; entityType: string }
  | { ok: false }

/**
 * Confirms the Stripe checkout session actually completed before the page is
 * allowed to show a payment-success state. A missing, empty, unknown or
 * unfinished session_id must never render "Payment confirmed".
 */
async function verifySession(sessionId: string | undefined): Promise<VerifyResult> {
  const trimmed = sessionId?.trim()
  if (!trimmed) return { ok: false }

  // The session id must belong to a claim we started checkout for.
  const claim = await prisma.claimRequest.findFirst({
    where: { stripeSessionId: trimmed },
    select: { isNewRegistration: true, selectedPlan: true, entityType: true },
  })
  if (!claim) return { ok: false }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })
    const session = await stripe.checkout.sessions.retrieve(trimmed)

    // Checkout itself must be finished.
    if (session.status !== 'complete') return { ok: false }

    // subscription mode (£99/mo) → the first invoice must be paid.
    // setup mode (pay-per-lead) → card capture done; status:'complete' above is enough.
    if (session.mode === 'subscription' && session.payment_status !== 'paid') return { ok: false }

    return {
      ok: true,
      isRegister: claim.isNewRegistration === true,
      plan: claim.selectedPlan,
      entityType: claim.entityType,
    }
  } catch (error) {
    console.error('[claim/success] session verification failed:', error)
    return { ok: false }
  }
}

export default async function ClaimSuccessPage({ searchParams }: Readonly<Props>) {
  const result = await verifySession(searchParams.session_id)
  const sessionId = searchParams.session_id?.trim() ?? ''

  if (!result.ok) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-50">
              <IconAlertTriangle stroke={1.5} className="w-7 h-7 text-amber-600" />
            </div>
          </div>
          <h1 className="text-lg font-semibold mb-2">We couldn&apos;t confirm your payment</h1>
          <p className="text-sm text-muted-foreground mb-6">
            This link isn&apos;t linked to a completed checkout. If you just paid, wait a moment and
            reopen the link from your confirmation email. Otherwise start the claim again from your
            clinic&apos;s profile.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/portal/login">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to directory</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <SignUpConversion dedupeKey={sessionId} plan={result.plan} entityType={result.entityType} />
      <div className="max-w-sm w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50">
            <IconCircleCheck stroke={1.5} className="w-7 h-7 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-lg font-semibold mb-2">Payment confirmed</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Your subscription is active. Your {result.isRegister ? 'registration' : 'claim'} is now under
          review and will be approved within 24 hours. You&apos;ll receive a confirmation email once your
          profile is live.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Back to directory</Link>
        </Button>
      </div>
    </div>
  )
}
