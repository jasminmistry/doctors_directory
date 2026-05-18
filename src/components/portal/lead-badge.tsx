'use client'

import { useEffect, useState } from 'react'

interface LeadBadgeProps {
  mobile?: boolean
}

export function LeadBadge({ mobile = false }: LeadBadgeProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchCount() {
      try {
        const res = await fetch('/directory/api/portal/leads/count', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setCount(data.new ?? 0)
      } catch {
        // silently ignore — badge just won't show
      }
    }

    fetchCount()
    const id = setInterval(fetchCount, 60_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  if (count === 0) return null

  if (mobile) {
    return (
      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
        {count > 9 ? '9+' : count}
      </span>
    )
  }

  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
      {count > 99 ? '99+' : count}
    </span>
  )
}
