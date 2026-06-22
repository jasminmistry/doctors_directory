'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
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
        setError(data.error || 'Login failed')
        return
      }

      const defaultNext = data.role === 'portal' ? '/portal' : '/admin'
      const next = searchParams.get('next') || defaultNext
      router.push(next)
      router.refresh()
    } catch {
      setError('Unable to connect to auth service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center bg-white min-h-[calc(100vh-72px)] px-4 py-8">
      <div className="w-full max-w-[22rem]">
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full border border-gray-300 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500 mb-4">
            Admin Portal
          </span>
          <h1 className="text-2xl font-bold text-black">Sign In</h1>
          <p className="mt-1.5 text-sm text-gray-500">Access your Consentz dashboard</p>
        </div>

        <div className="p-6 bg-white border border-[#C4C4C4] rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-2 block text-base font-medium text-black">
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
              <label htmlFor="password" className="mb-2 block text-base font-medium text-black">
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

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
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
        </div>
      </div>
    </div>
  )
}
