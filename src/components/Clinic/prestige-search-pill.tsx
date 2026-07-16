'use client'

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
  const labels = [awardsBadgeLabel, tatlerBadgeLabel].filter(Boolean) as string[]
  if (labels.length === 0) return null

  return (
    <div
      className={cn(
        'mt-1 flex w-full flex-col items-center gap-1 px-1',
        className,
      )}
    >
      {labels.map((label) => (
        <span
          key={label}
          className="inline-flex max-w-full items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-center text-[10px] font-semibold leading-snug text-amber-900 ring-1 ring-amber-200"
        >
          <span aria-hidden className="shrink-0">
            🏆
          </span>
          <span className="whitespace-normal break-words text-left">{label}</span>
        </span>
      ))}
    </div>
  )
}
