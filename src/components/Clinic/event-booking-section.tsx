'use client'

import { useState, useEffect } from 'react'
import { format, addDays, isSameDay, parseISO } from 'date-fns'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Video,
  ExternalLink,
  Clock,
  Calendar,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CoreEvent {
  id: number
  title: string
  slug: string
  duration: string
  description: string | null
  location: 'zoom' | 'video_call'
  price: string | null
  practitioner: { id: number; name: string }
}

interface AvailableSlot {
  time: string
  time_12h: string
  datetime: string
  practitioner_id: number
  practitioner: string
}

interface AvailabilityResponse {
  available: AvailableSlot[]
  date: string
  timezone: string
  slot_duration: number
  event_id: number
}

interface BookingResponse {
  booking: {
    id: number
    status: string
    slot_start: string
    slot_end: string
    event: { id: number; title: string; slug: string; price: string | null }
    practitioner: { id: number; name: string }
    patient: { id: number; name: string; email: string }
    video_call: { type: string; join_url: string; start_url: string } | null
  }
}

type Step = 'events' | 'date-slot' | 'details' | 'confirmation'
type FieldErrors = Record<string, string>

const WEEK_SIZE = 7
const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidUkPhone(value: string): boolean {
  return UK_PHONE_RE.test(value.trim().replace(/\s/g, ''))
}

function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim())
}

function dateKey(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'Europe/London'
  }
}

function LocationBadge({ location }: { location: 'zoom' | 'video_call' }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
      location === 'zoom'
        ? 'bg-blue-50 text-blue-700'
        : 'bg-purple-50 text-purple-700',
    )}>
      <Video className="h-3 w-3" />
      {location === 'zoom' ? 'Zoom' : 'Video Call'}
    </span>
  )
}

interface EventBookingSectionProps {
  practitionerSlug?: string
  clinicSlug?: string
}

