'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Building2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function PortalLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      router.push(next)
      router.refresh()
    } catch {
      setError('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-[22rem]">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Clinic Portal</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Sign in to manage your Consentz Directory profile
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.06em] text-slate-400"
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
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 transition focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                placeholder="Your username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.06em] text-slate-400"
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
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 transition focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                placeholder="Your password"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="h-10 w-full rounded-lg bg-white text-sm font-semibold text-slate-900 hover:bg-slate-100"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            New to Consentz?{' '}
            <a href="/directory/register/clinic" className="text-slate-300 underline hover:text-white">
              Register a clinic
            </a>{' '}
            or{' '}
            <a href="/directory/register/practitioner" className="text-slate-300 underline hover:text-white">
              register as a practitioner
            </a>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Staff access?{' '}
          <a href="/directory/admin/login" className="text-slate-500 hover:text-slate-400">
            Admin panel →
          </a>
        </p>
      </div>
    </div>
  )
}
