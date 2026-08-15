'use client'

import { useEffect } from 'react'

type WrongAccountNoticeProps = {
  next: string
}

export function WrongAccountNotice({ next }: WrongAccountNoticeProps) {
  useEffect(() => {
    fetch('/directory/api/auth/logout/', { method: 'POST' }).finally(() => {
      window.location.href = `/directory/portal/login?next=${encodeURIComponent(next)}`
    })
  }, [next])

  return (
    <div className="max-w-lg mx-auto mt-16 text-center space-y-4">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
      </div>
      <p className="text-sm text-gray-600">Signing you out of the wrong account…</p>
    </div>
  )
}
