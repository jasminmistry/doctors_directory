import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ERROR_MESSAGES: Record<string, string> = {
  missing_token: 'The verification link is missing a token.',
  invalid_token: 'This verification link is invalid or has already been used.',
  expired_token: 'This verification link has expired. Please start the claim process again.',
  server_error: 'Something went wrong on our end. Please try again.',
}

interface Props {
  searchParams: { error?: string; token?: string }
}

export default function ClaimVerifyPage({ searchParams }: Readonly<Props>) {
  if (searchParams.token) {
    redirect(`/api/claim/verify-email?token=${searchParams.token}`)
  }

  const errorKey = searchParams.error
  const message = errorKey ? ERROR_MESSAGES[errorKey] : ERROR_MESSAGES['missing_token']

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10">
            <AlertCircle className="w-7 h-7 text-destructive" />
          </div>
        </div>
        <h1 className="text-lg font-semibold mb-2">Verification failed</h1>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        <Button asChild variant="outline">
          <Link href="/">Back to directory</Link>
        </Button>
      </div>
    </div>
  )
}
