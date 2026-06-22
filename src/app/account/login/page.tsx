'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserCircle, Loader2, Eye, EyeOff } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Step = 'login' | 'register' | 'forgot-email' | 'forgot-otp' | 'forgot-newpw'

export default function AccountLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('login')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const next = searchParams.get('next') || '/account'

  function resetToLogin() {
    setStep('login')
    setPassword('')
    setConfirmPassword('')
    setOtp('')
    setError('')
    setShowPassword(false)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/directory/api/patient/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Invalid email or password'); return }
      router.push(next)
      router.refresh()
    } catch {
      setError('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await fetch('/directory/api/patient/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName: firstName.trim() || undefined, lastName: lastName.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Registration failed'); return }
      router.push(next.includes('?') ? `${next}&new=1` : `${next}?new=1`)
      router.refresh()
    } catch {
      setError('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotSend(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/directory/api/patient/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) { setError('Something went wrong'); return }
      setStep('forgot-otp')
    } catch {
      setError('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmNewPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await fetch('/directory/api/patient/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password: newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Reset failed'); return }
      router.push(next)
      router.refresh()
    } catch {
      setError('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const titles: Record<Step, string> = {
    login: 'Sign in',
    register: 'Create account',
    'forgot-email': 'Reset password',
    'forgot-otp': 'Enter reset code',
    'forgot-newpw': 'Set new password',
  }

  const subtitles: Record<Step, string> = {
    login: 'Sign in to your patient account',
    register: 'Create your free patient account',
    'forgot-email': 'We\'ll send a reset code to your email',
    'forgot-otp': `We sent a 6-digit code to ${email}`,
    'forgot-newpw': 'Choose a new password for your account',
  }

  return (
    <div className="flex items-center justify-center bg-white px-4 py-20">
      <div className="w-full max-w-[22rem]">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-black/10 ring-1 ring-black/10">
            <UserCircle className="h-5 w-5 text-black" />
          </div>
          <h1 className="text-xl font-bold text-black">{titles[step]}</h1>
          <p className="mt-1.5 text-sm text-slate-600">{subtitles[step]}</p>
        </div>

        <div className="p-6 bg-white border border-[#C4C4C4] rounded-lg">

          {/* Login */}
          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-base font-medium text-black">Email address</label>
                <input
                  id="email" type="email" required autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-base border rounded-lg bg-white"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="text-base font-medium text-black">Password</label>
                  <button type="button" onClick={() => { setStep('forgot-email'); setError('') }}
                    className="text-xs text-slate-500 hover:text-slate-700">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 text-base border rounded-lg bg-white"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
              <Button type="submit" className="w-full bg-black border border-black text-white hover:bg-white hover:text-black" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
              </Button>
              <p className="text-center text-xs text-slate-500">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => { setStep('register'); setError('') }}
                  className="font-medium text-black hover:underline">
                  Create one
                </button>
              </p>
            </form>
          )}

          {/* Register */}
          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="reg-firstname" className="mb-2 block text-base font-medium text-black">First name</label>
                  <input
                    id="reg-firstname" type="text" required autoComplete="given-name"
                    value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 text-base border rounded-lg bg-white"
                    placeholder="Jane"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="reg-lastname" className="mb-2 block text-base font-medium text-black">Last name</label>
                  <input
                    id="reg-lastname" type="text" autoComplete="family-name"
                    value={lastName} onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 text-base border rounded-lg bg-white"
                    placeholder="Smith"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="reg-email" className="mb-2 block text-base font-medium text-black">Email address</label>
                <input
                  id="reg-email" type="email" required autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-base border rounded-lg bg-white"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="reg-password" className="mb-2 block text-base font-medium text-black">Password</label>
                <div className="relative">
                  <input
                    id="reg-password" type={showPassword ? 'text' : 'password'} required autoComplete="new-password"
                    minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 text-base border rounded-lg bg-white"
                    placeholder="Min. 8 characters"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="reg-confirm" className="mb-2 block text-base font-medium text-black">Confirm password</label>
                <input
                  id="reg-confirm" type={showPassword ? 'text' : 'password'} required autoComplete="new-password"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-base border rounded-lg bg-white"
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
              <Button type="submit" className="w-full bg-black border border-black text-white hover:bg-white hover:text-black" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create account'}
              </Button>
              <p className="text-center text-xs text-slate-500">
                Already have an account?{' '}
                <button type="button" onClick={resetToLogin} className="font-medium text-black hover:underline">
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* Forgot — enter email */}
          {step === 'forgot-email' && (
            <form onSubmit={handleForgotSend} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="mb-2 block text-base font-medium text-black">Email address</label>
                <input
                  id="forgot-email" type="email" required autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-base border rounded-lg bg-white"
                  placeholder="you@example.com"
                />
              </div>
              {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
              <Button type="submit" className="w-full bg-black border border-black text-white hover:bg-white hover:text-black" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send reset code'}
              </Button>
              <button type="button" onClick={resetToLogin}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-700">
                Back to sign in
              </button>
            </form>
          )}

          {/* Forgot — enter OTP */}
          {step === 'forgot-otp' && (
            <form onSubmit={(e) => { e.preventDefault(); setStep('forgot-newpw') }} className="space-y-4">
              <div>
                <label htmlFor="reset-otp" className="mb-2 block text-base font-medium text-black">Reset code</label>
                <input
                  id="reset-otp" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                  required autoFocus autoComplete="one-time-code"
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2.5 text-center text-xl tracking-[0.5em] font-mono border rounded-lg bg-white"
                  placeholder="000000"
                />
              </div>
              {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
              <Button type="submit" className="w-full bg-black border border-black text-white hover:bg-white hover:text-black" disabled={otp.length !== 6}>
                Continue
              </Button>
              <button type="button" onClick={() => { setStep('forgot-email'); setOtp(''); setError('') }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-700">
                Use a different email
              </button>
            </form>
          )}

          {/* Forgot — set new password */}
          {step === 'forgot-newpw' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="new-pw" className="mb-2 block text-base font-medium text-black">New password</label>
                <div className="relative">
                  <input
                    id="new-pw" type={showNewPassword ? 'text' : 'password'} required autoComplete="new-password"
                    minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 text-base border rounded-lg bg-white"
                    placeholder="Min. 8 characters"
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirm-new-pw" className="mb-2 block text-base font-medium text-black">Confirm new password</label>
                <input
                  id="confirm-new-pw" type={showNewPassword ? 'text' : 'password'} required autoComplete="new-password"
                  value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-base border rounded-lg bg-white"
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
              <Button type="submit" className="w-full bg-black border border-black text-white hover:bg-white hover:text-black" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Set new password'}
              </Button>
            </form>
          )}

        </div>

        {/* Provider registration links */}
        <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 px-4 py-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Are you a clinic or practitioner?</p>
          <div className="flex flex-col gap-1.5">
            <Link href="/register/clinic" className="text-sm text-gray-700 hover:text-black hover:underline">
              → List your practice
            </Link>
            <Link href="/claim" className="text-sm text-gray-700 hover:text-black hover:underline">
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
