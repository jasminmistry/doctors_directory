import { notFound, redirect } from 'next/navigation'
import { StepIdVerification } from '@/components/claim/step-id-verification'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'

interface Props {
  params: { entityType: string; slug: string }
}

export default async function VerifyProfilePage({ params }: Readonly<Props>) {
  const { entityType, slug } = params

  if (entityType !== 'clinic' && entityType !== 'practitioner') notFound()

  // Must be logged-in portal owner of this entity
  const user = await getPortalUser()
  if (!user) redirect('/admin/login')
  if (user.entityType !== entityType || user.entitySlug !== slug) redirect('/portal')

  // Verify the entity exists and is claimed
  if (entityType === 'clinic') {
    const clinic = await prisma.clinic.findUnique({
      where: { slug },
      select: { claimed: true },
    })
    if (!clinic?.claimed) notFound()
  } else {
    const practitioner = await prisma.practitioner.findUnique({
      where: { slug },
      select: { claimed: true },
    })
    if (!practitioner?.claimed) notFound()
  }

  return (
    <main className="min-h-screen bg-background flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <StepIdVerification
          entityType={entityType as 'clinic' | 'practitioner'}
          entitySlug={slug}
          claimerName={user.claimerName}
          claimerEmail={user.claimerEmail}
        />
      </div>
    </main>
  )
}
