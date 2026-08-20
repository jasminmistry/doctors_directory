'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { IconLoader2, IconMail, IconSquare, IconSquareCheck } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

interface EligibleClinic {
  id: number
  slug: string
  name: string
  email: string
  cityName: string | null
  campaignEmailedAt: string | null
  campaignEmailReadAt: string | null
}

interface SendProgress {
  chunksDone: number
  chunksTotal: number
  sent: number
  failed: number
  skipped: number
}

const CHUNK_SIZE = 50

export default function AdminClaimInvitesPage() {
  const [clinics, setClinics] = useState<EligibleClinic[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState<SendProgress | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/directory/api/admin/clinics/claim-invites/', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setClinics(data.clinics ?? []) })
      .catch(() => { if (!cancelled) toast.error('Failed to load unclaimed clinics') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(selected.size === clinics.length ? new Set() : new Set(clinics.map((c) => c.id)))
  }

  async function sendInvites() {
    const clinicIds = Array.from(selected)
    if (!clinicIds.length) return
    if (!window.confirm(`Send the claim-invite email to ${clinicIds.length} clinic${clinicIds.length !== 1 ? 's' : ''}?`)) return

    const chunks: number[][] = []
    for (let i = 0; i < clinicIds.length; i += CHUNK_SIZE) chunks.push(clinicIds.slice(i, i + CHUNK_SIZE))

    setSending(true)
    setProgress({ chunksDone: 0, chunksTotal: chunks.length, sent: 0, failed: 0, skipped: 0 })

    const totals = { sent: 0, failed: 0, skipped: 0 }

    for (const chunk of chunks) {
      try {
        const res = await fetch('/directory/api/admin/clinics/claim-invites/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clinicIds: chunk }),
        })
        if (!res.ok) {
          totals.failed += chunk.length
        } else {
          const { sent, failed, skipped, sentIds } = await res.json()
          totals.sent += sent
          totals.failed += failed
          totals.skipped += skipped
          const sentSet = new Set<number>(sentIds)
          const now = new Date().toISOString()
          setClinics((prev) => prev.map((c) => (sentSet.has(c.id) ? { ...c, campaignEmailedAt: now } : c)))
        }
      } catch {
        totals.failed += chunk.length
      }
      setProgress((prev) => (prev ? { ...prev, chunksDone: prev.chunksDone + 1, ...totals } : prev))
    }

    toast.success(
      `Sent ${totals.sent} claim invite${totals.sent !== 1 ? 's' : ''}` +
        `${totals.failed ? `, ${totals.failed} failed` : ''}` +
        `${totals.skipped ? `, ${totals.skipped} skipped (no longer eligible)` : ''}`,
    )
    setSelected(new Set())
    setSending(false)
    setProgress(null)
  }

  const allSelected = clinics.length > 0 && selected.size === clinics.length
  const someSelected = selected.size > 0

  return (
    <AdminLayout title="Claim Invites">
      <p className="mb-4 text-sm text-gray-600">
        Unclaimed clinics eligible for the &ldquo;claim your free listing&rdquo; outreach email. Clinics that have
        unsubscribed or already been claimed are excluded automatically.
      </p>

      {someSelected && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">{selected.size} selected</span>
            <div className="ml-auto">
              <Button
                type="button"
                disabled={sending}
                onClick={sendInvites}
                className="flex items-center gap-1.5 disabled:opacity-50"
              >
                {sending ? <IconLoader2 stroke={1.5} className="h-3 w-3 animate-spin" /> : <IconMail stroke={1.5} className="h-3 w-3" />}
                Send claim invite
              </Button>
            </div>
          </div>

          {progress && (
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gray-700 transition-all duration-300"
                  style={{ width: `${(progress.chunksDone / progress.chunksTotal) * 100}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-600">
                {progress.chunksDone}/{progress.chunksTotal} batches &middot; {progress.sent} sent
                {progress.failed ? `, ${progress.failed} failed` : ''}
                {progress.skipped ? `, ${progress.skipped} skipped` : ''}
              </p>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><IconLoader2 stroke={1.5} className="h-6 w-6 animate-spin text-gray-600" /></div>
      ) : clinics.length === 0 ? (
        <p className="text-sm text-gray-600 py-8 text-center">No eligible unclaimed clinics.</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-1">
            <button type="button" disabled={sending} onClick={toggleAll} className="text-gray-600 hover:text-gray-700 disabled:opacity-50">
              {allSelected ? <IconSquareCheck stroke={1.5} className="h-4 w-4 text-gray-700" /> : <IconSquare stroke={1.5} className="h-4 w-4" />}
            </button>
            <span className="text-xs text-gray-600">{allSelected ? 'Deselect all' : 'Select all'}</span>
            <span className="text-xs text-gray-600 ml-auto">{clinics.length} eligible</span>
          </div>

          {clinics.map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={sending}
              onClick={() => toggleOne(c.id)}
              className={cn(
                'w-full rounded-lg border bg-white p-4 text-left transition-colors flex items-start gap-3 disabled:opacity-50',
                selected.has(c.id) ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:bg-gray-50',
              )}
            >
              <span className="mt-0.5 shrink-0 text-gray-600">
                {selected.has(c.id) ? <IconSquareCheck stroke={1.5} className="h-4 w-4 text-gray-700" /> : <IconSquare stroke={1.5} className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-gray-900">{c.name}</span>
                  {c.cityName && <span className="text-xs text-gray-600">{c.cityName}</span>}
                </span>
                <span className="block truncate text-xs text-gray-600 mt-0.5" title={c.email}>{c.email}</span>
                {c.campaignEmailedAt && (
                  <span className="block text-[11px] text-amber-600 mt-1">
                    Last emailed {formatDistanceToNow(new Date(c.campaignEmailedAt), { addSuffix: true })}
                  </span>
                )}
                {c.campaignEmailReadAt && (
                  <span className="block text-[11px] text-green-600 mt-0.5">
                    Opened {formatDistanceToNow(new Date(c.campaignEmailReadAt), { addSuffix: true })}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
