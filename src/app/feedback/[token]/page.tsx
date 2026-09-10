import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { getClinicDisplayName } from '@/lib/clinic-display'
import { hashReviewToken, signDwellToken } from '@/lib/reviews'
import { FeedbackForm } from './feedback-form'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Share your feedback',
  robots: { index: false, follow: false },
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        {children}
      </div>
    </div>
  )
}

export default async function FeedbackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const reviewRequest = await prisma.reviewRequest.findUnique({
    where: { tokenHash: hashReviewToken(token) },
    include: { clinic: { select: { name: true, slug: true, gmapsUrl: true, image: true } } },
  })

  if (!reviewRequest) {
    return (
      <Shell>
        <h1 className="text-lg font-semibold text-gray-900">This link isn&rsquo;t valid</h1>
        <p className="mt-2 text-sm text-gray-600">
          The feedback link may have been mistyped. Please check with the clinic for a fresh link.
        </p>
      </Shell>
    )
  }

  const clinicName =
    reviewRequest.clinic.name ||
    getClinicDisplayName({ slug: reviewRequest.clinic.slug, url: reviewRequest.clinic.gmapsUrl ?? undefined })

  if (reviewRequest.usedAt) {
    return (
      <Shell>
        <h1 className="text-lg font-semibold text-gray-900">Thanks &mdash; we&rsquo;ve got your feedback</h1>
        <p className="mt-2 text-sm text-gray-600">
          This link has already been used. If you meant to leave more feedback for {clinicName}, ask them for a new link.
        </p>
      </Shell>
    )
  }

  if (reviewRequest.expiresAt.getTime() < Date.now()) {
    return (
      <Shell>
        <h1 className="text-lg font-semibold text-gray-900">This link has expired</h1>
        <p className="mt-2 text-sm text-gray-600">
          Please ask {clinicName} for a new feedback link.
        </p>
      </Shell>
    )
  }

  return (
    <Shell>
      <FeedbackForm
        token={token}
        clinicName={clinicName}
        clinicImage={reviewRequest.clinic.image}
        greetingName={reviewRequest.patientName}
        dwell={signDwellToken()}
      />
    </Shell>
  )
}
