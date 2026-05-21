'use client'

import { useState, useEffect, useRef } from 'react'
import { format, addDays, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2, Video, ExternalLink, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CallSlot {
  practitioner_id: number
  practitioner: string
  start: string // "HH:MM"
  end: string   // "HH:MM"
}

interface BookingResult {
  call_type: 'jitsi' | 'zoom'
  meeting_id: number
  slot_start: string
  slot_end: string
  practitioner: { id: number; name: string }
  join_url: string | null
  join_url_ready: boolean
}

interface CallBookingFormProps {
  clinicSlug: string
  prefillFirstName?: string
  prefillLastName?: string
  prefillEmail?: string
  prefillPhone?: string
  compact?: boolean
}

type Step = 1 | 2 | 3

const WEEK_SIZE = 7

function dateKey(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

function slotDatetime(date: Date, time: string) {
  return `${dateKey(date)} ${time}`
}

export function CallBookingForm({
  clinicSlug,
  prefillFirstName = '',
  prefillLastName = '',
  prefillEmail = '',
  prefillPhone = '',
  compact = false,
}: CallBookingFormProps) {
  const [step, setStep] = useState<Step>(1)
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slots, setSlots] = useState<CallSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<CallSlot | null>(null)

  const [firstName, setFirstName] = useState(prefillFirstName)
  const [lastName, setLastName] = useState(prefillLastName)
  const [email, setEmail] = useState(prefillEmail)
  const [phone, setPhone] = useState(prefillPhone)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BookingResult | null>(null)
  const [joinUrl, setJoinUrl] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekStart = addDays(today, weekOffset * WEEK_SIZE)
  const weekDays = Array.from({ length: WEEK_SIZE }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    if (!selectedDate) return
    setSlotsLoading(true)
    setSlots([])
    setSelectedSlot(null)
    fetch(`/directory/api/call/${clinicSlug}/slots?date=${dateKey(selectedDate)}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [selectedDate, clinicSlug])

  // Poll Zoom meeting until join_url is ready, then clear interval
  useEffect(() => {
    if (!result || result.call_type !== 'zoom' || result.join_url_ready) return
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`/directory/api/call/${clinicSlug}/meeting/${result.meeting_id}`)
        if (!r.ok) return
        const d: BookingResult = await r.json()
        if (d.join_url_ready && d.join_url) {
          setJoinUrl(d.join_url)
          if (pollRef.current) clearInterval(pollRef.current)
        }
      } catch {
        // keep polling
      }
    }, 10_000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [result, clinicSlug])

  async function handleConfirm() {
    if (!selectedDate || !selectedSlot) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/directory/api/call/${clinicSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitioner_id: selectedSlot.practitioner_id,
          slot_start: slotDatetime(selectedDate, selectedSlot.start),
          slot_end: slotDatetime(selectedDate, selectedSlot.end),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          ...(phone.trim() ? { phone: phone.trim() } : {}),
        }),
      })
      const data: BookingResult = await res.json()
      if (!res.ok) {
        setError((data as unknown as { error?: string }).error ?? 'Booking failed — please try again')
        return
      }
      setResult(data)
      if (data.join_url_ready && data.join_url) setJoinUrl(data.join_url)
      setStep(3)
    } catch {
      setError('Booking failed — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  const pad = compact ? 'px-4 py-4' : 'px-5 py-5'
  const textSm = compact ? 'text-xs' : 'text-sm'
  const labelCls = `${textSm} font-medium text-gray-800 mb-1.5 block`

  // ── Step 3: success ─────────────────────────────────────────────────────────
  if (step === 3 && result) {
    const startDt = new Date(result.slot_start)
    const readyUrl = joinUrl ?? (result.join_url_ready ? result.join_url : null)
    const isZoomWaiting = result.call_type === 'zoom' && !readyUrl

    return (
      <div className={cn('flex flex-col items-center justify-center gap-4 text-center', compact ? 'py-8 px-5' : 'py-12 px-6')}>
        {isZoomWaiting ? (
          <Clock className="h-10 w-10 text-amber-400 shrink-0" />
        ) : (
          <CheckCircle2 className="h-10 w-10 text-green-500 shrink-0" />
        )}
        <div className="space-y-1">
          <p className="font-semibold text-gray-900 text-sm">Video call booked!</p>
          <p className="text-xs text-gray-500">
            {format(startDt, "EEE d MMM 'at' HH:mm")} with{' '}
            <span className="font-medium">{result.practitioner.name}</span>
          </p>
        </div>

        {isZoomWaiting ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
            <p className="text-xs text-gray-500">Preparing your Zoom link — this usually takes under a minute…</p>
          </div>
        ) : (
          <a
            href={readyUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            <Video className="h-4 w-4" />
            Join Video Call
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>
        )}

        <p className="text-[10px] text-gray-400">
          {isZoomWaiting
            ? 'Your join link will appear here once the host has set up the call.'
            : 'Save this link — you\'ll need it at the scheduled time.'}
        </p>
      </div>
    )
  }

  // ── Step 2: patient details ──────────────────────────────────────────────────
  if (step === 2) {
    const selectedDayLabel = selectedDate ? format(selectedDate, 'EEE d MMM') : ''
    const canConfirm = firstName.trim() && lastName.trim() && email.trim() && !submitting
    return (
      <div className={cn('space-y-4', pad)}>
        {/* Slot recap */}
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <span className="font-medium">{selectedSlot?.start} – {selectedSlot?.end}</span>
          {' · '}{selectedDayLabel}
          {' · '}{selectedSlot?.practitioner}
        </div>

        <div className="space-y-2">
          <label className={labelCls}>Your details</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>

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
            disabled={!canConfirm}
            onClick={handleConfirm}
            className="flex-1 rounded-lg bg-gray-900 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-40 hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Video className="h-3.5 w-3.5" />}
            {submitting ? 'Booking…' : 'Confirm Call'}
          </button>
        </div>
      </div>
    )
  }

  // ── Step 1: date + slot ──────────────────────────────────────────────────────
  return (
    <div className={cn('space-y-4', pad)}>
      {/* Step indicator */}
      <div className="flex items-center gap-1 text-[10px] text-gray-400">
        <span className="font-medium text-gray-900">1. Date &amp; Time</span>
        <span>›</span>
        <span className="font-medium">2. Your Details</span>
      </div>

      {/* Week navigator */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setWeekOffset((o) => Math.max(0, o - 1))}
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
          onClick={() => setWeekOffset((o) => o + 1)}
          className="rounded p-1 text-gray-400 hover:text-gray-700"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day picker */}
      <div className="grid grid-cols-7 gap-0.5">
        {weekDays.map((day) => {
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
            <p className="text-center text-xs text-gray-400 py-3">No call slots available on this day</p>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {slots.map((slot, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedSlot((s) =>
                    s?.practitioner_id === slot.practitioner_id && s?.start === slot.start ? null : slot,
                  )}
                  className={cn(
                    'rounded-lg border px-2 py-2 text-left text-xs transition-colors',
                    selectedSlot?.practitioner_id === slot.practitioner_id && selectedSlot?.start === slot.start
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-700 hover:border-gray-400',
                  )}
                >
                  <div className="font-medium">{slot.start} – {slot.end}</div>
                  <div className={cn('text-[10px] truncate', selectedSlot?.start === slot.start ? 'opacity-70' : 'text-gray-400')}>
                    {slot.practitioner}
                  </div>
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
        className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40 hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
      >
        <Video className="h-4 w-4" />
        Next →
      </button>
    </div>
  )
}
