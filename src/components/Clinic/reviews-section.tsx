'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Star, ShieldCheck, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { InlineLogin } from '@/components/consultation/inline-login'

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
  googleReviewCount?: number
  googleRating?: number
}

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'h-5 w-5' : 'h-3.5 w-3.5'
  return (
    <div className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn(cls, i < rating ? 'fill-black text-black' : 'text-gray-200')} />
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
            <Star className={cn('h-7 w-7 transition-colors', (hover || value) >= v ? 'fill-black text-black' : 'text-gray-300')} />
          </button>
        )
      })}
    </div>
  )
}

interface PatientMe {
  id: number
  email: string
  firstName?: string | null
  lastName?: string | null
}

interface ExistingReview {
  id: number
  rating: number
  reviewText: string
  treatment: string | null
  status: 'pending' | 'approved' | 'rejected'
}

type FormPhase = 'closed' | 'checking' | 'login_required' | 'already_reviewed' | 'form'

export function ReviewsSection({ clinicSlug, reviews, googleReviewCount = 0, googleRating = 0 }: ReviewsSectionProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [filter, setFilter] = useState(0)
  const [formPhase, setFormPhase] = useState<FormPhase>('closed')
  const [patientMe, setPatientMe] = useState<PatientMe | null>(null)
  const [existingReview, setExistingReview] = useState<ExistingReview | null>(null)
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [treatment, setTreatment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [textError, setTextError] = useState('')

  const filtered = filter === 0 ? reviews : reviews.filter(r => r.rating === filter)

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  const patientDisplayName = patientMe
    ? [patientMe.firstName, patientMe.lastName].filter(Boolean).join(' ') || patientMe.email
    : ''

  async function openForm() {
    setFormPhase('checking')
    try {
      const meRes = await fetch('/directory/api/patient/me/')
      if (!meRes.ok) {
        setFormPhase('login_required')
        return
      }
      const me: PatientMe = await meRes.json()
      setPatientMe(me)

      const reviewRes = await fetch(`/directory/api/patient/reviews?clinicSlug=${encodeURIComponent(clinicSlug)}`)
      const reviewData = reviewRes.ok ? await reviewRes.json() : { review: null }
      if (reviewData.review) {
        setExistingReview(reviewData.review)
        setFormPhase('already_reviewed')
      } else {
        setFormPhase('form')
      }
    } catch {
      setFormPhase('login_required')
    }
  }

  // Auto-open when returning from magic link / OAuth with ?review=open
  useEffect(() => {
    if (searchParams.get('review') !== 'open') return
    router.replace(pathname, { scroll: false })
    void openForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTextError('')

    if (text.trim().length < 10) {
      setTextError('Please write at least 10 characters.')
      return
    }
    if (rating === 0) return

    setSubmitting(true)
    try {
      const res = await fetch('/directory/api/patient/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicSlug, rating, reviewText: text.trim(), treatment: treatment.trim() || undefined }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        if (res.status === 409) {
          toast.error("You've already reviewed this clinic.")
          setFormPhase('closed')
          return
        }
        toast.error(typeof data?.error === 'string' ? data.error : 'Failed to submit review')
        return
      }
      setSubmitted(true)
      setFormPhase('closed')
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
          {reviews.length > 0 ? (
            <p className="text-sm text-gray-600 mt-0.5">
              {avgRating.toFixed(1)} avg · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          ) : googleReviewCount > 0 ? (
            <p className="text-sm text-gray-600 mt-0.5">
              {googleRating.toFixed(1)} avg · {googleReviewCount} review{googleReviewCount !== 1 ? 's' : ''} on Google
            </p>
          ) : null}
        </div>
        {!submitted && (
          <button
            type="button"
            onClick={() => (formPhase === 'closed' ? openForm() : setFormPhase('closed'))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Leave a review
            {formPhase !== 'closed' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {formPhase === 'checking' && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
          Checking your account…
        </div>
      )}

      {formPhase === 'login_required' && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <InlineLogin next={`${pathname}?review=open`} />
        </div>
      )}

      {formPhase === 'already_reviewed' && existingReview && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">You've already reviewed this clinic</h4>
          <StarRow rating={existingReview.rating} />
          <p className="text-sm text-gray-700 leading-relaxed">{existingReview.reviewText}</p>
          {existingReview.status === 'pending' && (
            <p className="text-xs text-gray-600">Your review is awaiting moderation.</p>
          )}
        </div>
      )}

      {/* Leave review form */}
      {formPhase === 'form' && (
        <form onSubmit={handleSubmit} noValidate className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">Write a review</h4>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Your rating</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Your name</label>
              <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">{patientDisplayName}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Treatment (optional)</label>
              <input value={treatment} onChange={e => setTreatment(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                placeholder="e.g. Botox, Filler…" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Your review</label>
            <textarea value={text} onChange={e => { setText(e.target.value); setTextError('') }} rows={4}
              className={cn('w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none resize-none', textError ? 'border-red-400' : 'border-gray-200 focus:border-gray-400')}
              placeholder="Share your experience (minimum 10 characters)…" />
            {textError && <p className="mt-1 text-xs text-red-600">{textError}</p>}
          </div>
          <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            Reviews are moderated before publication. Submitting a review confirms it reflects your genuine experience.
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setFormPhase('closed')}
              className="flex-1 items-center justify-center gap-2 rounded-lg border border-black px-5 py-2.5 text-sm font-semibold text-black hover:bg-black hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting || rating === 0 || text.trim().length < 10}
              className="flex-1 items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors">
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
          </div>
        </form>
      )}

      {submitted && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
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
        <p className="text-sm text-gray-600">
          {reviews.length > 0
            ? 'No reviews match this filter.'
            : googleReviewCount > 0
              ? "No written reviews on Consentz Directory yet. Be the first to leave one!"
              : 'No reviews yet. Be the first to leave one!'}
        </p>
      ) : (
        <div className="divide-y divide-gray-100 space-y-0">
          {filtered.map(review => (
            <div key={review.id} className="py-4 first:pt-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900">{review.patientName}</span>
                  {review.isVerifiedPatient ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-medium text-blue-700"
                      title="This reviewer completed a booking through Consentz Directory"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      Verified patient
                    </span>
                  ) : review.source === 'platform' ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600"
                      title="This review was submitted publicly and has not been linked to a booking"
                    >
                      Public review
                    </span>
                  ) : null}
                  {review.source === 'google' && (
                    <span className="text-[10px] font-medium text-gray-600 border border-gray-200 rounded-full px-2 py-0.5">Google</span>
                  )}
                </div>
                <span className="text-xs text-gray-600 shrink-0">
                  {review.createdAt
                    ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })
                    : review.reviewDate ?? ''}
                </span>
              </div>
              <StarRow rating={review.rating} />
              {review.treatment && (
                <p className="mt-1 text-xs text-gray-600">{review.treatment}</p>
              )}
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">{review.reviewText}</p>

              {review.clinicResponse && (
                <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Response from the clinic</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.clinicResponse}</p>
                  {review.respondedAt && (
                    <p className="mt-1 text-xs text-gray-600">
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
