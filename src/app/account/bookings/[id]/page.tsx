'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { format, isPast, isFuture, addMinutes } from 'date-fns'
import {
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  ExternalLink,
  Loader2,
  MapPin,
  MessageCircle,
  Navigation,
  Star,
  Video,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Booking {
  id: number
  treatment: string | null
  slotStart: string
  slotEnd: string
  status: string
  notes: string | null
  practitionerName: string | null
  videoCallMeetingId: string | null
  videoCallJoinUrl: string | null
  clinic: {
    id: number | null
    name: string
    slug: string
    city: string | null
    gmapsAddress: string | null
    gmapsUrl: string | null
  }
  source: 'consentz' | 'local'
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      'text-xs px-2.5 py-1 rounded-full shrink-0 font-medium capitalize',
      status === 'confirmed' && 'bg-green-100 text-green-700',
      status === 'cancelled' && 'bg-red-100 text-red-600',
      status === 'completed' && 'bg-blue-100 text-blue-700',
      status === 'pending' && 'bg-yellow-100 text-yellow-700',
      status === 'no_show' && 'bg-gray-100 text-gray-500',
    )}>
      {status.replace('_', ' ')}
    </span>
  )
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5"
          aria-label={`${n} star`}
        >
          <Star
            className={cn(
              'h-6 w-6 transition-colors',
              (hover || value) >= n ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300',
            )}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewPanel({ booking }: { booking: Booking }) {
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (!rating || !reviewText.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/directory/api/patient/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicSlug: booking.clinic.slug,
          rating,
          reviewText: reviewText.trim(),
          treatment: booking.treatment,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        toast.error(d.error ?? 'Failed to submit review')
        return
      }
      setSubmitted(true)
      toast.success('Review submitted — thank you!')
    } catch {
      toast.error('Failed to submit review — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 text-center space-y-1">
        <p className="text-sm font-medium text-gray-900">Review submitted</p>
        <p className="text-xs text-gray-500">Thanks! It will appear once approved.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      <div>
        <p className="text-sm font-semibold text-gray-900">How was your appointment?</p>
        <p className="text-xs text-gray-500 mt-0.5">Your review helps others choose the right clinic.</p>
      </div>
      <StarPicker value={rating} onChange={setRating} />
      <textarea
        rows={3}
        placeholder="Share your experience…"
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:border-gray-400 focus:outline-none"
      />
      <Button
        onClick={handleSubmit}
        disabled={!rating || !reviewText.trim() || submitting}
        className="w-full"
        size="sm"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
        Submit review
      </Button>
    </div>
  )
}

