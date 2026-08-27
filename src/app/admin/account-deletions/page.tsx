'use client'

import { useEffect, useState } from 'react'
import { AdminLayout, useAdminCounts } from '@/components/admin/AdminLayout'
import { DEFAULT_PERSON, FallbackImage } from '@/components/ui/fallback-image'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { IconClock, IconLoader2, IconRestore, IconTrash, IconUserOff } from '@tabler/icons-react'

export const dynamic = 'force-dynamic'

interface DeletionRow {
  entityType: 'clinic' | 'practitioner'
  slug: string
  name: string | null
  image: string | null
  email: string | null
  scheduledDeletionAt: string
}

export default function AccountDeletionsPage() {
  const [rows, setRows] = useState<DeletionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<Record<string, string>>({})
  const { refreshCounts } = useAdminCounts()

  useEffect(() => {
    fetch('/directory/api/admin/account-deletions/')
      .then((r) => r.json())
      .then((data) => { setRows(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function rowKey(row: DeletionRow) {
    return `${row.entityType}:${row.slug}`
  }

  async function doAction(row: DeletionRow, action: string, fn: () => Promise<Response>) {
    const key = rowKey(row)
    setBusy((b) => ({ ...b, [key]: action }))
    try {
      const res = await fn()
      if (!res.ok) { toast.error('Action failed'); return }
      return res
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setBusy((b) => { const n = { ...b }; delete n[key]; return n })
    }
  }

  async function handleRestore(row: DeletionRow) {
    const res = await doAction(row, 'restore', () =>
      fetch(`/directory/api/admin/account-deletions/${row.entityType}/${row.slug}/restore/`, { method: 'POST' })
    )
    if (res) {
      toast.success('Listing restored.')
      setRows((prev) => prev.filter((r) => rowKey(r) !== rowKey(row)))
      refreshCounts()
    }
  }

  async function handlePurgeNow(row: DeletionRow) {
    if (!confirm(`Permanently delete ${row.name ?? row.slug} now? This cannot be undone.`)) return
    const res = await doAction(row, 'purge', () =>
      fetch(`/directory/api/admin/account-deletions/${row.entityType}/${row.slug}/purge/`, { method: 'POST' })
    )
    if (res) {
      toast.success('Listing permanently deleted.')
      setRows((prev) => prev.filter((r) => rowKey(r) !== rowKey(row)))
      refreshCounts()
    }
  }

  return (
    <AdminLayout title="Account Deletions">
      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-gray-600">
          Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-600">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <IconUserOff stroke={1.5} className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium">No pending account deletions</p>
          <p className="text-xs text-gray-600">Clinics and practitioners who self-serve delete their profile appear here during their 7-day grace period.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {rows.length} pending deletion{rows.length !== 1 ? 's' : ''}. Listings are already hidden from the directory —
            they&apos;ll be permanently purged automatically once the grace period ends, unless the owner cancels via their emailed link.
          </p>

          <div className="space-y-3">
            {rows.map((row) => {
              const key = rowKey(row)
              const isBusy = !!busy[key]
              const displayName = row.name || row.slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

              return (
                <div key={key} className="rounded-lg border border-gray-200 bg-white p-5">
                  <div className="flex items-start gap-4">
                    {row.image
                      ? <FallbackImage src={row.image.replaceAll('"', '')} alt={displayName} className="h-12 w-12 rounded-lg object-cover shrink-0" fallback={DEFAULT_PERSON} />
                      : <div className="h-12 w-12 rounded-lg bg-gray-100 shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 capitalize">
                          {row.entityType}
                        </span>
                      </div>
                      {row.email && <p className="text-xs text-gray-600 mt-0.5">{row.email}</p>}
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <IconClock stroke={1.5} className="h-3 w-3" />
                          Permanently deleted: <span className="font-medium text-gray-700">{format(new Date(row.scheduledDeletionAt), 'd MMM yyyy, HH:mm')}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(row)}
                      disabled={isBusy}
                    >
                      {busy[key] === 'restore' ? <IconLoader2 stroke={1.5} className="h-3.5 w-3.5 animate-spin" /> : <IconRestore stroke={1.5} className="h-3.5 w-3.5" />}
                      Restore
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handlePurgeNow(row)}
                      disabled={isBusy}
                    >
                      {busy[key] === 'purge' ? <IconLoader2 stroke={1.5} className="h-3.5 w-3.5 animate-spin" /> : <IconTrash stroke={1.5} className="h-3.5 w-3.5" />}
                      Purge now
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
