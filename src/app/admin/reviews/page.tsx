'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Star, ShieldCheck, Loader2, Trash2, CheckSquare, Square } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Review {
  id: number
  patientName: string
  rating: number
  reviewText: string
  treatment: string | null
  isVerifiedPatient: boolean
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  clinic: { slug: string; name: string | null }
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn('h-3.5 w-3.5', i < rating ? 'fill-black text-black' : 'text-gray-200')} />
      ))}
    </div>
  )
}

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState<number | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [bulkActioning, setBulkActioning] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setSelected(new Set())
    fetch(`/directory/api/admin/reviews?status=${tab}&_t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => { if (!cancelled) setReviews(data.reviews ?? []) })
      .catch(() => { if (!cancelled) toast.error('Failed to load reviews') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [tab])

  async function action(id: number, act: 'approve' | 'reject', verifiedPatient?: boolean) {
    setActioning(id)
    try {
      const res = await fetch(`/directory/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: act, isVerifiedPatient: verifiedPatient }),
      })
      if (!res.ok) { toast.error('Action failed'); return }
      toast.success(act === 'approve' ? 'Review approved' : 'Review rejected')
      setReviews((prev) => prev.filter((r) => r.id !== id))
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next })
    } catch {
      toast.error('Action failed')
    } finally {
      setActioning(null)
    }
  }

  async function deleteOne(id: number) {
    setActioning(id)
    try {
      const res = await fetch(`/directory/api/admin/reviews/${id}`, { method: 'DELETE' })
      if (!res.ok) { toast.error('Delete failed'); return }
      toast.success('Review deleted')
      setReviews((prev) => prev.filter((r) => r.id !== id))
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next })
    } catch {
      toast.error('Delete failed')
    } finally {
      setActioning(null)
    }
  }

  async function bulkAction(act: 'approve' | 'reject' | 'delete') {
    const ids = Array.from(selected)
    if (!ids.length) return
    setBulkActioning(true)
    try {
      const res = await fetch('/directory/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: act, ids }),
      })
      if (!res.ok) { toast.error('Bulk action failed'); return }
      const { affected } = await res.json()
      const label = act === 'approve' ? 'approved' : act === 'reject' ? 'rejected' : 'deleted'
      toast.success(`${affected} review${affected !== 1 ? 's' : ''} ${label}`)
      setReviews((prev) => prev.filter((r) => !selected.has(r.id)))
      setSelected(new Set())
    } catch {
      toast.error('Bulk action failed')
    } finally {
      setBulkActioning(false)
    }
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === reviews.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(reviews.map((r) => r.id)))
    }
  }

  const allSelected = reviews.length > 0 && selected.size === reviews.length
  const someSelected = selected.size > 0

  return (
    <AdminLayout title="Reviews">
      <div className="mb-4 flex gap-2">
        {(['pending', 'approved', 'rejected'] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={cn('rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors',
              tab === t ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50')}>
            {t}
          </button>
        ))}
      </div>

      {/* Bulk action toolbar */}
      {someSelected && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <span className="text-sm font-medium text-gray-700">{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            {tab === 'pending' && (
              <>
                <button type="button" disabled={bulkActioning}
                  onClick={() => bulkAction('approve')}
                  className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50">
                  Approve all
                </button>
                <button type="button" disabled={bulkActioning}
                  onClick={() => bulkAction('reject')}
                  className="rounded-lg border border-[#e0e0e0]  px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  Reject all
                </button>
              </>
            )}
            {tab === 'rejected' && (
              <button type="button" disabled={bulkActioning}
                onClick={() => bulkAction('approve')}
                className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50">
                Approve all
              </button>
            )}
            {tab === 'approved' && (
              <button type="button" disabled={bulkActioning}
                onClick={() => bulkAction('reject')}
                className="rounded-lg border border-[#e0e0e0]  px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                Reject all
              </button>
            )}
            <button type="button" disabled={bulkActioning}
              onClick={() => bulkAction('delete')}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
              Delete all
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-gray-500" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">No {tab} reviews.</p>
      ) : (
        <div className="space-y-3">
          {/* Select-all row */}
          <div className="flex items-center gap-3 px-1">
            <button type="button" onClick={toggleAll} className="text-gray-500 hover:text-gray-700">
              {allSelected
                ? <CheckSquare className="h-4 w-4 text-gray-700" />
                : <Square className="h-4 w-4" />}
            </button>
            <span className="text-xs text-gray-500">
              {allSelected ? 'Deselect all' : 'Select all'}
            </span>
          </div>

          {reviews.map(r => (
            <div key={r.id}
              className={cn('rounded-xl border bg-white p-5 transition-colors',
                selected.has(r.id) ? 'border-gray-400 bg-gray-50' : 'border-gray-200')}>
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button type="button" onClick={() => toggleOne(r.id)} className="mt-0.5 shrink-0 text-gray-500 hover:text-gray-700">
                  {selected.has(r.id)
                    ? <CheckSquare className="h-4 w-4 text-gray-700" />
                    : <Square className="h-4 w-4" />}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm text-gray-900">{r.patientName}</span>
                    {r.isVerifiedPatient && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                        <ShieldCheck className="h-3 w-3" />Verified Patient
                      </span>
                    )}
                    <a href={`/directory/admin/clinics/${r.clinic.slug}`}
                      className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2">
                      {r.clinic.name ?? r.clinic.slug}
                    </a>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <Stars rating={r.rating} />
                  {r.treatment && <p className="mt-1 text-xs text-gray-500">{r.treatment}</p>}
                  <p className="mt-2 text-sm text-gray-700 leading-relaxed">{r.reviewText}</p>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {tab === 'pending' && (
                    <>
                      <button type="button" disabled={actioning === r.id}
                        onClick={() => action(r.id, 'approve', true)}
                        className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50 whitespace-nowrap">
                        Approve + Verified
                      </button>
                      <button type="button" disabled={actioning === r.id}
                        onClick={() => action(r.id, 'approve', false)}
                        className="rounded-lg border border-[#e0e0e0]  px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                        Approve
                      </button>
                      <button type="button" disabled={actioning === r.id}
                        onClick={() => action(r.id, 'reject')}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
                        Reject
                      </button>
                    </>
                  )}
                  {tab === 'rejected' && (
                    <button type="button" disabled={actioning === r.id}
                      onClick={() => action(r.id, 'approve', false)}
                      className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50 whitespace-nowrap">
                      Approve
                    </button>
                  )}
                  {tab === 'approved' && (
                    <button type="button" disabled={actioning === r.id}
                      onClick={() => action(r.id, 'reject')}
                      className="rounded-lg border border-[#e0e0e0]  px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                      Reject
                    </button>
                  )}
                  <button type="button" disabled={actioning === r.id}
                    onClick={() => deleteOne(r.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 flex items-center gap-1.5 justify-center">
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
