'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconChevronDown, IconLoader2 } from '@tabler/icons-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { PortalClinicSummary } from '@/lib/types'

const DEFAULT_ENTITY_IMG = '/directory/images/default-dr-profile-1.webp'

interface ClinicSwitcherProps {
  activeClinicId: number
  activeName: string
  activeImage: string | null
  clinics: PortalClinicSummary[]
  compact?: boolean
}

export function ClinicSwitcher({
  activeClinicId,
  activeName,
  activeImage,
  clinics,
  compact = false,
}: ClinicSwitcherProps) {
  const router = useRouter()
  const [isSwitching, setIsSwitching] = useState(false)
  const canSwitch = clinics.length > 1

  async function switchClinic(clinicId: number) {
    if (clinicId === activeClinicId || isSwitching) return
    setIsSwitching(true)
    try {
      const res = await fetch('/directory/api/portal/switch-clinic/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicId }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch {
      // no-op — trigger stays enabled, user can retry
    } finally {
      setIsSwitching(false)
    }
  }

  const trigger = (
    <button
      type="button"
      disabled={!canSwitch || isSwitching}
      aria-label={canSwitch ? 'Switch clinic' : undefined}
      className={cn(
        'flex items-center gap-2.5 rounded-lg transition-colors',
        canSwitch && !isSwitching && 'hover:bg-black/5 cursor-pointer',
        !canSwitch && 'cursor-default',
        compact ? 'px-1 py-1' : 'px-2 py-1.5',
      )}
    >
      <img
        src={activeImage || DEFAULT_ENTITY_IMG}
        alt={activeName || 'Clinic'}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
        onError={(e) => {
          e.currentTarget.src = DEFAULT_ENTITY_IMG
        }}
      />
      {!compact && (
        <div className="min-w-0 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
            Consentz Portal
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900 truncate">
            {activeName || 'My Portal'}
          </p>
        </div>
      )}
      {compact && (
        <span className="text-sm font-semibold text-gray-900 truncate">
          {activeName || 'My Portal'}
        </span>
      )}
      {isSwitching ? (
        <IconLoader2 stroke={1.5} className="h-4 w-4 shrink-0 animate-spin text-gray-500" />
      ) : (
        <IconChevronDown
          stroke={1.5}
          className={cn('h-4 w-4 shrink-0', canSwitch ? 'text-gray-500' : 'text-gray-300')}
        />
      )}
    </button>
  )

  if (!canSwitch) {
    return trigger
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {clinics.map((clinic) => (
          <DropdownMenuItem
            key={clinic.clinicId}
            onSelect={() => switchClinic(clinic.clinicId)}
            className={cn(
              'gap-2.5 py-2',
              clinic.clinicId === activeClinicId && 'bg-accent',
            )}
          >
            <img
              src={clinic.image || DEFAULT_ENTITY_IMG}
              alt={clinic.name}
              className="h-7 w-7 shrink-0 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_ENTITY_IMG
              }}
            />
            <span className="truncate">{clinic.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
