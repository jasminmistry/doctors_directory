'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ScheduleEditor, DEFAULT_SCHEDULE, DAYS, type DaySchedule } from '@/components/portal/schedule-editor'

interface Props {
  entityName: string
  hasConsentzId: boolean
  onDone: () => void
}

function mergeIntoDefaults(fetched: DaySchedule[]): DaySchedule[] {
  const byDay = Object.fromEntries(fetched.map((d) => [d.day, d]))
  return DAYS.map((day) => byDay[day] ?? DEFAULT_SCHEDULE.find((d) => d.day === day)!)
}

export function WelcomeWizard({ entityName, hasConsentzId, onDone }: Props) {
  const [step, setStep] = useState<'welcome' | 'schedule'>('welcome')
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE)
  const [loadingSchedule, setLoadingSchedule] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch existing schedule from Core as soon as the wizard mounts
  useEffect(() => {
    if (!hasConsentzId) return
    setLoadingSchedule(true)
    fetch('/directory/api/portal/schedule')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.schedule?.length) {
          setSchedule(mergeIntoDefaults(data.schedule as DaySchedule[]))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSchedule(false))
  }, [hasConsentzId])

  async function skip() {
    setSaving(true)
    try {
      await fetch('/directory/api/portal/wizard', { method: 'POST' })
    } finally {
      setSaving(false)
      onDone()
    }
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/directory/api/portal/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule, wizardComplete: true }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error ?? 'Failed to save schedule')
        return
      }
      toast.success('Schedule saved')
      onDone()
    } catch {
      toast.error('Failed to save schedule')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">

        {step === 'welcome' && (
          <div className="p-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900">
              <CalendarDays className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-xl font-medium text-gray-900">
              Welcome{entityName ? `, ${entityName}` : ''}!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Let&apos;s confirm your weekly availability so patients know when you&apos;re open for bookings.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              {hasConsentzId ? (
                <button
                  type="button"
                  disabled={loadingSchedule}
                  onClick={() => setStep('schedule')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {loadingSchedule
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading your schedule…</>
                    : <>{schedule !== DEFAULT_SCHEDULE ? 'Review & update schedule' : 'Set up schedule'}<ChevronRight className="h-4 w-4" /></>}
                </button>
              ) : (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                  Your account is still being provisioned. You can set up your schedule once an admin completes your setup.
                </p>
              )}
              <button
                type="button"
                onClick={skip}
                disabled={saving || loadingSchedule}
                className="text-sm text-gray-600 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {step === 'schedule' && (
          <div className="p-6">
            <div className="mb-5">
              <h2 className="text-lg font-medium text-gray-900">Weekly schedule</h2>
              <p className="mt-1 text-sm text-gray-600">
                Toggle each day and set your opening hours. Bookings are only accepted on enabled days.
              </p>
            </div>

            <div className="max-h-[50vh] overflow-y-auto pr-1">
              <ScheduleEditor value={schedule} onChange={setSchedule} disabled={saving} />
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep('welcome')}
                disabled={saving}
                className="text-sm text-gray-600 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={skip}
                  disabled={saving}
                  className="text-sm text-gray-600 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save & continue
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
