'use client'

import { useState } from 'react'
import { Lock, Unlock, Phone, Mail, Clock, Loader2, MapPin, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

export interface Lead {
  id: number
  treatment: string | null
  location: string | null
  preferredTime: string | null
  status: string
  isUnlocked: boolean
  isNew: boolean
  createdAt: string
  patientName: string | null
  patientPhone: string | null
  patientEmail: string | null
}

interface LeadCardProps {
  lead: Lead
  plan: 'free' | 'pay_per_lead' | 'subscription'
  onUnlocked: (id: number, data: { patientName: string; patientPhone: string; patientEmail: string | null }) => void
  onSeen: (id: number) => void
}

export function LeadCard({ lead, plan, onUnlocked, onSeen }: LeadCardProps) {
  const [unlocking, setUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState<string | null>(null)

  const initials = lead.isUnlocked && lead.patientName
    ? lead.patientName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const avatarColor = hashToColor(lead.id)
  const isPPL = plan === 'pay_per_lead'
  const isFree = plan === 'free'
  const locked = !lead.isUnlocked

  async function handleUnlock() {
    setUnlockError(null)
    setUnlocking(true)
    try {
      const res = await fetch(`/directory/api/portal/leads/${lead.id}/unlock`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        // No card on file — redirect to Stripe to add payment method
        if (data.setupRequired && data.url) {
          window.location.href = data.url
          return
        }
        setUnlockError(data.error ?? 'Failed to unlock lead')
        return
      }
      onUnlocked(lead.id, {
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        patientEmail: data.patientEmail,
      })
    } catch {
      setUnlockError('Network error. Please try again.')
    } finally {
      setUnlocking(false)
    }
  }

  function handleSeen() {
    if (lead.isNew) {
      onSeen(lead.id)
      fetch(`/directory/api/portal/leads/${lead.id}/seen`, { method: 'POST' }).catch(() => null)
    }
  }

  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-4 transition-shadow hover:shadow-sm',
        lead.isNew ? 'border-blue-200 shadow-[0_0_0_1px_rgba(59,130,246,0.15)]' : 'border-gray-200',
      )}
      onMouseEnter={handleSeen}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white',
              avatarColor,
            )}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              {lead.treatment ?? 'Consultation Request'}
              {lead.isNew && (
                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                  New
                </span>
              )}
            </p>
            {lead.location && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />
                {lead.location}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {locked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              <Lock className="h-3 w-3" />
              Locked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              <Unlock className="h-3 w-3" />
              Unlocked
            </span>
          )}
        </div>
      </div>

      {/* Patient details */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-10 shrink-0 text-xs text-gray-400">Name</span>
          {locked ? (
            <span className="h-4 w-32 rounded bg-gray-200 blur-[3px] select-none" aria-hidden="true" />
          ) : (
            <span className="font-medium text-gray-900">{lead.patientName}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-10 shrink-0 text-xs text-gray-400">Phone</span>
          {locked ? (
            <span className="h-4 w-28 rounded bg-gray-200 blur-[3px] select-none" aria-hidden="true" />
          ) : (
            <span className="text-gray-800">{lead.patientPhone}</span>
          )}
        </div>
        {lead.preferredTime && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            Prefers {lead.preferredTime}
          </div>
        )}
        <p className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Actions */}
      {locked && isPPL && (
        <div className="space-y-1">
          <Button
            onClick={handleUnlock}
            disabled={unlocking}
            className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
          >
            {unlocking ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processing…</>
            ) : (
              <><Unlock className="h-4 w-4 mr-2" />Unlock — £15</>
            )}
          </Button>
          {unlockError && (
            <p className="text-xs text-red-600 text-center">{unlockError}</p>
          )}
        </div>
      )}

      {locked && isFree && (
        <Button
          asChild
          variant="outline"
          className="w-full h-9 text-sm border-gray-300"
        >
          <a href="/directory/portal/upgrade">Upgrade to unlock</a>
        </Button>
      )}

      {!locked && (
        <div className="flex gap-2">
          <Button
            asChild
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <a href={`tel:${lead.patientPhone}`}>
              <Phone className="h-3.5 w-3.5 mr-1.5" />
              Call
            </a>
          </Button>
          {lead.patientEmail && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="flex-1 border-gray-300"
            >
              <a href={`mailto:${lead.patientEmail}`}>
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                Email
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function hashToColor(id: number): string {
  const colors = [
    'bg-blue-500',
    'bg-violet-500',
    'bg-emerald-500',
    'bg-orange-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-amber-500',
    'bg-indigo-500',
  ]
  return colors[id % colors.length]
}
