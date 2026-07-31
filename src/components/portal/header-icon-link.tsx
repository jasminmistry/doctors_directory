'use client'

import Link from 'next/link'
import { LucideIcon, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderIconLinkProps {
  href: string
  label: string
  icon: LucideIcon
  badge?: React.ReactNode
  locked?: boolean
  active?: boolean
}

export function HeaderIconLink({
  href,
  label,
  icon: Icon,
  badge,
  locked = false,
  active = false,
}: HeaderIconLinkProps) {
  return (
    <Link
      href={href}
      title={locked ? `Upgrade to access ${label}` : label}
      aria-label={label}
      className={cn(
        'relative inline-flex h-11 w-11 items-center justify-center rounded-lg text-black transition-colors hover:bg-black/10',
        active && 'bg-black/10',
      )}
    >
      <Icon className="h-6 w-6" strokeWidth={1.5} />
      {locked ? (
        <Lock className="absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full bg-white text-gray-500" />
      ) : (
        badge
      )}
    </Link>
  )
}
