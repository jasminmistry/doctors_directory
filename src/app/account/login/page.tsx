'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserCircle, Loader2, Mail } from 'lucide-react'

export const dynamic = 'force-dynamic'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: 'Sign-in failed. Please try again.',
  state_mismatch: 'Sign-in failed. Please try again.',
  token_exchange_failed: 'Sign-in failed. Please try again.',
  profile_fetch_failed: 'Could not retrieve your profile. Please try again.',
  server_error: 'Something went wrong. Please try again.',
  link_used: 'This sign-in link has already been used. Request a new one.',
  link_expired: 'This sign-in link has expired. Request a new one.',
  invalid_link: 'This sign-in link is invalid. Request a new one.',
}

export default function AccountLoginPage() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/account'
  const errorKey = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [oauthError] = useState(errorKey ? (ERROR_MESSAGES[errorKey] ?? 'Something went wrong.') : '')
  const [emailError, setEmailError] = useState('')

  const nextParam = next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setEmailError('')

    const trimmedEmail = email.trim()
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/directory/api/patient/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, next: next !== '/account' ? next : undefined }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setEmailError(data?.error ?? 'Something went wrong. Please try again.')
        return
      }
      setSent(true)
    } catch {
      setEmailError('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center bg-white px-4 py-20">
      <div className="w-full max-w-[22rem]">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center border border-[#e0e0e0] rounded-full bg-white">
            <UserCircle className="h-5 w-5 text-black" />
          </div>
          <h1 className="text-xl font-medium text-black">Sign in to your account</h1>
          <p className="mt-1.5 text-sm text-slate-500">Book consultations and manage your appointments</p>
        </div>

        <div className="p-6 bg-white border border-[#C4C4C4] rounded-lg space-y-4">
          {oauthError && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{oauthError}</p>
          )}

          {sent ? (
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 border border-green-200">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-black">Check your inbox</p>
              <p className="text-sm text-slate-500">
                We sent a sign-in link to <strong>{email}</strong>. Click the link to continue — it expires in 15 minutes.
              </p>
              <button
                type="button"
                onClick={() => { setSent(false); setEmail('') }}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              {/* Social buttons */}
              <a
                href={`/directory/api/patient/auth/google${nextParam}`}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#C4C4C4] px-4 py-2.5 text-sm font-medium text-black hover:bg-gray-50 transition"
              >
                <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </a>

              <a
                href={`/directory/api/patient/auth/apple${nextParam}`}
                className="flex w-full items-center justify-center gap-3 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 transition"
              >
                <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11"/>
                </svg>
                Continue with Apple
              </a>

              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-[#e0e0e0]" />
                <span className="text-xs text-slate-400">or</span>
                <div className="flex-1 border-t border-[#e0e0e0]" />
              </div>

              {/* Magic link */}
              <form onSubmit={handleMagicLink} noValidate className="space-y-3">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-black">Email address</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                    aria-invalid={!!emailError}
                    className={`w-full px-3 py-2 text-base border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/20 ${emailError ? 'border-red-400' : 'border-[#C4C4C4]'}`}
                    placeholder="you@example.com"
                  />
                  {emailError && <p className="mt-1.5 text-xs text-red-500">{emailError}</p>}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-white border border-[#C4C4C4] text-black hover:bg-gray-50 transition"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send magic link'}
                </Button>
              </form>
            </>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 px-4 py-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Are you a clinic or practitioner?</p>
          <div className="flex flex-col gap-1.5">
            <Link href="/register/clinic" className="text-sm text-gray-700 hover:text-black hover:underline">
              → List your practice
            </Link>
            <Link href="/clinics" className="text-sm text-gray-700 hover:text-black hover:underline">
              → Claim your existing profile
            </Link>
            <Link href="/register/practitioner" className="text-sm text-gray-700 hover:text-black hover:underline">
              → Register as a practitioner
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
