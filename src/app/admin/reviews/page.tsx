'use client'

import { useEffect, useState, useCallback } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Star, ShieldCheck, Loader2 } from 'lucide-react'
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
        <Star key={i} className={cn('h-3.5 w-3.5', i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200')} />
      ))}
    </div>
  )
}

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState<number | null>(null)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/directory/api/admin/reviews?status=${tab}`)
      const data = await res.json()
      setReviews(data.reviews ?? [])
    } catch {
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => { fetchReviews() }, [fetchReviews])

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
      fetchReviews()
    } catch {
      toast.error('Action failed')
    } finally {
      setActioning(null)
    }
  }

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

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No {tab} reviews.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm text-gray-900">{r.patientName}</span>
                    {r.isVerifiedPatient && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                        <ShieldCheck className="h-3 w-3" />Verified Patient
                      </span>
                    )}
                    <a href={`/directory/admin/clinics/${r.clinic.slug}`}
                      className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2">
                      {r.clinic.name ?? r.clinic.slug}
                    </a>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <Stars rating={r.rating} />
                  {r.treatment && <p className="mt-1 text-xs text-gray-400">{r.treatment}</p>}
                  <p className="mt-2 text-sm text-gray-700 leading-relaxed">{r.reviewText}</p>
                </div>

                {tab === 'pending' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button type="button" disabled={actioning === r.id}
                      onClick={() => action(r.id, 'approve', true)}
                      className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50 whitespace-nowrap">
                      Approve + Verified
                    </button>
                    <button type="button" disabled={actioning === r.id}
                      onClick={() => action(r.id, 'approve', false)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                      Approve
                    </button>
                    <button type="button" disabled={actioning === r.id}
                      onClick={() => action(r.id, 'reject')}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
