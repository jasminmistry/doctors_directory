'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { IconAlertTriangle, IconLinkOff, IconLoader2, IconX } from '@tabler/icons-react'

interface CoreUnlinkCardProps {
  slug: string
}

export function CoreUnlinkCard({ slug }: CoreUnlinkCardProps) {
  const [requestedAt, setRequestedAt] = useState<string | null>(null)
  const [coreId, setCoreId] = useState<number | null>(null)
  const [loading, setLoading] = useState<'unlink' | 'dismiss' | null>(null)

  useEffect(() => {
    fetch(`/directory/api/admin/clinics/${slug}/`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return
        setRequestedAt(data.coreUnlinkRequestedAt ?? null)
        setCoreId(data.coreClinicId ?? null)
      })
      .catch(() => {})
  }, [slug])

  if (!requestedAt) return null

  async function handleUnlink() {
    setLoading('unlink')
    try {
      const res = await fetch(`/directory/api/admin/clinics/${slug}/unlink-core/`, { method: 'POST' })
      if (!res.ok) { toast.error('Failed to unlink'); return }
      toast.success('Core account unlinked successfully.')
      setRequestedAt(null)
      setCoreId(null)
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setLoading(null)
    }
  }

  async function handleDismiss() {
    setLoading('dismiss')
    try {
      const res = await fetch(`/directory/api/admin/clinics/${slug}/dismiss-unlink/`, { method: 'POST' })
      if (!res.ok) { toast.error('Failed to dismiss'); return }
      toast.success('Unlink request dismissed.')
      setRequestedAt(null)
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
          <IconAlertTriangle stroke={1.5} className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-900">
            Clinic requested Core account unlink
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Requested {format(new Date(requestedAt), 'd MMM yyyy, HH:mm')}.
            {coreId && ` Core Clinic ID: ${coreId}.`}
            {' '}Approving will set coreClinicId to null, disabling calendar, booking sync, and Core chat.
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={handleUnlink}
          disabled={!!loading}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading === 'unlink' ? <IconLoader2 stroke={1.5} className="h-3.5 w-3.5 animate-spin" /> : <IconLinkOff stroke={1.5} className="h-3.5 w-3.5" />}
          Approve &amp; unlink
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          disabled={!!loading}
          className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50 transition disabled:opacity-50"
        >
          {loading === 'dismiss' ? <IconLoader2 stroke={1.5} className="h-3.5 w-3.5 animate-spin" /> : <IconX stroke={1.5} className="h-3.5 w-3.5" />}
          Dismiss request
        </button>
      </div>
    </div>
  )
}
