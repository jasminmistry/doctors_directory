'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconCircleCheck } from '@tabler/icons-react'

interface Props {
  email: string
  claimId: number
  entityType: 'clinic' | 'practitioner'
  onVerified: (domainVerified: boolean, affiliated: boolean) => void
}

export function StepVerifyOtp({ email, claimId, entityType, onVerified }: Readonly<Props>) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  async function handleResend() {
    setResending(true)
    setResendMessage(null)
    setError(null)

    try {
      const res = await fetch('/directory/api/claim/resend-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setResendMessage(typeof data.error === 'string' ? data.error : 'Failed to resend code. Please try again.')
        return
      }
      setOtp('')
      setResendMessage('A new code has been sent to your email.')
    } catch {
      setResendMessage('Network error. Please check your connection and try again.')
    } finally {
      setResending(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/directory/api/claim/verify-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, otp }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Verification failed. Please try again.')
        return
      }
      onVerified(data.domainVerified ?? false, data.affiliated ?? false)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold mb-1">Enter your verification code</h2>
        <p className="text-sm text-muted-foreground break-words">
          We sent a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="otp-code">Verification code</Label>
        <Input
          id="otp-code"
          type="text"
          inputMode="numeric"
          placeholder="000000"
          maxLength={6}
          value={otp}
          onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(null) }}
          className="text-2xl tracking-widest text-center font-mono"
          autoComplete="one-time-code"
          autoFocus
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading || otp.length !== 6} className="w-full">
        {loading ? 'Verifying…' : 'Verify'}
      </Button>

      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-1">Didn&apos;t receive it? Check your spam folder.</p>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-xs underline text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {resending ? 'Sending…' : 'Resend code'}
        </button>
        {resendMessage && <p className="text-xs text-muted-foreground mt-1">{resendMessage}</p>}
      </div>
    </form>
  )
}

interface VerifiedBadgeProps {
  entityType: 'clinic' | 'practitioner'
  domainVerified: boolean
  affiliated: boolean
}

export function VerificationBadge({ entityType, domainVerified, affiliated }: Readonly<VerifiedBadgeProps>) {
  const matched = entityType === 'clinic' ? domainVerified : affiliated
  if (!matched) return null

  const label =
    entityType === 'clinic'
      ? 'Email domain matches your clinic website'
      : 'Email domain matches an associated clinic'

  return (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
      <IconCircleCheck stroke={1.5} className="h-4 w-4 shrink-0" />
      {label}
    </div>
  )
}
