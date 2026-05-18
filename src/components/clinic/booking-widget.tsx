'use client'

import { useState, useEffect } from 'react'
import { format, addDays, isSameDay, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, Loader2, CalendarDays, CheckCircle2, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CoreSlot } from '@/lib/core-api'
import { CallBookingForm } from '@/components/clinic/call-booking-form'

interface BookingWidgetProps {
  slug: string
  clinicName: string
  hasCoreCalendar: boolean
}

type Step = 1 | 2 | 3

interface PatientForm {
  firstName: string
  lastName: string
  email: string
  phone: string
}

const WEEK_SIZE = 7

function dateKey(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

export function BookingWidget({ slug, clinicName, hasCoreCalendar }: BookingWidgetProps) {
  const [tab, setTab] = useState<'appointment' | 'call'>('appointment')
  const [step, setStep] = useState<Step>(1)
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slots, setSlots] = useState<CoreSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<CoreSlot | null>(null)
  const [patient, setPatient] = useState<PatientForm>({ firstName: '', lastName: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookedSlot, setBookedSlot] = useState<string | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weekStart = addDays(today, weekOffset * WEEK_SIZE)
  const weekDays = Array.from({ length: WEEK_SIZE }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    if (!selectedDate || !hasCoreCalendar) return
    setSlotsLoading(true)
    setSlots([])
    setSelectedSlot(null)
    fetch(`/directory/api/book/${slug}/availability?date=${dateKey(selectedDate)}`)
      .then(r => r.json())
      .then(d => setSlots(d.available ?? []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [selectedDate, slug, hasCoreCalendar])

  async function handleConfirm() {
    if (!selectedSlot) return
    setSubmitting(true)
    setError(null)
    try {
      const slotDuration = 30
      const res = await fetch(`/directory/api/book/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId: selectedSlot.practitioner_id,
          slotDatetime: selectedSlot.datetime,
          slotDuration,
          patientFirstName: patient.firstName,
          patientLastName: patient.lastName,
          patientEmail: patient.email,
          patientPhone: patient.phone,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Booking failed')
        return
      }
      setBookedSlot(`${selectedSlot.time_12h} with ${selectedSlot.practitioner}`)
      setStep(3)
    } catch {
      setError('Booking failed — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  if (!hasCoreCalendar) return null

  if (step === 3) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 text-center space-y-3">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
        <h3 className="text-sm font-semibold text-gray-900">Booking confirmed!</h3>
        <p className="text-xs text-gray-600">
          Your appointment at <span className="font-medium">{bookedSlot}</span> has been booked.
          A confirmation will be sent to {patient.email}.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100">
        <button
          type="button"
          onClick={() => setTab('appointment')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors',
            tab === 'appointment'
              ? 'border-b-2 border-gray-900 text-gray-900 -mb-px'
              : 'text-gray-400 hover:text-gray-600',
          )}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          In-Clinic Visit
        </button>
        <button
          type="button"
          onClick={() => setTab('call')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors',
            tab === 'call'
              ? 'border-b-2 border-gray-900 text-gray-900 -mb-px'
              : 'text-gray-400 hover:text-gray-600',
          )}
        >
          <Video className="h-3.5 w-3.5" />
          Video Call
        </button>
      </div>

      {tab === 'call' && <CallBookingForm clinicSlug={slug} />}

      {/* Appointment tab */}
      {tab === 'appointment' && (
      <div className="p-5 space-y-4">
      {/* Step indicator */}
      <div className="flex items-center gap-1 text-[10px] text-gray-400">
        <span className={cn('font-medium', step === 1 && 'text-gray-900')}>1. Date &amp; Time</span>
        <span>›</span>
        <span className={cn('font-medium', step === 2 && 'text-gray-900')}>2. Your Details</span>
      </div>

      {step === 1 && (
        <div className="space-y-3">
          {/* Week nav */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setWeekOffset(o => Math.max(0, o - 1))}
              disabled={weekOffset === 0}
              className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-500">
              {format(weekStart, 'd MMM')} – {format(weekDays[6], 'd MMM')}
            </span>
            <button
              type="button"
              onClick={() => setWeekOffset(o => o + 1)}
              className="rounded p-1 text-gray-400 hover:text-gray-700"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day buttons */}
          <div className="grid grid-cols-7 gap-0.5">
            {weekDays.map(day => {
              const isPast = day < today
              const isSelected = selectedDate && isSameDay(day, selectedDate)
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
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-3">No availability on this day</p>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  {slots.map(slot => (
                    <button
                      key={slot.datetime}
                      type="button"
                      onClick={() => setSelectedSlot(s => s?.datetime === slot.datetime ? null : slot)}
                      className={cn(
                        'rounded-lg border px-2 py-2 text-left text-xs transition-colors',
                        selectedSlot?.datetime === slot.datetime
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-gray-400',
                      )}
                    >
                      <div className="font-medium">{slot.time_12h}</div>
                      <div className="text-[10px] opacity-70 truncate">{slot.practitioner}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            disabled={!selectedSlot}
            onClick={() => setStep(2)}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40 hover:bg-gray-700 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
            <span className="font-medium">{selectedSlot?.time_12h}</span>
            {' · '}
            {selectedSlot && selectedDate && format(selectedDate, 'EEE d MMM')}
            {' · '}
            {selectedSlot?.practitioner}
          </div>

          {(['firstName', 'lastName', 'email', 'phone'] as const).map(field => (
            <div key={field}>
              <label className="block text-[10px] font-medium uppercase tracking-wide text-gray-500 mb-1">
                {field === 'firstName' ? 'First name' : field === 'lastName' ? 'Last name' : field === 'email' ? 'Email' : 'Phone'}
              </label>
              <input
                type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                value={patient[field]}
                onChange={e => setPatient(p => ({ ...p, [field]: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              />
            </div>
          ))}

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setStep(1); setError(null) }}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={submitting || !patient.firstName || !patient.lastName || !patient.email || !patient.phone}
              onClick={handleConfirm}
              className="flex-1 rounded-lg bg-gray-900 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-40 hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Confirm
            </button>
          </div>
        </div>
      )}
      </div>
      )}
    </div>
  )
}
