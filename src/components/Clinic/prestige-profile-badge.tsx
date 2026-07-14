'use client'

import { cn } from '@/lib/utils'

type PrestigeProfileBadgeProps = {
  awardsBadgeLabel?: string | null
  tatlerBadgeLabel?: string | null
  size?: 'sm' | 'md'
  className?: string
}

export function PrestigeProfileBadge({
  awardsBadgeLabel,
  tatlerBadgeLabel,
  size = 'md',
  className,
}: PrestigeProfileBadgeProps) {
  const labels = [awardsBadgeLabel, tatlerBadgeLabel].filter(Boolean) as string[]
  if (labels.length === 0) return null

  return (
    <div
      className={cn(
        'flex flex-col gap-1',
        size === 'sm' ? 'items-center' : 'items-start',
        className,
      )}
    >
      {labels.map((label) => (
        <span
          key={label}
          className={cn(
            'inline-flex w-fit max-w-full items-center gap-1 rounded-full bg-amber-500 font-semibold leading-snug text-white shadow-sm',
            size === 'sm'
              ? 'px-2 py-0.5 text-[10px]'
              : 'px-2.5 py-1 text-xs md:text-sm',
          )}
        >
          <span aria-hidden className="shrink-0">
            🏆
          </span>
          <span className="whitespace-normal break-words">{label}</span>
        </span>
      ))}
    </div>
  )
}
