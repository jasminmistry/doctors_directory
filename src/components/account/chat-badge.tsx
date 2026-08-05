'use client'

import { useEffect, useState } from 'react'

export function AccountChatBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchCount() {
      try {
        const res = await fetch('/directory/api/patient/chats/count/', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setCount(data.unread ?? 0)
      } catch {
        // silently ignore
      }
    }

    fetchCount()
    const id = setInterval(fetchCount, 10_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  if (count === 0) return null

  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-medium text-white">
      {count > 99 ? '99+' : count}
    </span>
  )
}
