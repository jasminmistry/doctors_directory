'use client'

import { useState, useEffect } from 'react'
import { track } from '@/lib/analytics/track'
import { format, addDays, isSameDay } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { toast } from 'sonner'
import { cn, formatTimezoneAbbr } from '@/lib/utils'
import { ConsultationRichForm } from '@/components/consultation/consultation-form'
import type { ConsultationFormData } from '@/components/consultation/consultation-form'
import type { CoreSlot } from '@/lib/core-api'
import { IconCalendarWeek, IconChevronLeft, IconChevronRight, IconCircleCheck, IconExternalLink, IconLoader2, IconVideo } from '@tabler/icons-react'
import { Button } from '../ui/button'

interface BookingWidgetProps {
  slug: string
  clinicName: string
  hasCoreCalendar: boolean
  // Prefill for the details form — the chat dialog already resolves the logged-in
  // patient before this widget is ever shown, so there's no separate login step here.
  defaultValues?: Partial<ConsultationFormData>
}

type Step = 'date-slot' | 'details' | 'confirmation'

interface VideoCall {
  type: 'zoom' | 'jitsi'
  join_url: string
  start_url: string
}

interface BookingConfirmation {
  slotStart: string
  practitionerName: string
  patientEmail: string
  videoCall: VideoCall | null
}

const WEEK_SIZE = 7

