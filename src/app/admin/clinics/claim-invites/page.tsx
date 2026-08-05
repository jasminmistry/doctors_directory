'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Loader2, CheckSquare, Square, Mail } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface EligibleClinic {
  id: number
  slug: string
  name: string
  email: string
  cityName: string | null
  campaignEmailedAt: string | null
}

export default function AdminClaimInvitesPage() {
  const [clinics, setClinics] = useState<EligibleClinic[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [sending, setSending] = useState(false)

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

    setSending(true)
    try {
      const res = await fetch('/directory/api/admin/clinics/claim-invites/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicIds }),
      })
      if (!res.ok) { toast.error('Send failed'); return }
      const { sent, failed, skipped } = await res.json()
      toast.success(`Sent ${sent} claim invite${sent !== 1 ? 's' : ''}${failed ? `, ${failed} failed` : ''}${skipped ? `, ${skipped} skipped (no longer eligible)` : ''}`)
      const now = new Date().toISOString()
      setClinics((prev) => prev.map((c) => (selected.has(c.id) ? { ...c, campaignEmailedAt: now } : c)))
      setSelected(new Set())
    } catch {
      toast.error('Send failed')
    } finally {
      setSending(false)
    }
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
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <span className="text-sm font-medium text-gray-700">{selected.size} selected</span>
          <div className="ml-auto">
            <button
              type="button"
              disabled={sending}
              onClick={sendInvites}
              className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
              Send claim invite
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-gray-600" /></div>
      ) : clinics.length === 0 ? (
        <p className="text-sm text-gray-600 py-8 text-center">No eligible unclaimed clinics.</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-1">
            <button type="button" onClick={toggleAll} className="text-gray-600 hover:text-gray-700">
              {allSelected ? <CheckSquare className="h-4 w-4 text-gray-700" /> : <Square className="h-4 w-4" />}
            </button>
            <span className="text-xs text-gray-600">{allSelected ? 'Deselect all' : 'Select all'}</span>
            <span className="text-xs text-gray-400 ml-auto">{clinics.length} eligible</span>
          </div>

          {clinics.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleOne(c.id)}
              className={cn(
                'w-full rounded-lg border bg-white p-4 text-left transition-colors flex items-start gap-3',
                selected.has(c.id) ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:bg-gray-50',
              )}
            >
              <span className="mt-0.5 shrink-0 text-gray-600">
                {selected.has(c.id) ? <CheckSquare className="h-4 w-4 text-gray-700" /> : <Square className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-gray-900">{c.name}</span>
                  {c.cityName && <span className="text-xs text-gray-600">{c.cityName}</span>}
                </span>
                <span className="block text-xs text-gray-600 mt-0.5">{c.email}</span>
                {c.campaignEmailedAt && (
                  <span className="block text-[11px] text-amber-600 mt-1">
                    Last emailed {formatDistanceToNow(new Date(c.campaignEmailedAt), { addSuffix: true })}
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
