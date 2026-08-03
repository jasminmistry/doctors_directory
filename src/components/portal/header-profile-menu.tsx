'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { User, Globe, LogOut, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProfileMenuProps {
  name: string
  onLogout: () => void
}

export function HeaderProfileMenu({ name, onLogout }: HeaderProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className={cn(
          'inline-flex h-11 w-11 items-center justify-center rounded-lg text-black transition-colors hover:bg-black/10',
          open && 'bg-black/10',
        )}
      >
        <User className="h-6 w-6" strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <p className="truncate px-3 py-2 text-xs font-medium text-gray-500">
            {name}
          </p>
          <div className="mx-1 border-t border-gray-100" />
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            <Globe className="h-4 w-4 shrink-0" />
            <span className="flex-1">View Directory</span>
            <ExternalLink className="h-3 w-3 opacity-80" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
