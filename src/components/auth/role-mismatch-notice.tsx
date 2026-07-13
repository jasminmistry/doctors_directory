'use client'

import { AlertTriangle } from 'lucide-react'

type Role = 'admin' | 'portal'

const ROLE_LABEL: Record<Role, string> = {
  admin: 'admin',
  portal: 'clinic',
}

const LOGIN_PATH: Record<Role, string> = {
  admin: '/admin/login',
  portal: '/portal/login',
}

type RoleMismatchNoticeProps = {
  requiredRole: Role
  next: string
}

export function RoleMismatchNotice({ requiredRole, next }: RoleMismatchNoticeProps) {
  const currentRole: Role = requiredRole === 'admin' ? 'portal' : 'admin'

  async function handleSwitchAccount() {
    await fetch('/directory/api/auth/logout', { method: 'POST' })
    window.location.href = `/directory${LOGIN_PATH[requiredRole]}?next=${encodeURIComponent(next)}`
  }

  return (
    <div className="max-w-lg mx-auto mt-16 text-center space-y-4">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
        <AlertTriangle className="h-7 w-7 text-amber-600" />
      </div>
      <h1 className="text-xl font-semibold text-gray-900">Wrong account type</h1>
      <p className="text-sm text-gray-500">
        This page is only available to {ROLE_LABEL[requiredRole]} accounts. You&apos;re currently signed in with a{' '}
        {ROLE_LABEL[currentRole]} account.
      </p>
      <button
        onClick={handleSwitchAccount}
        className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition"
      >
        Sign in with a different account
      </button>
    </div>
  )
}
