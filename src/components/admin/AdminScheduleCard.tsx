'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { ScheduleEditor, DEFAULT_SCHEDULE, type DaySchedule } from '@/components/portal/schedule-editor'

interface Props {
  entityType: 'clinic' | 'practitioner'
  slug: string
}

export function AdminScheduleCard({ entityType, slug }: Props) {
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [noConsentzId, setNoConsentzId] = useState(false)

  const apiBase = `/directory/api/admin/${entityType === 'clinic' ? 'clinics' : 'practitioners'}/${slug}/schedule`

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetch(apiBase)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return
        if (data.noConsentzId) { setNoConsentzId(true); return }
        if (Array.isArray(data.schedule) && data.schedule.length > 0) {
          // Merge fetched days into defaults so all 7 days are always shown
          const map = Object.fromEntries((data.schedule as DaySchedule[]).map((d) => [d.day, d]))
          setSchedule(DEFAULT_SCHEDULE.map((d) => map[d.day] ?? d))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [apiBase, slug])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Weekly Schedule</h2>
        {!noConsentzId && !loading && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        )}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : noConsentzId ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            No Consentz account linked to this {entityType}. Schedule management is available once an account is provisioned.
          </p>
        ) : (
          <ScheduleEditor value={schedule} onChange={setSchedule} disabled={saving} />
        )}
      </div>
    </div>
  )
}
