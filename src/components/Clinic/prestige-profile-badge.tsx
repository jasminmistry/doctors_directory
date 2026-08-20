'use client'

import { cn } from '@/lib/utils'

type PrestigeProfileBadgeProps = {
  awardsBadgeLabel?: string | null
  tatlerBadgeLabel?: string | null
  consentzLabel?: string | null
  size?: 'sm' | 'md'
  className?: string
}

export function PrestigeProfileBadge({
  awardsBadgeLabel,
  tatlerBadgeLabel,
  consentzLabel,
  size = 'md',
  className,
}: PrestigeProfileBadgeProps) {
  const labels = [
    consentzLabel
      ? { key: 'consentz', label: consentzLabel, kind: 'consentz' as const }
      : null,
    awardsBadgeLabel
      ? { key: awardsBadgeLabel, label: awardsBadgeLabel, kind: 'prestige' as const }
      : null,
    tatlerBadgeLabel
      ? { key: tatlerBadgeLabel, label: tatlerBadgeLabel, kind: 'prestige' as const }
      : null,
  ].filter(Boolean) as Array<{ key: string; label: string; kind: 'consentz' | 'prestige' }>

  if (labels.length === 0) return null

  return (
    <div
      className={cn(
        'flex flex-col gap-1',
        size === 'sm' ? 'items-center' : 'items-start md:items-start',
        className,
      )}
    >
      {labels.map((item) => (
        <span
          key={item.key}
          className={cn(
            'inline-flex w-fit max-w-full items-center gap-1 rounded-full bg-amber-50 font-semibold leading-snug text-amber-900 ring-1 ring-amber-200',
            size === 'sm'
              ? 'px-2 py-0.5 text-[10px]'
              : 'px-2.5 py-1 text-xs md:text-sm',
          )}
        >
          {item.kind === 'consentz' ? (
            <img
              src="/directory/consentz-customer-badge.jpg"
              alt=""
              className={cn(
                'shrink-0 rounded-full object-cover',
                size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4 md:h-5 md:w-5',
              )}
            />
          ) : (
            <span aria-hidden className="shrink-0">
              🏆
            </span>
          )}
          <span className="whitespace-normal break-words">{item.label}</span>
        </span>
      ))}
    </div>
  )
}
