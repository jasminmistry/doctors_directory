'use client'

import { useState } from 'react'
import { Star, ShieldCheck, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export interface ReviewItem {
  id: string
  source: 'google' | 'platform'
  patientName: string
  rating: number
  reviewText: string
  reviewDate: string | null
  treatment?: string | null
  isVerifiedPatient?: boolean
  clinicResponse?: string | null
  respondedAt?: Date | null
  createdAt?: Date | null
}

interface ReviewsSectionProps {
  clinicSlug: string
  reviews: ReviewItem[]
}

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'h-5 w-5' : 'h-3.5 w-3.5'
  return (
    <div className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn(cls, i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200')} />
      ))}
    </div>
  )
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const v = i + 1
        return (
          <button
            key={v}
            type="button"
            onMouseEnter={() => setHover(v)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(v)}
            className="focus:outline-none"
          >
            <Star className={cn('h-7 w-7 transition-colors', (hover || value) >= v ? 'fill-amber-400 text-amber-400' : 'text-gray-300')} />
          </button>
        )
      })}
    </div>
  )
}

export function ReviewsSection({ clinicSlug, reviews }: ReviewsSectionProps) {
  const [filter, setFilter] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [treatment, setTreatment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const filtered = filter === 0 ? reviews : reviews.filter(r => r.rating === filter)

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || rating === 0 || text.trim().length < 10) return
    setSubmitting(true)
    try {
      const res = await fetch('/directory/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicSlug, patientName: name.trim(), rating, reviewText: text.trim(), treatment: treatment.trim() || undefined }),
      })
      if (!res.ok) { toast.error('Failed to submit review'); return }
      setSubmitted(true)
      setShowForm(false)
      toast.success('Review submitted — it will appear after moderation.')
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Reviews</h3>
          {reviews.length > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">
              {avgRating.toFixed(1)} avg · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {!submitted && (
          <button
            type="button"
            onClick={() => setShowForm(f => !f)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Leave a review
            {showForm ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Leave review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">Write a review</h4>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Your rating</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Your name</label>
              <input value={name} onChange={e => setName(e.target.value)} required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                placeholder="Jane D." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Treatment (optional)</label>
              <input value={treatment} onChange={e => setTreatment(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                placeholder="e.g. Botox, Filler…" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Your review</label>
            <textarea value={text} onChange={e => setText(e.target.value)} required rows={4}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none resize-none"
              placeholder="Share your experience (minimum 10 characters)…" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting || rating === 0 || text.trim().length < 10 || !name.trim()}
              className="flex-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-gray-700 transition-colors">
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
          </div>
        </form>
      )}

      {submitted && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Thanks! Your review has been submitted and will appear after moderation.
        </div>
      )}

      {/* Star filter */}
      {reviews.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {[0, 5, 4, 3, 2, 1].map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setFilter(v)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                filter === v ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400',
              )}
            >
              {v === 0 ? 'All' : `${v}★`}
            </button>
          ))}
        </div>
      )}

      {/* Review list */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400">
          {reviews.length === 0 ? 'No reviews yet. Be the first to leave one!' : 'No reviews match this filter.'}
        </p>
      ) : (
        <div className="divide-y divide-gray-100 space-y-0">
          {filtered.map(review => (
            <div key={review.id} className="py-4 first:pt-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900">{review.patientName}</span>
                  {review.isVerifiedPatient && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                      <ShieldCheck className="h-3 w-3" />
                      Verified Patient
                    </span>
                  )}
                  {review.source === 'google' && (
                    <span className="text-[10px] font-medium text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">Google</span>
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {review.createdAt
                    ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })
                    : review.reviewDate ?? ''}
                </span>
              </div>
              <StarRow rating={review.rating} />
              {review.treatment && (
                <p className="mt-1 text-xs text-gray-400">{review.treatment}</p>
              )}
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">{review.reviewText}</p>

              {review.clinicResponse && (
                <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Clinic response</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.clinicResponse}</p>
                  {review.respondedAt && (
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDistanceToNow(new Date(review.respondedAt), { addSuffix: true })}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
