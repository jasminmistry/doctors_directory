'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { IconStar, IconCopy, IconPlus, IconX } from '@tabler/icons-react'

interface FeedbackItem {
  id: number
  rating: number
  comment: string
  submitterName: string | null
  submittedAt: string
  googleReviewClickedAt: string | null
  publishedReviewId: number | null
}
interface Stats {
  count: number
  average: number
  distribution: { star: number; count: number }[]
  googleClicks: number
}
interface RequestItem {
  id: number
  patientName: string | null
  patientEmail: string | null
  channel: string
  issuedAt: string
  emailSentAt: string | null
  expiresAt: string
  usedAt: string | null
  feedback: { id: number; rating: number; submittedAt: string } | null
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <IconStar
          key={i}
          className={cn('h-3.5 w-3.5', i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200')}
        />
      ))}
    </div>
  )
}

export function ReviewsManager() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [fbRes, reqRes] = await Promise.all([
        fetch('/directory/api/portal/gbp/private-feedback/', { cache: 'no-store' }),
        fetch('/directory/api/portal/gbp/review-requests/', { cache: 'no-store' }),
      ])
      if (fbRes.ok) {
        const d = await fbRes.json()
        setStats(d.stats)
        setItems(d.items)
      }
      if (reqRes.ok) setRequests((await reqRes.json()).requests)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function publish(id: number) {
    const res = await fetch(`/directory/api/portal/gbp/private-feedback/${id}/publish/`, { method: 'POST' })
    if (res.ok) {
      toast.success('Sent for moderation — it will appear on your profile once approved.')
      void load()
    } else {
      const d = await res.json().catch(() => null)
      toast.error(d?.error ?? 'Failed to publish')
    }
  }

  if (loading && !stats) {
    return <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">Loading…</div>
  }

  const pending = requests.filter((r) => !r.usedAt && new Date(r.expiresAt).getTime() > Date.now())

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Private feedback" value={stats?.count ?? 0} />
        <Stat label="Average rating" value={stats?.count ? stats.average.toFixed(1) : '—'} />
        <Stat label="Pending requests" value={pending.length} />
        <Stat label="Google clicks" value={stats?.googleClicks ?? 0} />
      </div>

      <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600">
        Private feedback is visible only to you and is never published. It reflects private sentiment and
        can differ from your public Google rating.
      </p>

      {/* Requests */}
      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Review requests</h2>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
          >
            <IconPlus className="h-3.5 w-3.5" /> Get reviews
          </button>
        </div>
        {requests.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-600">No requests yet. Create a link to share with a patient.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {requests.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">
                    {r.patientName || r.patientEmail || 'Shared link'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(r.issuedAt).toLocaleDateString()} ·{' '}
                    {r.usedAt
                      ? `Responded${r.feedback ? ` (${r.feedback.rating}★)` : ''}`
                      : new Date(r.expiresAt).getTime() < Date.now()
                        ? 'Expired'
                        : r.emailSentAt
                          ? 'Email sent'
                          : 'Awaiting response'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Private feedback */}
      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Private feedback</h2>
        </div>
        {items.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-600">No feedback yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((it) => (
              <li key={it.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Stars rating={it.rating} />
                      <span className="text-sm font-medium text-gray-900">{it.submitterName || 'Anonymous'}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700">{it.comment}</p>
                    <p className="mt-1 text-xs text-gray-400">{new Date(it.submittedAt).toLocaleString()}</p>
                  </div>
                  {it.publishedReviewId ? (
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      On profile
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => publish(it.id)}
                      className="shrink-0 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Publish to profile
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {modalOpen && <GetReviewsModal onClose={() => setModalOpen(false)} onCreated={load} />}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
      <p className="text-lg font-semibold text-gray-900">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
    </div>
  )
}

function GetReviewsModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [link, setLink] = useState<string | null>(null)

  async function create() {
    setSubmitting(true)
    try {
      const res = await fetch('/directory/api/portal/gbp/review-requests/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: name.trim() || undefined,
          patientEmail: email.trim() || undefined,
          sendEmail,
        }),
      })
      const d = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(d?.error ?? 'Failed to create link')
        return
      }
      setLink(d.feedbackUrl)
      if (d.emailSent) toast.success('Feedback request emailed.')
      onCreated()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Get reviews</h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <IconX className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {link ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-600">Share this link with your patient:</p>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <span className="truncate text-xs text-gray-700">{link}</span>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(link)
                  toast.success('Copied')
                }}
                className="shrink-0 text-gray-500 hover:text-gray-900"
                aria-label="Copy link"
              >
                <IconCopy className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Patient name (optional)"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Patient email (optional)"
              type="email"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                disabled={!email.trim()}
              />
              Email the request to the patient
            </label>
            <button
              type="button"
              onClick={create}
              disabled={submitting}
              className="w-full rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {submitting ? 'Creating…' : 'Create link'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
