'use client'

import { Trophy } from 'lucide-react'
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
        'pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-0.5 px-0.5',
        className,
      )}
    >
      {labels.map((label) => (
        <span
          key={label}
          className={cn(
            'inline-flex max-w-full items-center justify-center gap-0.5 rounded-full bg-amber-500 text-center font-semibold leading-tight text-white shadow-sm ring-1 ring-white/80',
            size === 'sm'
              ? 'px-1.5 py-0.5 text-[8px] md:text-[9px]'
              : 'px-2 py-1 text-[10px] md:text-xs',
          )}
          title={label}
        >
          <Trophy
            className={cn('shrink-0', size === 'sm' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5')}
            aria-hidden
          />
          <span className="truncate">{label}</span>
        </span>
      ))}
    </div>
  )
}
