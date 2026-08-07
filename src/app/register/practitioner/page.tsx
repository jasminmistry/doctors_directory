import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ClaimWizard } from '@/components/claim/claim-wizard'
import { getConsentzAuthUrl } from '@/lib/auth'
import { toDirectoryCanonical } from '@/lib/seo'
import { IconArrowNarrowLeft, IconCircleCheck, IconUser } from '@tabler/icons-react'

export const metadata: Metadata = {
  title: 'Register as a Practitioner — Consentz Directory',
  description: 'List your aesthetic practice on the Consentz Directory. Connect with patients looking for your specialty.',
  alternates: { canonical: toDirectoryCanonical('/register/practitioner') },
}

const BENEFITS = [
  'Appear in searches for your specialty and city',
  'Display your qualifications and accreditations',
  'Receive patient leads directly',
  'Build trust with a verified profile badge',
]

function getConsentzLoginUrl(): string {
  try {
    return new URL(getConsentzAuthUrl()).origin + '/admin/login'
  } catch {
    return ''
  }
}

interface Props {
  searchParams: { step?: string; claimId?: string }
}

export default function RegisterPractitionerPage({ searchParams }: Readonly<Props>) {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <IconArrowNarrowLeft stroke={1.5} className="h-4 w-4" />
          Back to directory
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <IconUser stroke={1.5} className="h-5 w-5" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">For Practitioners</span>
          </div>
          <h1 className="text-2xl font-medium mb-3">Register as a practitioner</h1>
          <p className="text-sm text-muted-foreground">
            Verify your email, choose a plan, and our team will review your listing within 24 hours.
          </p>

          <ul className="mt-4 space-y-2">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                <IconCircleCheck stroke={1.5} className="h-4 w-4 shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-sm text-black">
            Already listed?{' '}
            <Link href="/practitioners" className="text-foreground underline underline-offset-2">
              Find your profile
            </Link>{' '}
            and use the &quot;Claim this profile&quot; link.
          </p>
          <p className="mt-2 text-sm text-black">
            Already have an account?{' '}
            <Link href="/portal/login" className="text-foreground underline underline-offset-2">
              Sign in to your portal
            </Link>
          </p>
        </div>

        <div className="rounded-lg border border-border p-6">
          <Suspense fallback={null}>
            <ClaimWizard
              entityType="practitioner"
              mode="register"
              entityName=""
              initialStep={searchParams.step}
              initialClaimId={searchParams.claimId ? parseInt(searchParams.claimId, 10) : null}
              consentzLoginUrl={getConsentzLoginUrl()}
            />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
