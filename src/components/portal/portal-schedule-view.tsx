'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Clock, Info, CalendarDays, RefreshCw, Video, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { ScheduleEditor, DEFAULT_SCHEDULE, DAYS, type DaySchedule } from '@/components/portal/schedule-editor'

function mergeIntoDefaults(fetched: DaySchedule[]): DaySchedule[] {
  const byDay = Object.fromEntries(fetched.map((d) => [d.day, d]))
  return DAYS.map((day) => byDay[day] ?? DEFAULT_SCHEDULE.find((d) => d.day === day)!)
}

export function PortalScheduleView() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasConsentzId, setHasConsentzId] = useState<boolean | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [schedRes, wizRes] = await Promise.all([
          fetch('/directory/api/portal/schedule'),
          fetch('/directory/api/portal/wizard'),
        ])
        const wizData = wizRes.ok ? await wizRes.json() : null
        setHasConsentzId(wizData?.hasConsentzId ?? false)

        if (schedRes.ok) {
          const data = await schedRes.json()
          if (data?.schedule?.length) {
            setSchedule(mergeIntoDefaults(data.schedule as DaySchedule[]))
          }
        }
      } catch {
        toast.error('Failed to load schedule')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/directory/api/portal/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error ?? 'Failed to save schedule')
        return
      }
      toast.success('Schedule saved')
    } catch {
      toast.error('Failed to save schedule')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-600">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span className="text-sm">Loading schedule…</span>
      </div>
    )
  }

  if (hasConsentzId === false) {
    return (
      <div className="max-w-lg rounded-lg border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Account setup in progress</p>
            <p className="mt-1 text-sm text-amber-700">
              Your Consentz account is still being provisioned. Once an admin completes your setup, you can configure your weekly schedule here.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const enabledDays = schedule.filter((d) => d.enabled)

  return (
    <div className="max-w-xl space-y-6">
      <ScheduleEditor value={schedule} onChange={setSchedule} disabled={saving} />

      <div className="flex justify-end">
        <Button
          type="button"
          size="lg"
          variant="default"
          onClick={handleSave}
          disabled={saving}
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {saving ? 'Saving…' : 'Save schedule'}
        </Button>
      </div>

      {/* Patient-facing preview */}
      {enabledDays.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-gray-600 shrink-0" />
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Patient view — bookable hours</p>
          </div>
          <div className="space-y-1">
            {enabledDays.map((d) => (
              <div key={d.day} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 w-28">{d.day}</span>
                <span className="text-gray-600">{d.startTime} – {d.endTime}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600">This is what patients see when choosing a booking slot.</p>
        </div>
      )}

      {/* How schedule rules work */}
      <div className="rounded-lg bg-white border border-gray-200 bg-gray-50 p-4 space-y-3 text-sm text-gray-700">
        <div className="flex items-center gap-2 mb-1">
          <Info className="h-4 w-4 text-gray-400 shrink-0" />
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">How schedule rules work</p>
        </div>
        <div className="space-y-2.5 text-sm text-gray-900">
          <div className="flex items-start gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" />
            <p>
              <span className="font-medium">Booking window: </span>
              Patients can only book on days you have enabled, and only within your stated start–end hours.
              Disabled days are completely hidden from the booking calendar.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" />
            <p>
              <span className="font-medium">Event duration: </span>
              Each consultation event has a set duration (15, 30, or 60 minutes). Booking a 60-minute
              slot at 14:00 blocks 14:00–15:00, so the next available slot is 15:00 — not 14:30.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Video className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" />
            <p>
              <span className="font-medium">Online status: </span>
              You appear online when your portal is open, you are within schedule hours, and your last
              activity was within 5 minutes. Patients see an &apos;online now&apos; indicator on your profile.
            </p>
          </div>
          {hasConsentzId && (
            <div className="flex items-start gap-2">
              <RefreshCw className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" />
              <p>
                <span className="font-medium">Core calendar conflicts: </span>
                Appointments already booked in your Consentz Core calendar are automatically blocked
                in the directory booking flow — patients cannot double-book a slot you have already filled.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
