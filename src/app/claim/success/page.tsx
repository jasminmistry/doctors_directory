import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ClaimSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-lg font-semibold mb-2">Payment confirmed</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Your subscription is active. Your claim is now under review and will be approved
          within 24 hours. You&apos;ll receive a confirmation email once your profile is live.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Back to directory</Link>
        </Button>
      </div>
    </div>
  )
}