function CancelButton({ booking, onCancelled }: { booking: Booking; onCancelled: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  async function handleCancel() {
    setCancelling(true)
    try {
      const res = await fetch(`/directory/api/patient/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      if (!res.ok) {
        const d = await res.json()
        toast.error(d.error ?? 'Failed to cancel')
        return
      }
      toast.success('Booking cancelled')
      onCancelled()
    } catch {
      toast.error('Failed to cancel — please try again')
    } finally {
      setCancelling(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 space-y-3">
        <p className="text-sm text-red-800 font-medium">Cancel this booking?</p>
        <p className="text-xs text-red-600">This cannot be undone.</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setConfirming(false)}
            disabled={cancelling}
          >
            Keep booking
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Yes, cancel'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="flex w-full items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
    >
      <X className="h-4 w-4 shrink-0" />
      Cancel booking
    </button>
  )
}

function googleCalendarUrl(booking: Booking): string {
  const start = new Date(booking.slotStart)
  const end = new Date(booking.slotEnd)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace('.000', '')
  const title = encodeURIComponent(
    `${booking.treatment ?? 'Appointment'} at ${booking.clinic.name}`,
  )
  const location = encodeURIComponent(
    booking.clinic.gmapsAddress ?? booking.clinic.city ?? booking.clinic.name,
  )
  const details = encodeURIComponent(
    booking.practitionerName ? `With ${booking.practitionerName}` : '',
  )
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(start)}/${fmt(end)}&location=${location}&details=${details}`
}

function directionsUrl(booking: Booking): string | null {
  const target = booking.clinic.gmapsUrl || booking.clinic.gmapsAddress || booking.clinic.city
  if (!target) return null
  if (booking.clinic.gmapsUrl) return booking.clinic.gmapsUrl
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(target)}`
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/directory/api/patient/bookings/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.ok ? r.json() : null
      })
      .then((d) => d && setBooking(d.booking))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  if (notFound || !booking) {
    return (
      <div className="max-w-lg space-y-4">
        <Link href="/account/bookings" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to bookings
        </Link>
        <p className="text-gray-500">Booking not found.</p>
      </div>
    )
  }

  const start = new Date(booking.slotStart)
  const end = new Date(booking.slotEnd)
  const isUpcoming = isFuture(start)
  const isCompleted = booking.status === 'completed'
  const isCancelled = booking.status === 'cancelled'
  const isVideoCall = Boolean(booking.videoCallMeetingId)
  const canCancel = (booking.status === 'pending' || booking.status === 'confirmed') && isUpcoming

  // Join call: within 15 min before start to 1 hour after end
  const joinWindowStart = addMinutes(start, -15)
  const joinWindowEnd = addMinutes(end, 60)
  const now = new Date()
  const inJoinWindow = now >= joinWindowStart && now <= joinWindowEnd
  const canJoin = isVideoCall && booking.videoCallJoinUrl &&
    !isCancelled && inJoinWindow

  const mapsUrl = directionsUrl(booking)
  const calUrl = googleCalendarUrl(booking)

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/account/bookings" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to bookings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left: booking info ─────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl bg-white border border-gray-200 p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-lg font-bold text-gray-900">{booking.clinic.name}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{booking.treatment ?? 'Appointment'}</p>
                {booking.practitionerName && (
                  <p className="text-xs text-gray-400 mt-0.5">with {booking.practitionerName}</p>
                )}
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <CalendarDays className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Date &amp; time</p>
                  <p className="text-sm font-medium text-gray-900">{format(start, 'd MMM yyyy')}</p>
                  <p className="text-sm text-gray-700">
                    {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
                  </p>
                </div>
              </div>

              {(booking.clinic.gmapsAddress || booking.clinic.city) && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    {isVideoCall ? (
                      <p className="text-sm text-gray-700">Video call</p>
                    ) : (
                      <p className="text-sm text-gray-700">
                        {booking.clinic.gmapsAddress ?? booking.clinic.city}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {isVideoCall && (
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex items-center gap-2">
                <Video className="h-4 w-4 text-gray-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Video consultation</p>
                  {!inJoinWindow && isUpcoming && (
                    <p className="text-xs text-gray-500">
                      Join link available 15 minutes before your appointment.
                    </p>
                  )}
                </div>
              </div>
            )}

            {booking.notes && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{booking.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: action panel ────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-3">
          {/* Join call — primary action */}
          {isVideoCall && !isCancelled && (
            canJoin ? (
              <a
                href={booking.videoCallJoinUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 transition-colors px-4 py-3.5 text-sm font-semibold text-white"
              >
                <Video className="h-4 w-4" />
                Join video call
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            ) : isUpcoming ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 flex items-center gap-2.5">
                <Video className="h-4 w-4 text-gray-400 shrink-0" />
                <p className="text-sm text-gray-500">
                  Join link available from{' '}
                  <span className="font-medium text-gray-700">
                    {format(addMinutes(start, -15), 'HH:mm')} on {format(start, 'd MMM')}
                  </span>
                </p>
              </div>
            ) : null
          )}

          {/* Message clinic */}
          {booking.clinic.slug && !isCancelled && (
            <Link
              href={`/account/chats`}
              className="flex w-full items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="h-4 w-4 shrink-0 text-gray-500" />
              Message clinic
            </Link>
          )}

          {/* Add to calendar — upcoming only */}
          {isUpcoming && !isCancelled && (
            <a
              href={calUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <CalendarPlus className="h-4 w-4 shrink-0 text-gray-500" />
              Add to Google Calendar
            </a>
          )}

          {/* Directions — in-person upcoming only */}
          {mapsUrl && !isVideoCall && isUpcoming && !isCancelled && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Navigation className="h-4 w-4 shrink-0 text-gray-500" />
              Get directions
            </a>
          )}

          {/* Cancel booking */}
          {canCancel && (
            <CancelButton
              booking={booking}
              onCancelled={() => setBooking((b) => b ? { ...b, status: 'cancelled' } : b)}
            />
          )}

          {/* Re-book after cancellation */}
          {isCancelled && booking.clinic.slug && (
            <Link
              href={`/directory`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Find a new appointment
            </Link>
          )}

          {/* Review prompt — completed bookings */}
          {isCompleted && <ReviewPanel booking={booking} />}
        </div>
      </div>
    </div>
  )
}
