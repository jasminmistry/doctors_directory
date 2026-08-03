'use client'

import { AlertTriangle } from 'lucide-react'

type WrongAccountNoticeProps = {
  requiredEntityType: 'clinic' | 'practitioner'
  currentEntityType: 'clinic' | 'practitioner'
  next: string
}

export function WrongAccountNotice({ requiredEntityType, currentEntityType, next }: WrongAccountNoticeProps) {
  async function handleSwitchAccount() {
    await fetch('/directory/api/auth/logout', { method: 'POST' })
    window.location.href = `/directory/portal/login?next=${encodeURIComponent(next)}`
  }

  return (
    <div className="max-w-lg mx-auto mt-16 text-center space-y-4">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
        <AlertTriangle className="h-7 w-7 text-amber-600" />
      </div>
      <h1 className="text-xl font-semibold text-gray-900">Wrong account type</h1>
      <p className="text-sm text-gray-600">
        This page is only available to {requiredEntityType} accounts. You&apos;re currently signed in with a{' '}
        {currentEntityType} account.
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