export function EventBookingSection({ practitionerSlug, clinicSlug }: EventBookingSectionProps) {
  const basePath = clinicSlug
    ? `/directory/api/events/clinic/${clinicSlug}`
    : `/directory/api/events/${practitionerSlug}`

  const [events, setEvents] = useState<CoreEvent[] | null>(null)
  const [eventsLoading, setEventsLoading] = useState(true)

  const [step, setStep] = useState<Step>('events')
  const [selectedEvent, setSelectedEvent] = useState<CoreEvent | null>(null)

  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [slotDuration, setSlotDuration] = useState(30)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [confirmation, setConfirmation] = useState<BookingResponse['booking'] | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekStart = addDays(today, weekOffset * WEEK_SIZE)
  const weekDays = Array.from({ length: WEEK_SIZE }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    fetch(basePath)
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false))
  }, [basePath])

  useEffect(() => {
    if (!selectedDate || !selectedEvent) return
    setSlotsLoading(true)
    setSlots([])
    setSelectedSlot(null)
    const tz = detectTimezone()
    const qs = new URLSearchParams({
      eventId: String(selectedEvent.id),
      date: dateKey(selectedDate),
      timezone: tz,
    })
    fetch(`${basePath}/availability?${qs}`)
      .then((r) => r.json())
      .then((d: AvailabilityResponse) => {
        setSlots(d.available ?? [])
        setSlotDuration(d.slot_duration ?? 30)
      })
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [selectedDate, selectedEvent, basePath])

  function getFieldErrors(): FieldErrors {
    const errors: FieldErrors = {}
    if (!firstName.trim()) errors.firstName = 'First name is required.'
    if (!lastName.trim()) errors.lastName = 'Last name is required.'
    if (!email.trim()) errors.email = 'Email address is required.'
    else if (!isValidEmail(email)) errors.email = 'Please enter a valid email address.'
    if (phone.trim() && !isValidUkPhone(phone)) errors.phone = 'Please enter a valid UK phone number.'
    return errors
  }

  function mapServerErrorToField(message: string): FieldErrors | null {
    const lower = message.toLowerCase()
    if (lower.includes('first name')) return { firstName: message }
    if (lower.includes('last name')) return { lastName: message }
    if (lower.includes('email')) return { email: message }
    if (lower.includes('phone')) return { phone: message }
    return null
  }

  async function handleBook() {
    if (!selectedSlot || !selectedEvent) return
    setError(null)

    const errors = getFieldErrors()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    setSubmitting(true)
    try {
      // Core returns datetime in UTC; append Z to produce a valid UTC ISO-8601 string
      const slotStart = selectedSlot.datetime.replace(' ', 'T') + 'Z'
      const slotEnd = new Date(new Date(slotStart).getTime() + slotDuration * 60 * 1000).toISOString()

      const commonPayload = {
        event_id: selectedEvent.id,
        practitioner_id: selectedSlot.practitioner_id,
        slot_start: slotStart,
        slot_end: slotEnd,
        patient_first_name: firstName.trim(),
        patient_last_name: lastName.trim(),
        patient_email: email.trim(),
        ...(phone.trim() ? { patient_phone: phone.trim() } : {}),
      }

      // Paid event → Stripe Checkout
      if (selectedEvent.price) {
        const res = await fetch(`${basePath}/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...commonPayload,
            event_title: selectedEvent.title,
            event_price: selectedEvent.price,
            cancel_url: window.location.href,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          const message = data.error ?? 'Failed to start payment — please try again'
          const mapped = mapServerErrorToField(message)
          if (mapped) {
            setFieldErrors(mapped)
          } else {
            setError(message)
          }
          return
        }
        window.location.href = (data as { url: string }).url
        return
      }

      // Free event → direct book
      const res = await fetch(`${basePath}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commonPayload),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          setError('This slot was just taken, please select another time')
        } else {
          const message = data.error ?? 'Booking failed — please try again'
          const mapped = mapServerErrorToField(message)
          if (mapped) {
            setFieldErrors(mapped)
          } else {
            setError(message)
          }
        }
        return
      }

      setConfirmation((data as BookingResponse).booking)
      setStep('confirmation')
    } catch {
      setError('Booking failed — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  function startBooking(event: CoreEvent) {
    setSelectedEvent(event)
    setSelectedDate(null)
    setSlots([])
    setSelectedSlot(null)
    setWeekOffset(0)
    setError(null)
    setStep('date-slot')
  }

  function resetToEvents() {
    setStep('events')
    setSelectedEvent(null)
    setSelectedDate(null)
    setSlots([])
    setSelectedSlot(null)
    setConfirmation(null)
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setError(null)
    setFieldErrors({})
  }

  // Don't render section at all while loading or if no events
  if (eventsLoading) return null
  if (!events || events.length === 0) return null

  // ── Confirmation ────────────────────────────────────────────────────────────
  if (step === 'confirmation' && confirmation) {
    const startDt = parseISO(confirmation.slot_start)
    const joinUrl = confirmation.video_call?.join_url ?? null

    return (
      <section className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Booking Confirmed</h2>
        </div>
        <div className="flex flex-col items-center gap-4 text-center px-6 py-10">
          <CheckCircle2 className="h-10 w-10 text-green-500 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold text-gray-900">{confirmation.event.title}</p>
            <p className="text-sm text-gray-600">
              {format(startDt, "EEE d MMM 'at' HH:mm")} with{' '}
              <span className="font-medium">{confirmation.practitioner.name}</span>
            </p>
          </div>

          {joinUrl && (
            <a
              href={joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              <Video className="h-4 w-4" />
              Join Meeting
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
          )}

          <p className="text-xs text-gray-500">
            A confirmation email has been sent to{' '}
            <span className="font-medium">{confirmation.patient.email}</span>
          </p>

          <button
            type="button"
            onClick={resetToEvents}
            className="text-xs text-gray-500 underline hover:text-gray-600 mt-2"
          >
            Book another consultation
          </button>
        </div>
      </section>
    )
  }

  // ── Patient details form ─────────────────────────────────────────────────────
  if (step === 'details') {
    const canSubmit = firstName.trim() && lastName.trim() && email.trim() && !submitting
    const isPaid = !!selectedEvent?.price
    return (
      <section className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setStep('date-slot'); setError(null) }}
            className="text-gray-500 hover:text-gray-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Your Details</h2>
            {selectedEvent && selectedDate && selectedSlot && (
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedEvent.title} · {format(selectedDate, 'd MMM')} at {selectedSlot.time}
              </p>
            )}
          </div>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setFieldErrors((p) => ({ ...p, firstName: '' })) }}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none',
                  fieldErrors.firstName ? 'border-red-400' : 'border-gray-200 focus:border-gray-400',
                )}
              />
              {fieldErrors.firstName && <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p>}
            </div>
            <div>
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); setFieldErrors((p) => ({ ...p, lastName: '' })) }}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none',
                  fieldErrors.lastName ? 'border-red-400' : 'border-gray-200 focus:border-gray-400',
                )}
              />
              {fieldErrors.lastName && <p className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</p>}
            </div>
          </div>
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: '' })) }}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none',
                fieldErrors.email ? 'border-red-400' : 'border-gray-200 focus:border-gray-400',
              )}
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          </div>
          <div>
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setFieldErrors((p) => ({ ...p, phone: '' })) }}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none',
                fieldErrors.phone ? 'border-red-400' : 'border-gray-200 focus:border-gray-400',
              )}
            />
            {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
          </div>

          {isPaid && (
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">Amount due</span>
              <span className="text-sm font-medium text-gray-900">£{selectedEvent!.price}</span>
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleBook}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40 hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {isPaid ? 'Redirecting to payment…' : 'Booking…'}</>
            ) : isPaid ? (
              <><CreditCard className="h-4 w-4" /> Pay £{selectedEvent!.price}</>
            ) : (
              <><Video className="h-4 w-4" /> Confirm Booking</>
            )}
          </button>

          {isPaid && !submitting && (
            <p className="text-center text-[10px] text-gray-500">
              You&apos;ll be redirected to Stripe to complete payment securely
            </p>
          )}
        </div>
      </section>
    )
  }

  // ── Date + slot picker ───────────────────────────────────────────────────────
  if (step === 'date-slot') {
    return (
      <section className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <button
            type="button"
            onClick={resetToEvents}
            className="text-gray-500 hover:text-gray-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {selectedEvent?.title}
            </h2>
            {selectedEvent && (
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedEvent.duration}
                {selectedEvent.price ? ` · £${selectedEvent.price}` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <span className="font-medium text-gray-900">1. Date &amp; Time</span>
            <span>›</span>
            <span>2. Your Details</span>
          </div>

          {/* Week navigator */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setWeekOffset((o) => Math.max(0, o - 1))}
              disabled={weekOffset === 0}
              className="rounded p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-500">
              {format(weekStart, 'd MMM')} – {format(weekDays[6], 'd MMM')}
            </span>
            <button
              type="button"
              onClick={() => setWeekOffset((o) => o + 1)}
              className="rounded p-1 text-gray-500 hover:text-gray-700"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day picker */}
          <div className="grid grid-cols-7 gap-0.5">
            {weekDays.map((day) => {
              const isPast = day < today
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={isPast}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'flex flex-col items-center rounded-lg py-1.5 text-[10px] leading-tight transition-colors',
                    isPast && 'opacity-30 cursor-not-allowed',
                    isSelected
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100',
                  )}
                >
                  <span>{format(day, 'EEE')[0]}</span>
                  <span className="font-semibold text-xs">{format(day, 'd')}</span>
                </button>
              )
            })}
          </div>

          {/* Slots */}
          {selectedDate && (
            <div>
              {slotsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-center text-xs text-gray-500 py-3">
                  No slots available on this date
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {slots.map((slot, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedSlot((s) =>
                        s?.datetime === slot.datetime ? null : slot,
                      )}
                      className={cn(
                        'rounded-lg border px-2 py-2 text-xs transition-colors text-center',
                        selectedSlot?.datetime === slot.datetime
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-gray-400',
                      )}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            disabled={!selectedSlot}
            onClick={() => setStep('details')}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40 hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Next — Your Details
          </button>
        </div>
      </section>
    )
  }

  // ── Event cards ──────────────────────────────────────────────────────────────
  return (
    <section className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Book a consultation</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {events.map((event) => (
          <div key={event.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{event.title}</span>
                <LocationBadge location={event.location} />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3 w-3 shrink-0" />
                <span>{event.duration}</span>
                {event.price && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="font-medium text-gray-700">£{event.price}</span>
                  </>
                )}
              </div>
              {event.description && (
                <p className="text-xs text-gray-500 line-clamp-2">{event.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => startBooking(event)}
              className="shrink-0 rounded-lg border border-gray-900 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
            >
              Book
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
