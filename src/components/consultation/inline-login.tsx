'use client'

import { useState } from 'react'
import { Loader2, Mail, ArrowRight } from 'lucide-react'

interface InlineLoginProps {
  next: string
}

export function InlineLogin({ next }: InlineLoginProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const nextParam = `?next=${encodeURIComponent(next)}`

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/directory/api/patient/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), next }),
      })
      if (!res.ok) {
        setError('Something went wrong. Please try again.')
        return
      }
      setSent(true)
    } catch {
      setError('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 border border-green-100 shadow-sm">
          <Mail className="h-5 w-5 text-green-600" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-900">Check your inbox</p>
          <p className="text-xs text-gray-500 leading-relaxed max-w-[220px]">
            We sent a sign-in link to <span className="font-medium text-gray-700">{email}</span>.
            It expires in 15 minutes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setSent(false); setEmail('') }}
          className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-5">
      <div className="text-center space-y-0.5">
        <p className="text-sm font-semibold text-gray-900">Sign in to continue</p>
        <p className="text-xs text-gray-400">We&apos;ll save your details for next time</p>
      </div>

      {/* OAuth buttons */}
      <div className="flex flex-col gap-2">
        <a
          href={`/directory/api/patient/auth/google${nextParam}`}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
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
          className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black transition-all shadow-sm"
        >
          <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" />
          </svg>
          Continue with Apple
        </a>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-gray-100" />
        <span className="text-xs text-gray-400 font-medium">or</span>
        <div className="flex-1 border-t border-gray-100" />
      </div>

      {/* Magic link form */}
      <form onSubmit={handleMagicLink} className="space-y-2.5">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Email address</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
            placeholder="you@example.com"
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              Send magic link
              <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-[11px] text-gray-400 leading-relaxed">
        Free account &middot; No password needed
      </p>
    </div>
  )
}
