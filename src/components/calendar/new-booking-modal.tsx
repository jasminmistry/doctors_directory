'use client'

import { useState } from 'react'
import { format, addMinutes } from 'date-fns'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
}

export function NewBookingModal({ onClose, onSave, defaultDate, initialData }: NewBookingModalProps) {
  const isEdit = !!initialData?.id
  const today = defaultDate ?? new Date()
  const defaultDate2 = initialData?.slotStart
    ? format(new Date(initialData.slotStart), 'yyyy-MM-dd')
    : format(today, 'yyyy-MM-dd')
  const defaultStart = initialData?.slotStart
    ? format(new Date(initialData.slotStart), 'HH:mm')
    : defaultDate
    ? format(defaultDate, 'HH:mm')
    : '09:00'
  const defaultEnd = initialData?.slotEnd
    ? format(new Date(initialData.slotEnd), 'HH:mm')
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

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.patientName.trim()) {
      setError('Patient name is required')
      return
    }

    const slotStart = `${form.date}T${form.startTime}:00`
    const slotEnd = `${form.date}T${form.endTime}:00`

    if (slotEnd <= slotStart) {
      setError('End time must be after start time')
      return
    }

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
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">{isEdit ? 'Edit Appointment' : 'New Appointment'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Patient details */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Patient</p>
            <Field label="Name *">
              <input
                type="text"
                value={form.patientName}
                onChange={(e) => set('patientName', e.target.value)}
                placeholder="Jane Smith"
                className={inputCls}
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone">
                <input
                  type="tel"
                  value={form.patientPhone}
                  onChange={(e) => set('patientPhone', e.target.value)}
                  placeholder="+44 7700 000000"
                  className={inputCls}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={form.patientEmail}
                  onChange={(e) => set('patientEmail', e.target.value)}
                  placeholder="jane@example.com"
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

          {/* Appointment details */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Appointment</p>
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
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start time">
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => set('startTime', e.target.value)}
                  className={inputCls}
                  required
                />
              </Field>
              <Field label="End time">
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => set('endTime', e.target.value)}
                  className={inputCls}
                  required
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
              className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
            >
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Saving…</> : isEdit ? 'Update Appointment' : 'Save Appointment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  )
}
