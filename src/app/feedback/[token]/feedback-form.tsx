'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { IconStar } from '@tabler/icons-react'

interface Props {
  token: string
  clinicName: string
  clinicImage: string | null
  greetingName: string | null
  dwell: string
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: 5 }, (_, i) => {
        const v = i + 1
        return (
          <button
            key={v}
            type="button"
            aria-label={`${v} star${v > 1 ? 's' : ''}`}
            onMouseEnter={() => setHover(v)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(v)}
            className="focus:outline-none"
          >
            <IconStar
              className={cn(
                'h-9 w-9 transition-colors',
                (hover || value) >= v ? 'fill-amber-400 text-amber-400' : 'text-gray-300',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

export function FeedbackForm({ token, clinicName, clinicImage, greetingName, dwell }: Props) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [name, setName] = useState(greetingName ?? '')
  const [company, setCompany] = useState('') // honeypot
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [googleReviewUrl, setGoogleReviewUrl] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (rating === 0) {
      setError('Please choose a rating.')
      return
    }
    if (comment.trim().length < 1) {
      setError('Please add a comment.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/directory/api/feedback/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
          submitterName: name.trim() || undefined,
          company,
          dwell,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? 'Something went wrong. Please try again.')
        return
      }
      setGoogleReviewUrl(data?.googleReviewUrl ?? null)
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function trackGoogleClick() {
    void fetch(`/directory/api/feedback/${encodeURIComponent(token)}/google-clicked`, { method: 'POST' })
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <IconStar className="h-6 w-6 fill-green-600 text-green-600" />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-gray-900">Thank you!</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your feedback has been sent to {clinicName}.
        </p>
        {googleReviewUrl ? (
          <>
            <p className="mt-5 text-sm text-gray-700">
              Would you share your experience publicly? It helps other patients find {clinicName}.
            </p>
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackGoogleClick}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
            >
              Leave a Google review
            </a>
          </>
        ) : (
          <p className="mt-5 text-sm text-gray-600">
            If you have a moment, please also leave {clinicName} a review on Google.
          </p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="flex items-center gap-3">
        {clinicImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={clinicImage} alt="" className="h-11 w-11 rounded-lg object-cover" />
        )}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Your feedback</p>
          <h1 className="text-base font-semibold text-gray-900">{clinicName}</h1>
        </div>
      </div>

      {greetingName && (
        <p className="text-sm text-gray-600">Hi {greetingName}, how was your visit?</p>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-600">Your rating</label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div>
        <label htmlFor="fb-name" className="mb-1 block text-xs font-medium text-gray-600">
          Your name (optional)
        </label>
        <input
          id="fb-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="fb-comment" className="mb-1 block text-xs font-medium text-gray-600">
          Your comments
        </label>
        <textarea
          id="fb-comment"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value)
            setError('')
          }}
          rows={4}
          className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
          placeholder="Tell the clinic about your experience…"
        />
      </div>

      {/* honeypot — visually hidden, not display:none so bots still fill it */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
        </label>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors disabled:opacity-60"
      >
        {submitting ? 'Sending…' : 'Send feedback'}
      </button>

      <p className="text-center text-[11px] text-gray-400">
        Your rating and comments are shared privately with {clinicName}.
      </p>
    </form>
  )
}
