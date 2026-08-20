'use client'

import { cn } from '@/lib/utils'

type PrestigeSearchPillProps = {
  awardsBadgeLabel?: string | null
  tatlerBadgeLabel?: string | null
  consentzLabel?: string | null
  className?: string
}

export function PrestigeSearchPill({
  awardsBadgeLabel,
  tatlerBadgeLabel,
  consentzLabel,
  className,
}: PrestigeSearchPillProps) {
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
        'mt-1 flex w-full flex-col items-center gap-1 px-1',
        className,
      )}
    >
      {labels.map((item) => (
        <span
          key={item.key}
          className="inline-flex max-w-full items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-center text-[10px] font-semibold leading-snug text-amber-900 ring-1 ring-amber-200"
        >
          {item.kind === 'consentz' ? (
            <img
              src="/directory/consentz-customer-badge.jpg"
              alt=""
              className="h-3.5 w-3.5 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span aria-hidden className="shrink-0">
              🏆
            </span>
          )}
          <span className="whitespace-normal break-words text-left">{item.label}</span>
        </span>
      ))}
    </div>
  )
}
