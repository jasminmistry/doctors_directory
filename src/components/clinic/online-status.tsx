'use client'

import { useEffect, useState } from 'react'

interface ClinicOnlineStatusProps {
  clinicSlug: string
  /** Refresh interval in ms. Defaults to 2 minutes. */
  refreshMs?: number
}

export function ClinicOnlineStatus({ clinicSlug, refreshMs = 120_000 }: ClinicOnlineStatusProps) {
  const [online, setOnline] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const res = await fetch(`/directory/api/chat/${clinicSlug}/status`)
        const data: { online: boolean } = await res.json()
        if (!cancelled) setOnline(data.online)
      } catch {
        if (!cancelled) setOnline(false)
      }
    }

    check()
    const id = setInterval(check, refreshMs)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [clinicSlug, refreshMs])

  // Don't render anything until the first check resolves — avoids layout shift
  if (online === null) return null

  if (online) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        Online now — chat with us
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
      <span className="h-2 w-2 rounded-full bg-gray-300" />
      Currently offline
    </span>
  )
}
