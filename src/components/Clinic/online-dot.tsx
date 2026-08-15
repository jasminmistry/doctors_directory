'use client'

import { useEffect, useState } from 'react'

interface OnlineDotProps {
  slug: string
  refreshMs?: number
}

export function OnlineDot({ slug, refreshMs = 120_000 }: OnlineDotProps) {
  const [online, setOnline] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const res = await fetch(`/directory/api/chat/${slug}/status/`)
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
  }, [slug, refreshMs])

  if (!online) return null

  return (
    <span
      className="relative inline-flex items-center shrink-0 group/dot"
      aria-label="Online"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover/dot:opacity-100">
        Online
      </span>
    </span>
  )
}
