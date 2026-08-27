'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { IconExternalLink, IconLogout, IconTrash, IconUser, IconWorld } from '@tabler/icons-react';
import { cn } from '@/lib/utils'
import { DeleteAccountModal } from '@/components/portal/delete-account-modal'

interface HeaderProfileMenuProps {
  name: string
  onLogout: () => void
  /** When set, shows a "Delete account" item that opens the GDPR self-serve deletion flow. */
  entityType?: 'clinic' | 'practitioner'
}

export function HeaderProfileMenu({ name, onLogout, entityType }: HeaderProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
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
          'inline-flex h-[40px] w-[40px] items-center justify-center rounded-full hover:cursor-pointer text-black transition-colors hover:bg-black/10',
          open && 'bg-black/10',
        )}
      >
        <IconUser stroke={1.5} />
      </button>

      {open && (
        <div className="absolute right-0 top-full p-[5px] z-40 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-[0_3px_12px_rgba(0,0,0,0.05)]">
          <p className="truncate px-3 py-2 text-xs font-medium text-gray-600">
            {name}
          </p>
          <div className="border-t my-[6px] border-[#e0e0e0]" />
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex rounded-[3px] items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            <IconWorld stroke={1.5} className="shrink-0" />
            <span className="flex-1">View Directory</span>
            <IconExternalLink stroke={1.5} className="w-4 h-4 opacity-80" />
          </Link>
          <div className="border-t my-[6px] border-[#e0e0e0]" />
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
            className="flex rounded-[3px] w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:cursor-pointer"
          >
            <IconLogout stroke={1.5} className="shrink-0" />
            Sign out
          </button>
          {entityType && (
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setDeleteModalOpen(true)
              }}
              className="flex rounded-[3px] w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:cursor-pointer"
            >
              <IconTrash stroke={1.5} className="shrink-0" />
              Delete account
            </button>
          )}
        </div>
      )}

      {entityType && (
        <DeleteAccountModal
          open={deleteModalOpen}
          entityType={entityType}
          entityName={name}
          onClose={() => setDeleteModalOpen(false)}
          onDeleted={() => {
            setDeleteModalOpen(false)
            onLogout()
          }}
        />
      )}
    </div>
  )
}
