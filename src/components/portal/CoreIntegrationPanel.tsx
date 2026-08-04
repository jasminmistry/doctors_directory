'use client'

import { useState } from 'react'
import { Link2, Link2Off, Loader2, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface CoreIntegrationPanelProps {
  hasCoreLink: boolean
  unlinkRequestedAt: string | null
  onRefresh: () => void
}

export function CoreIntegrationPanel({ hasCoreLink, unlinkRequestedAt, onRefresh }: CoreIntegrationPanelProps) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  if (!hasCoreLink) return null

  async function handleRequestUnlink() {
    setLoading(true)
    try {
      const res = await fetch('/directory/api/portal/clinic/request-unlink', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Something went wrong'); return }
      toast.success('Unlink request submitted. An admin will review it shortly.')
      setShowConfirm(false)
      onRefresh()
    } catch {
      toast.error('Unable to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelUnlink() {
    setLoading(true)
    try {
      const res = await fetch('/directory/api/portal/clinic/cancel-unlink', { method: 'POST' })
      if (!res.ok) { toast.error('Something went wrong'); return }
      toast.success('Unlink request cancelled.')
      onRefresh()
    } catch {
      toast.error('Unable to cancel request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-[#e4dccf] bg-[#f2eee5] p-6 space-y-4">
      <h2 className="text-xs font-medium text-black uppercase tracking-[0.2em]">
        Consentz Core Integration
      </h2>

      {unlinkRequestedAt ? (
        /* Pending request state */
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Unlink request pending review</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Submitted {format(new Date(unlinkRequestedAt), 'd MMM yyyy')}. An admin will review
                and unlink your Core account. You&apos;ll lose access to calendar, booking sync, and
                Core chat until re-linked.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancelUnlink}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Cancel request
          </button>
        </div>
      ) : showConfirm ? (
        /* Confirmation state */
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Are you sure?</p>
              <p className="text-xs text-red-700 mt-1">
                Unlinking your Consentz Core account will disable:
              </p>
              <ul className="mt-1.5 text-xs text-red-700 space-y-0.5 list-disc list-inside">
                <li>Online appointment booking and calendar sync</li>
                <li>Core chat sync with your inbox</li>
                <li>Automatic booking confirmations from Core</li>
              </ul>
              <p className="text-xs text-red-700 mt-1.5">
                This request will be reviewed by an admin before taking effect.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRequestUnlink}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2Off className="h-3.5 w-3.5" />}
              Submit unlink request
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Default linked state */
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Linked to Consentz Core</p>
              <p className="text-xs text-gray-600">Calendar, booking sync, and Core chat are active.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <Link2Off className="h-3.5 w-3.5" />
            Request unlink
          </button>
        </div>
      )}
    </div>
  )
}
