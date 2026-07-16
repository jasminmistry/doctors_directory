'use client'

import { cn } from '@/lib/utils'

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
export type DayName = (typeof DAYS)[number]

export interface DaySchedule {
  day: DayName
  startTime: string
  endTime: string
  enabled: boolean
}

export const DEFAULT_SCHEDULE: DaySchedule[] = DAYS.map((day) => ({
  day,
  startTime: '09:00',
  endTime: '17:00',
  enabled: day !== 'Saturday' && day !== 'Sunday',
}))

interface Props {
  value: DaySchedule[]
  onChange: (schedule: DaySchedule[]) => void
  disabled?: boolean
}

export function ScheduleEditor({ value, onChange, disabled }: Props) {
  function update(index: number, field: keyof DaySchedule, val: string | boolean) {
    onChange(value.map((d, i) => (i === index ? { ...d, [field]: val } : d)))
  }

  return (
    <div className="space-y-2">
      {value.map((day, i) => (
        <div
          key={day.day}
          className={cn(
            'flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
            day.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50',
          )}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={() => update(i, 'enabled', !day.enabled)}
            role="switch"
            aria-checked={day.enabled}
            aria-label={`Toggle ${day.day}`}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900',
              day.enabled ? 'bg-gray-900' : 'bg-gray-200',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-4 w-4 translate-x-0 transform rounded-full bg-white shadow transition-transform',
                day.enabled && 'translate-x-4',
              )}
            />
          </button>

          <span className={cn('w-24 shrink-0 text-sm font-medium', day.enabled ? 'text-gray-900' : 'text-gray-500')}>
            {day.day}
          </span>

          {day.enabled ? (
            <div className="ml-auto flex items-center gap-2">
              <input
                type="time"
                value={day.startTime}
                disabled={disabled}
                onChange={(e) => update(i, 'startTime', e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50"
              />
              <span className="text-xs text-gray-500">to</span>
              <input
                type="time"
                value={day.endTime}
                disabled={disabled}
                onChange={(e) => update(i, 'endTime', e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50"
              />
            </div>
          ) : (
            <span className="ml-auto text-xs text-gray-500">Closed</span>
          )}
        </div>
      ))}
    </div>
  )
}
