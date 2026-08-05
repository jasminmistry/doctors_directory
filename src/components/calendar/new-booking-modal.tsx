'use client'

import { useEffect, useState } from 'react'
import { format, addMinutes } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * `defaultDate` (from clicking an empty grid slot) is already a "zoned" Date —
 * its local getters represent clinic wall-clock time, see booking-calendar.tsx.
 * `initialData.slotStart/slotEnd` (editing an existing booking) are real UTC ISO
 * strings from the DB and need `toZonedTime` before their fields mean anything
 * in clinic-local terms. Both end up represented the same way so the rest of
 * this component can just read date/time fields off a Date without caring which
 * path it came from.
 */
function fieldsToDate(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hour, minute] = timeStr.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute, 0)
}

export interface NewBookingData {
  patientName: string
  patientPhone: string
  patientEmail: string
  treatment: string
  notes: string
  slotStart: string
  slotEnd: string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no_show'
}

interface NewBookingModalProps {
  onClose: () => void
  onSave: (data: NewBookingData) => Promise<void>
  defaultDate?: Date
  initialData?: Partial<NewBookingData> & { id?: number }
  clinicTimezone: string
}

type FieldErrors = Record<string, string>

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidUkPhone(value: string): boolean {
  return UK_PHONE_RE.test(value.trim().replace(/\s/g, ''))
}

function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim())
}

export function NewBookingModal({ onClose, onSave, defaultDate, initialData, clinicTimezone }: NewBookingModalProps) {
  const isEdit = !!initialData?.id
  const zonedStart = initialData?.slotStart ? toZonedTime(initialData.slotStart, clinicTimezone) : undefined
  const zonedEnd = initialData?.slotEnd ? toZonedTime(initialData.slotEnd, clinicTimezone) : undefined
  const today = zonedStart ?? defaultDate ?? new Date()
  const defaultDate2 = format(today, 'yyyy-MM-dd')
  const defaultStart = zonedStart
    ? format(zonedStart, 'HH:mm')
    : defaultDate
    ? format(defaultDate, 'HH:mm')
    : '09:00'
  const defaultEnd = zonedEnd
    ? format(zonedEnd, 'HH:mm')
    : defaultDate
    ? format(addMinutes(defaultDate, 30), 'HH:mm')
    : '09:30'

  const [form, setForm] = useState({
    patientName: initialData?.patientName ?? '',
    patientPhone: initialData?.patientPhone ?? '',
    patientEmail: initialData?.patientEmail ?? '',
    treatment: initialData?.treatment ?? '',
    notes: initialData?.notes ?? '',
    date: defaultDate2,
    startTime: defaultStart,
    endTime: defaultEnd,
    status: (initialData?.status ?? 'confirmed') as NewBookingData['status'],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const errors: FieldErrors = {}
    if (!form.patientName.trim()) errors.patientName = 'Patient name is required.'
    if (form.patientEmail.trim() && !isValidEmail(form.patientEmail)) errors.patientEmail = 'Please enter a valid email address.'
    if (form.patientPhone.trim() && !isValidUkPhone(form.patientPhone)) errors.patientPhone = 'Please enter a valid UK phone number.'
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    if (`${form.date}T${form.endTime}` <= `${form.date}T${form.startTime}`) {
      setError('End time must be after start time')
      return
    }

    // The date/time fields are clinic wall-clock, not the staff member's own
    // browser time — convert using the clinic's actual timezone so appointments
    // stay correct regardless of where the staff member happens to be.
    const slotStart = fromZonedTime(fieldsToDate(form.date, form.startTime), clinicTimezone).toISOString()
    const slotEnd = fromZonedTime(fieldsToDate(form.date, form.endTime), clinicTimezone).toISOString()

    setSaving(true)
    try {
      await onSave({
        patientName: form.patientName.trim(),
        patientPhone: form.patientPhone.trim(),
        patientEmail: form.patientEmail.trim(),
        treatment: form.treatment.trim(),
        notes: form.notes.trim(),
        slotStart,
        slotEnd,
        status: form.status,
      })
      onClose()
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Failed to create booking')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="flex w-full max-w-md max-h-[90vh] flex-col rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 shrink-0">
          <h2 className="text-sm font-semibold text-gray-900">{isEdit ? 'Edit Appointment' : 'New Appointment'}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-5 space-y-4 overflow-y-auto">
          {/* Patient details */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Patient</p>
            <Field label="Name *" error={fieldErrors.patientName}>
              <input
                type="text"
                value={form.patientName}
                onChange={(e) => set('patientName', e.target.value)}
                placeholder="Jane Smith"
                className={cn(inputCls, fieldErrors.patientName && 'border-red-400')}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" error={fieldErrors.patientPhone}>
                <input
                  type="tel"
                  value={form.patientPhone}
                  onChange={(e) => set('patientPhone', e.target.value)}
                  placeholder="+44 7700 000000"
                  className={cn(inputCls, fieldErrors.patientPhone && 'border-red-400')}
                />
              </Field>
              <Field label="Email" error={fieldErrors.patientEmail}>
                <input
                  type="email"
                  value={form.patientEmail}
                  onChange={(e) => set('patientEmail', e.target.value)}
                  placeholder="jane@example.com"
                  disabled={isEdit}
                  title={isEdit ? "Email can't be changed after the appointment is created" : undefined}
                  className={cn(inputCls, fieldErrors.patientEmail && 'border-red-400', isEdit && 'cursor-not-allowed bg-gray-50 text-gray-600')}
                />
              </Field>
            </div>
          </div>

          {/* Appointment details */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Appointment</p>
            <Field label="Treatment / Service">
              <input
                type="text"
                value={form.treatment}
                onChange={(e) => set('treatment', e.target.value)}
                placeholder="e.g. Botox consultation"
                className={inputCls}
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start time">
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => set('startTime', e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="End time">
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => set('endTime', e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className={inputCls}
              >
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                {isEdit && <option value="completed">Completed</option>}
                {isEdit && <option value="cancelled">Cancelled</option>}
                {isEdit && <option value="no_show">No Show</option>}
              </select>
            </Field>
            <Field label="Notes">
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Any additional notes…"
                rows={2}
                className={cn(inputCls, 'resize-none')}
              />
            </Field>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-9 text-sm">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className='flex-1'
            >
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Saving…</> : isEdit ? 'Update Appointment' : 'Save Appointment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
