'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { format, addDays, isSameDay } from 'date-fns'
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz'
import { toast } from 'sonner'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Video,
  ExternalLink,
  Clock,
  Calendar,
} from 'lucide-react'
import { cn, formatTimezoneAbbr } from '@/lib/utils'
import { InlineLogin } from '@/components/consultation/inline-login'
import { ConsultationRichForm } from '@/components/consultation/consultation-form'
import type { ConsultationFormData } from '@/components/consultation/consultation-form'

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

interface PatientMe {
  id: number
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
}

type Step = 'events' | 'login' | 'date-slot' | 'details' | 'confirmation'

const WEEK_SIZE = 7

function dateKey(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

function isPaidEvent(price: string | null): boolean {
  return price !== null && Number(price) > 0
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
  entityName?: string
}

export function EventBookingSection({ practitionerSlug, clinicSlug, entityName }: EventBookingSectionProps) {
  const basePath = clinicSlug
    ? `/directory/api/events/clinic/${clinicSlug}`
    : `/directory/api/events/${practitionerSlug}`

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [events, setEvents] = useState<CoreEvent[] | null>(null)
  const [eventsLoading, setEventsLoading] = useState(true)

  const [step, setStep] = useState<Step>('events')
  const [selectedEvent, setSelectedEvent] = useState<CoreEvent | null>(null)
  const [pendingEventId, setPendingEventId] = useState<number | null>(null)
  const [checkingEventId, setCheckingEventId] = useState<number | null>(null)

  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [slotDuration, setSlotDuration] = useState(30)
  const [slotTimezone, setSlotTimezone] = useState('Europe/London')
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)

  const [patientMe, setPatientMe] = useState<PatientMe | null>(null)
  const [submitting, setSubmitting] = useState(false)
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
    const qs = new URLSearchParams({
      eventId: String(selectedEvent.id),
      date: dateKey(selectedDate),
    })
    fetch(`${basePath}/availability?${qs}`)
      .then((r) => r.json())
      .then((d: AvailabilityResponse) => {
        setSlots(d.available ?? [])
        setSlotDuration(d.slot_duration ?? 30)
        // Slots are always in the clinic's own timezone (we never send one),
        // but trust whatever Core reports the `datetime` values are actually in.
        setSlotTimezone(d.timezone || 'Europe/London')
      })
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [selectedDate, selectedEvent, basePath])

  async function fetchAndSetPatient(): Promise<PatientMe | null> {
    try {
      const res = await fetch('/directory/api/patient/me')
      if (!res.ok) {
        setPatientMe(null)
        return null
      }
      const data: PatientMe = await res.json()
      setPatientMe(data)
      return data
    } catch {
      setPatientMe(null)
      return null
    }
  }

  function selectEventAndAdvance(event: CoreEvent) {
    setSelectedEvent(event)
    setSelectedDate(null)
    setSlots([])
    setSelectedSlot(null)
    setWeekOffset(0)
    setStep('date-slot')
  }

  async function startBooking(event: CoreEvent) {
    setCheckingEventId(event.id)
    const patient = await fetchAndSetPatient()
    setCheckingEventId(null)

    if (!patient) {
      setPendingEventId(event.id)
      setStep('login')
      return
    }

    selectEventAndAdvance(event)
  }

  // Resume where the user left off after returning from magic-link / OAuth login
  useEffect(() => {
    const bookEventId = searchParams.get('bookEvent')
    if (!bookEventId || !events) return
    router.replace(pathname, { scroll: false })

    const match = events.find((e) => e.id === Number(bookEventId))
    void (async () => {
      const patient = await fetchAndSetPatient()
      if (match && patient) {
        selectEventAndAdvance(match)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events])

  async function handleBook(data: ConsultationFormData) {
    if (!selectedSlot || !selectedEvent) return
    setSubmitting(true)
    try {
      // Core returns `datetime` as a naive wall-clock string in `slotTimezone`
      // (the same tz we requested availability with) — it is NOT UTC, and it
      // is NOT necessarily the browser's ambient default timezone either (those
      // two can drift apart, e.g. under devtools timezone overrides). Convert
      // explicitly against the known IANA zone rather than relying on
      // `new Date()`'s implicit local-time parsing.
      const slotStart = fromZonedTime(selectedSlot.datetime.replace(' ', 'T'), slotTimezone).toISOString()
      const slotEnd = new Date(new Date(slotStart).getTime() + slotDuration * 60 * 1000).toISOString()

      const commonPayload = {
        event_id: selectedEvent.id,
        practitioner_id: selectedSlot.practitioner_id,
        slot_start: slotStart,
        slot_end: slotEnd,
        patient_first_name: data.firstName,
        patient_last_name: data.lastName,
        patient_email: data.email,
        ...(data.phone ? { patient_phone: data.phone } : {}),
      }

      // Paid event → Stripe Checkout
      if (isPaidEvent(selectedEvent.price)) {
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

        if (res.status === 401) {
          setPendingEventId(selectedEvent.id)
          setStep('login')
          toast.error('Your session expired — please sign in again to continue.')
          return
        }

        const resData = await res.json()
        if (!res.ok) {
          toast.error(resData.error ?? 'Failed to start payment — please try again')
          return
        }
        window.location.href = (resData as { url: string }).url
        return
      }

      // Free event → direct book
      const res = await fetch(`${basePath}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commonPayload),
      })

      if (res.status === 401) {
        setPendingEventId(selectedEvent.id)
        setStep('login')
        toast.error('Your session expired — please sign in again to continue.')
        return
      }

      const resData = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          toast.error('This slot was just taken, please select another time')
        } else {
          toast.error(resData.error ?? 'Booking failed — please try again')
        }
        return
      }

      setConfirmation((resData as BookingResponse).booking)
      setStep('confirmation')
    } catch {
      toast.error('Booking failed — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  function resetToEvents() {
    setStep('events')
    setSelectedEvent(null)
    setPendingEventId(null)
    setSelectedDate(null)
    setSlots([])
    setSelectedSlot(null)
    setConfirmation(null)
  }

  // Don't render section at all while loading or if no events
  if (eventsLoading) return null
  if (!events || events.length === 0) return null

  // ── Confirmation ────────────────────────────────────────────────────────────
  if (step === 'confirmation' && confirmation) {
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
              {formatInTimeZone(confirmation.slot_start, slotTimezone, "EEE d MMM 'at' HH:mm")}{' '}
              ({formatTimezoneAbbr(slotTimezone, new Date(confirmation.slot_start))}) with{' '}
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

          <p className="text-xs text-gray-600">
            A confirmation email has been sent to{' '}
            <span className="font-medium">{confirmation.patient.email}</span>
          </p>

          <button
            type="button"
            onClick={resetToEvents}
            className="text-xs text-gray-600 underline hover:text-gray-600 mt-2"
          >
            Book another consultation
          </button>
        </div>
      </section>
    )
  }

  // ── Login required ───────────────────────────────────────────────────────────
  if (step === 'login') {
    const nextUrl = `${pathname}?bookEvent=${pendingEventId ?? ''}`
    return (
      <section className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <button
            type="button"
            onClick={resetToEvents}
            className="text-gray-600 hover:text-gray-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-base font-semibold text-gray-900">Sign in to book</h2>
        </div>
        <InlineLogin next={nextUrl} />
      </section>
    )
  }

  // ── Patient details form ─────────────────────────────────────────────────────
  if (step === 'details') {
    const isPaid = isPaidEvent(selectedEvent?.price ?? null)
    const formDefaults = patientMe ? {
      firstName: patientMe.firstName ?? '',
      lastName: patientMe.lastName ?? '',
      email: patientMe.email ?? '',
      phone: patientMe.phone ?? '',
      dateOfBirth: patientMe.dateOfBirth ?? '',
    } : undefined

    return (
      <section className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStep('date-slot')}
            className="text-gray-600 hover:text-gray-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Your Details</h2>
            {selectedEvent && selectedDate && selectedSlot && (
              <p className="text-xs text-gray-600 mt-0.5">
                {selectedEvent.title} · {format(selectedDate, 'd MMM')} at {selectedSlot.time}{' '}
                ({formatTimezoneAbbr(slotTimezone, selectedDate)})
              </p>
            )}
          </div>
        </div>

        <ConsultationRichForm
          key={patientMe?.email ?? 'event'}
          defaultValues={formDefaults}
          clinicName={entityName ?? 'the clinic'}
          description={
            isPaid ? (
              <>
                You&apos;re booking <span className="font-semibold">{selectedEvent?.title}</span> for{' '}
                <span className="font-semibold">£{selectedEvent?.price}</span>. You&apos;ll be redirected to
                Stripe to complete payment securely.
              </>
            ) : (
              <>Confirm your details to book <span className="font-semibold">{selectedEvent?.title}</span>.</>
            )
          }
          submitLabel={isPaid ? `Pay £${selectedEvent?.price}` : 'Confirm Booking'}
          submitting={submitting}
          onSubmit={handleBook}
        />
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
            className="text-gray-600 hover:text-gray-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {selectedEvent?.title}
            </h2>
            {selectedEvent && (
              <p className="text-xs text-gray-600 mt-0.5">
                {selectedEvent.duration}
                {isPaidEvent(selectedEvent.price) ? ` · £${selectedEvent.price}` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-1 text-[10px] text-gray-600">
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
              className="rounded p-1 text-gray-600 hover:text-gray-700 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-600">
              {format(weekStart, 'd MMM')} – {format(weekDays[6], 'd MMM')}
            </span>
            <button
              type="button"
              onClick={() => setWeekOffset((o) => o + 1)}
              className="rounded p-1 text-gray-600 hover:text-gray-700"
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
              {slots.length > 0 && !slotsLoading && (
                <p className="text-[10px] text-gray-600 mb-1.5">
                  Times shown in clinic time ({formatTimezoneAbbr(slotTimezone, selectedDate)})
                </p>
              )}
              {slotsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-center text-xs text-gray-600 py-3">
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
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="h-3 w-3 shrink-0" />
                <span>{event.duration}</span>
                {isPaidEvent(event.price) && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="font-medium text-gray-700">£{event.price}</span>
                  </>
                )}
              </div>
              {event.description && (
                <p className="text-xs text-gray-600 line-clamp-2">{event.description}</p>
              )}
            </div>
            <button
              type="button"
              disabled={checkingEventId === event.id}
              onClick={() => startBooking(event)}
              className="shrink-0 rounded-lg border border-gray-900 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {checkingEventId === event.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Book
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