function dateKey(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

export function BookingWidget({ slug, clinicName, hasCoreCalendar, defaultValues }: BookingWidgetProps) {
  const [step, setStep] = useState<Step>('date-slot')
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slots, setSlots] = useState<CoreSlot[]>([])
  const [slotTimezone, setSlotTimezone] = useState('Europe/London')
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<CoreSlot | null>(null)
  const [videoCall, setVideoCall] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null)

  useEffect(() => {
    track('booking_start', { clinic_slug: slug, booking_type: 'in_person' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weekStart = addDays(today, weekOffset * WEEK_SIZE)
  const weekDays = Array.from({ length: WEEK_SIZE }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    if (!selectedDate || !hasCoreCalendar) return
    setSlotsLoading(true)
    setSlots([])
    setSelectedSlot(null)
    fetch(`/directory/api/book/${slug}/availability/?date=${dateKey(selectedDate)}`)
      .then(r => r.json())
      .then(d => {
        setSlots(d.available ?? [])
        // Slots are always in the clinic's own timezone (we never send one),
        // but trust whatever Core reports the `datetime` values are actually in.
        setSlotTimezone(d.timezone || 'Europe/London')
      })
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [selectedDate, slug, hasCoreCalendar])

  async function handleBook(data: ConsultationFormData) {
    if (!selectedSlot) return
    setSubmitting(true)
    try {
      const res = await fetch(`/directory/api/book/${slug}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId: selectedSlot.practitioner_id,
          slotDatetime: selectedSlot.datetime,
          slotDuration: 30,
          patientFirstName: data.firstName,
          patientLastName: data.lastName,
          patientEmail: data.email,
          patientPhone: data.phone,
          videoCall,
        }),
      })
      const resData = await res.json()
      if (!res.ok) {
        if (res.status === 409) {
          toast.error('This slot was just taken, please select another time')
        } else {
          toast.error(resData.error ?? 'Booking failed — please try again')
        }
        return
      }
      const booking = resData.booking as {
        slot_start: string
        practitioner: { name: string }
        video_call: VideoCall | null
      }
      setConfirmation({
        slotStart: booking.slot_start,
        practitionerName: booking.practitioner?.name ?? selectedSlot.practitioner,
        patientEmail: data.email,
        videoCall: booking.video_call,
      })
      track('booking_complete', {
        clinic_slug: slug,
        booking_type: videoCall ? 'video' : 'in_person',
        practitioner: booking.practitioner?.name ?? selectedSlot.practitioner,
      })
      setStep('confirmation')
    } catch {
      toast.error('Booking failed — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  function resetToDateSlot() {
    setStep('date-slot')
    setSelectedDate(null)
    setSlots([])
    setSelectedSlot(null)
    setVideoCall(false)
    setConfirmation(null)
  }

  if (!hasCoreCalendar) return null

  // ── Confirmation ─────────────────────────────────────────────────────────────
  if (step === 'confirmation' && confirmation) {
    return (
      <div>
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Booking Confirmed</h2>
        </div>
        <div className="flex flex-col items-center gap-4 text-center px-6 py-10">
          <IconCircleCheck stroke={1.5} className="h-10 w-10 text-green-500 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold text-gray-900">Appointment with {confirmation.practitionerName}</p>
            <p className="text-sm text-gray-600">
              {formatInTimeZone(confirmation.slotStart, slotTimezone, "EEE d MMM 'at' HH:mm")}{' '}
              ({formatTimezoneAbbr(slotTimezone, new Date(confirmation.slotStart))})
            </p>
          </div>

          {confirmation.videoCall?.join_url && (
            <a
              href={confirmation.videoCall.join_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              <IconVideo stroke={1.5} className="h-4 w-4" />
              Join Meeting
              <IconExternalLink stroke={1.5} className="h-3.5 w-3.5 opacity-70" />
            </a>
          )}

          <p className="text-xs text-gray-600">
            A confirmation email has been sent to{' '}
            <span className="font-medium">{confirmation.patientEmail}</span>
          </p>

          <button
            type="button"
            onClick={resetToDateSlot}
            className="text-xs text-gray-600 underline hover:text-gray-600 mt-2"
          >
            Book another appointment
          </button>
        </div>
      </div>
    )
  }

  // ── Patient details form ─────────────────────────────────────────────────────
  if (step === 'details') {
    return (
      <div>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStep('date-slot')}
            className="text-gray-600 hover:text-gray-600"
          >
            <IconChevronLeft stroke={1.5} className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Your Details</h2>
            {selectedDate && selectedSlot && (
              <p className="text-xs text-gray-600 mt-0.5">
                {format(selectedDate, 'd MMM')} at {selectedSlot.time}{' '}
                ({formatTimezoneAbbr(slotTimezone, selectedDate)})
                {videoCall ? ' · Video call' : ''}
              </p>
            )}
          </div>
        </div>

        <ConsultationRichForm
          key={defaultValues?.email ?? 'booking'}
          defaultValues={defaultValues}
          clinicName={clinicName}
          description={
            <>Confirm your details to book your appointment with{' '}
              <span className="font-semibold">{clinicName}</span>.
            </>
          }
          submitLabel="Confirm Booking"
          submitting={submitting}
          onSubmit={handleBook}
          emailLocked={Boolean(defaultValues?.email)}
        />
      </div>
    )
  }

  // ── Date + slot picker ───────────────────────────────────────────────────────
  return (
    <div>
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Book an appointment</h2>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Step indicator */}
        <div className="flex items-center gap-1 text-[10px] text-gray-600">
          <span className="font-medium text-gray-900">1. Date &amp; Time</span>
          <span>›</span>
          <span>2. Your Details</span>
        </div>

        {/* Week nav */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setWeekOffset(o => Math.max(0, o - 1))}
            disabled={weekOffset === 0}
            className="rounded p-1 text-gray-600 hover:text-gray-700 disabled:opacity-30"
          >
            <IconChevronLeft stroke={1.5} className="h-4 w-4" />
          </button>
          <span className="text-xs text-gray-600">
            {format(weekStart, 'd MMM')} – {format(weekDays[6], 'd MMM')}
          </span>
          <button
            type="button"
            onClick={() => setWeekOffset(o => o + 1)}
            className="rounded p-1 text-gray-600 hover:text-gray-700"
          >
            <IconChevronRight stroke={1.5} className="h-4 w-4" />
          </button>
        </div>

        {/* Day picker */}
        <div className="grid grid-cols-7 gap-0.5">
          {weekDays.map(day => {
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
                <IconLoader2 stroke={1.5} className="h-4 w-4 animate-spin" />
              </div>
            ) : slots.length === 0 ? (
              <p className="text-center text-xs text-gray-600 py-3">No availability on this day</p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {slots.map((slot, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedSlot(s => {
                      if (s?.datetime === slot.datetime) return null
                      track('booking_slot_select', { clinic_slug: slug, booking_type: 'in_person' })
                      return slot
                    })}
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

        {/* Video call toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={videoCall}
            onChange={(e) => setVideoCall(e.target.checked)}
            className="h-4 w-4 rounded border-[#e0e0e0] accent-gray-900"
          />
          <span className="flex items-center gap-1.5 text-xs text-gray-700">
            <IconVideo stroke={1.5} className="h-3.5 w-3.5 text-gray-600" />
            Book as video call
          </span>
        </label>

        <Button
          type="button"
          variant="default"
          size="lg"
          disabled={!selectedSlot}
          onClick={() => setStep('details')}
          className="w-full"
        >
          <IconCalendarWeek stroke={1.5} className="h-4 w-4" />
          Next — Your Details
        </Button>
      </div>
    </div>
  )
}
