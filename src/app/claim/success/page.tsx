import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db'
import { IconCircleCheck } from '@tabler/icons-react'

interface Props {
  searchParams: { session_id?: string }
}

export default async function ClaimSuccessPage({ searchParams }: Readonly<Props>) {
  const sessionId = searchParams.session_id
  const claim = sessionId
    ? await prisma.claimRequest.findFirst({
        where: { stripeSessionId: sessionId },
        select: { isNewRegistration: true },
      })
    : null
  const isRegister = claim?.isNewRegistration === true

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50">
            <IconCircleCheck stroke={1.5} className="w-7 h-7 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-lg font-semibold mb-2">Payment confirmed</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Your subscription is active. Your {isRegister ? 'registration' : 'claim'} is now under review
          and will be approved within 24 hours. You&apos;ll receive a confirmation email once your profile
          is live.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Back to directory</Link>
        </Button>
      </div>
    </div>
  )
}
