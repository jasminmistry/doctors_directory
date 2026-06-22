'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Building2 } from 'lucide-react'

type DevClaim = {
  username: string
  entityType: string
  name: string
  slug: string | null
}


export const dynamic = 'force-dynamic'

export default function PortalLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const ssoError = searchParams.get('error')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLocalhost, setIsLocalhost] = useState(false)
  const [devClaims, setDevClaims] = useState<DevClaim[]>([])
  const [devLoading, setDevLoading] = useState(false)

  useEffect(() => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      setIsLocalhost(true)
      fetch('/directory/api/dev/portal-login')
        .then((r) => r.json())
        .then((data) => Array.isArray(data) && setDevClaims(data))
        .catch(() => {})
    }
  }, [])

  async function devLogin(devUsername?: string) {
    setDevLoading(true)
    try {
      const res = await fetch('/directory/api/dev/portal-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: devUsername }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Dev login failed')
        return
      }
      const next = searchParams.get('next') || '/portal'
      window.location.href = next.startsWith('/directory') ? next : `/directory${next}`
    } catch {
      setError('Dev login failed')
    } finally {
      setDevLoading(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/directory/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Invalid credentials')
        return
      }

      if (data.role === 'admin') {
        setError('This login is for clinic and practitioner accounts. Use the admin panel for staff access.')
        return
      }

      const next = searchParams.get('next') || '/portal'
      window.location.href = next.startsWith('/directory') ? next : `/directory${next}`
    } catch {
      setError('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center bg-white px-4 py-20">
      <div className="w-full max-w-[22rem]">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/10 ring-1 ring-white/20">
            <Building2 className="h-6 w-6 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-black">Clinic Portal</h1>
          <p className="mt-1.5 text-sm text-slate-900">
            Sign in to manage your Consentz Directory profile
          </p>
        </div>

        <div className="p-6 relative mb-2 bg-white border-b border-t-0 border-[#C4C4C4] md:border-t rounded-lg md:border md:border-(--alto)">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-base font-medium text-black mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 text-base border rounded-lg bg-white"
                placeholder="Your username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-base font-medium text-black mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-base border rounded-lg bg-white"
                placeholder="Your password"
              />
            </div>

            {ssoError === 'pending_approval' && (
              <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
                Your listing is linked and awaiting admin approval. You&apos;ll be able to access the portal once approved.
              </p>
            )}
            {ssoError && ssoError !== 'pending_approval' && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {ssoError === 'not_linked'
                  ? 'No linked directory listing found. Please claim your listing first.'
                  : 'Sign-in link was invalid or expired. Please try again.'}
              </p>
            )}
            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-black border border-black text-white hover:bg-white hover:text-black font-bold rounded-lg"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-black">
            New to Consentz?{' '}
            <a href="/directory/register/clinic" className="text-black underline hover:no-underline">
              Register a clinic
            </a>{' '}
            or{' '}
            <a href="/directory/register/practitioner" className="text-black underline hover:no-underline">
              register as a practitioner
            </a>
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-black">
          Staff access?{' '}
          <a href="/directory/admin/login" className="hover:underline">
            Admin panel →
          </a>
        </p>

        {isLocalhost && (
          <div className="mt-6 rounded-lg border border-dashed border-amber-400 bg-amber-50 p-4">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-amber-700">
              Dev quick login
            </p>
            {devClaims.length === 0 ? (
              <Button
                type="button"
                onClick={() => devLogin()}
                disabled={devLoading}
                className="w-full bg-amber-500 text-white hover:bg-amber-600"
              >
                {devLoading ? 'Logging in…' : 'Login as first approved user'}
              </Button>
            ) : (
              <div className="space-y-1.5">
                {devClaims.map((c) => (
                  <button
                    key={c.username}
                    type="button"
                    onClick={() => devLogin(c.username)}
                    disabled={devLoading}
                    className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-left text-xs hover:bg-amber-100 disabled:opacity-50"
                  >
                    <span className="font-medium text-amber-900">{c.name || c.username}</span>
                    {c.slug && (
                      <span className="ml-2 text-amber-600">
                        {c.entityType} · {c.slug}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
