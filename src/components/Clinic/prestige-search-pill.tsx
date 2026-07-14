'use client'

import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

type PrestigeSearchPillProps = {
  awardsBadgeLabel?: string | null
  tatlerBadgeLabel?: string | null
  className?: string
}

export function PrestigeSearchPill({
  awardsBadgeLabel,
  tatlerBadgeLabel,
  className,
}: PrestigeSearchPillProps) {
  const label = awardsBadgeLabel || tatlerBadgeLabel
  if (!label) return null

  return (
    <div
      className={cn(
        'mt-1 flex min-h-[1.25rem] w-full items-center justify-center px-1',
        className,
      )}
    >
      <span
        className="inline-flex max-w-full items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold leading-tight text-amber-900 ring-1 ring-amber-200"
        title={[awardsBadgeLabel, tatlerBadgeLabel].filter(Boolean).join(' · ')}
      >
        <Trophy className="h-3 w-3 shrink-0 text-amber-600" aria-hidden />
        <span className="truncate">{label}</span>
      </span>
    </div>
  )
}
