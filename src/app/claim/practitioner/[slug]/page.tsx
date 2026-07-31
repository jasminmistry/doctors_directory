import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/db'
import { ClaimWizard } from '@/components/claim/claim-wizard'
import { getConsentzAuthUrl } from '@/lib/auth'
import { getClaimState, isOwnActiveClaim } from '@/lib/claim-utils'

function getConsentzLoginUrl(): string {
  try {
    return new URL(getConsentzAuthUrl()).origin + '/admin/login'
  } catch {
    return ''
  }
}

interface Props {
  params: { slug: string }
  searchParams: { step?: string; claimId?: string }
}

export async function generateMetadata({ params }: Props) {
  const practitioner = await prisma.practitioner.findUnique({
    where: { slug: params.slug },
    select: { displayName: true },
  })
  const name = practitioner?.displayName ?? params.slug
  return { title: `Claim ${name} — Consentz Directory` }
}

export default async function ClaimPractitionerPage({ params, searchParams }: Readonly<Props>) {
  const practitioner = await prisma.practitioner.findUnique({
    where: { slug: params.slug },
    select: { id: true, slug: true, displayName: true, claimed: true, specialty: true },
  })

  if (!practitioner) notFound()

  const claimState = await getClaimState({
    claimed: practitioner.claimed,
    entityType: 'practitioner',
    slug: practitioner.slug,
  })

  // A claimant resuming their own in-progress wizard (e.g. backing out of Stripe
  // Checkout back to the plan step) should never be blocked by the pending guard.
  const claimIdParam = searchParams.claimId ? parseInt(searchParams.claimId, 10) : null
  const resumingOwnClaim =
    claimState === 'pending' && claimIdParam !== null && !Number.isNaN(claimIdParam)
      ? await isOwnActiveClaim({ entityType: 'practitioner', entityId: practitioner.id, claimId: claimIdParam })
      : false

  const entityName = practitioner.displayName ?? params.slug

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href={`/practitioners/${practitioner.slug}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>

        <div className="mb-6">
          {practitioner.specialty && (
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              {practitioner.specialty}
            </p>
          )}
          <h1 className="text-2xl font-medium">{entityName}</h1>
        </div>

        {claimState === 'claimed' ? (
          <div className="rounded-lg border border-border p-6 text-center">
            <p className="font-medium">This profile has already been claimed.</p>
            <p className="text-sm text-muted-foreground mt-1">
              If you believe this is an error, contact{' '}
              <a href="mailto:support@consentz.com" className="underline">
                support@consentz.com
              </a>
              .
            </p>
          </div>
        ) : claimState === 'pending' && !resumingOwnClaim ? (
          <div className="rounded-lg border border-border p-6 text-center">
            <p className="font-medium">A claim request for this profile is already under review.</p>
            <p className="text-sm text-muted-foreground mt-1">
              We&apos;ll be in touch once it&apos;s been reviewed. If you believe this is an error, contact{' '}
              <a href="mailto:support@consentz.com" className="underline">
                support@consentz.com
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border p-6">
            <Suspense fallback={null}>
              <ClaimWizard
                entityType="practitioner"
                entityName={entityName}
                practitionerSlug={practitioner.slug}
                initialStep={searchParams.step}
                initialClaimId={searchParams.claimId ? parseInt(searchParams.claimId, 10) : null}
                consentzLoginUrl={getConsentzLoginUrl()}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  )
}
