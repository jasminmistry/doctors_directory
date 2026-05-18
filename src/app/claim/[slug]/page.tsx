import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/db'
import { ClaimWizard } from '@/components/claim/claim-wizard'

interface Props {
  params: { slug: string }
  searchParams: { step?: string; claimId?: string }
}

export async function generateMetadata({ params }: Props) {
  const clinic = await prisma.clinic.findUnique({
    where: { slug: params.slug },
    select: { name: true },
  })
  const name =
    clinic?.name ??
    params.slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  return {
    title: `Claim ${name} — Consentz Directory`,
  }
}

export default async function ClaimPage({ params, searchParams }: Readonly<Props>) {
  const clinic = await prisma.clinic.findUnique({
    where: { slug: params.slug },
    select: { id: true, slug: true, name: true, claimed: true, gmapsAddress: true, category: true },
  })

  if (!clinic) notFound()

  const clinicName =
    clinic.name ??
    params.slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href={`/clinics/${clinic.gmapsAddress?.split(',').pop()?.trim().toLowerCase().replace(/\s+/g, '-') ?? 'uk'}/clinic/${clinic.slug}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>

        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            {clinic.category}
          </p>
          <h1 className="text-2xl font-bold">{clinicName}</h1>
          {clinic.gmapsAddress && (
            <p className="text-sm text-muted-foreground mt-1">{clinic.gmapsAddress}</p>
          )}
        </div>

        {clinic.claimed ? (
          <div className="rounded-xl border border-border p-6 text-center">
            <p className="font-medium">This profile has already been claimed.</p>
            <p className="text-sm text-muted-foreground mt-1">
              If you believe this is an error, contact{' '}
              <a href="mailto:support@consentz.com" className="underline">
                support@consentz.com
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border p-6">
            <Suspense fallback={null}>
              <ClaimWizard
                entityType="clinic"
                entityName={clinicName}
                clinicSlug={clinic.slug}
                initialStep={searchParams.step}
                initialClaimId={searchParams.claimId ? parseInt(searchParams.claimId, 10) : null}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  )
}
