'use client'

import { useEffect, useState } from 'react'
import { Loader2, Clock } from 'lucide-react'
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
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span className="text-sm">Loading schedule…</span>
      </div>
    )
  }

  if (hasConsentzId === false) {
    return (
      <div className="max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-6">
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

  return (
    <div className="max-w-xl space-y-6">
      <ScheduleEditor value={schedule} onChange={setSchedule} disabled={saving} />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {saving ? 'Saving…' : 'Save schedule'}
        </button>
      </div>
    </div>
  )
}
