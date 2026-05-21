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
    <div className="flex items-center justify-center bg-[#fff] px-4 py-8">
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

        <div className="p-6 relative mb-2 bg-white border-b border-t-0 border-[#C4C4C4] md:border-t rounded-md md:border md:border-(--alto)">
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
                className="w-full px-3 py-2 text-base border rounded-md bg-white"
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
                className="w-full px-3 py-2 text-base border rounded-md bg-white"
                placeholder="Your password"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 px-4 py-2 has-[>svg]:px-3 w-full bg-black border border-black text-white hover:cursor-pointer hover:bg-white hover:text-black"
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
      </div>
    </div>
  )
}
