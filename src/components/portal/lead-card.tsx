'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Lock, Unlock, Phone, Mail, Clock, Loader2, MapPin, CalendarDays,
  ChevronDown, RefreshCw, FileText, User, CheckCircle2, ExternalLink,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { PPL_LEAD_PRICE } from '@/lib/pricing'

export type PipelineStatus = 'new' | 'contacted' | 'booked' | 'lost' | 'spam' | 'archived' | 'closed'

export type LeadSource = 'consultation' | 'pricing'

export interface Lead {
  id: number
  treatment: string | null
  location: string | null
  preferredTime: string | null
  status: string
  pipelineStatus: PipelineStatus
  notes: string | null
  ownerName: string | null
  coreSynced: boolean
  isUnlocked: boolean
  isNew: boolean
  createdAt: string
  patientName: string | null
  patientPhone: string | null
  patientEmail: string | null
  patientAge: number | null
  source: LeadSource
}

interface LeadCardProps {
  lead: Lead
  plan: 'free' | 'pay_per_lead' | 'subscription'
  onUnlocked: (id: number, data: { patientName: string; patientPhone: string; patientEmail: string | null; patientAge: number | null }) => void
  onSeen: (id: number) => void
  onUpdated: (id: number, patch: Partial<Pick<Lead, 'pipelineStatus' | 'notes' | 'ownerName'>>) => void
  onPulledToCore: (id: number, data: { coreUrl: string }) => void
  highlighted?: boolean
}

const PIPELINE_STATUSES: { value: PipelineStatus; label: string; color: string }[] = [
  { value: 'new',       label: 'New',       color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'booked',    label: 'Booked',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'lost',      label: 'Lost',      color: 'bg-gray-100 text-gray-500 border-gray-200' },
  { value: 'spam',      label: 'Spam',      color: 'bg-red-100 text-red-600 border-red-200' },
  { value: 'archived',  label: 'Archived',  color: 'bg-gray-50 text-gray-500 border-gray-100' },
]

function StatusPill({
  status,
  onChange,
}: {
  status: PipelineStatus
  onChange: (s: PipelineStatus) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = PIPELINE_STATUSES.find((s) => s.value === status) ?? PIPELINE_STATUSES[0]

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors',
          current.color,
        )}
      >
        {current.label}
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 w-36 rounded-lg border border-gray-200 bg-white py-1">
          {PIPELINE_STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => { onChange(s.value); setOpen(false) }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors',
                status === s.value ? 'text-gray-900' : 'text-gray-600',
              )}
            >
              <span className={cn('h-2 w-2 rounded-full shrink-0', s.color.split(' ')[0])} />
              {s.label}
              {status === s.value && <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-gray-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function NotesSection({ leadId, initialNotes, onSaved }: { leadId: number; initialNotes: string | null; onSaved: (n: string | null) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialNotes ?? '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      await fetch(`/directory/api/portal/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: value }),
      })
      onSaved(value.trim() || null)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex w-full items-start gap-1.5 rounded-md px-1.5 py-1 -mx-1.5 text-left transition-colors hover:bg-gray-50 group"
      >
        <FileText className="h-3.5 w-3.5 mt-0.5 text-gray-500 group-hover:text-gray-600 shrink-0" />
        <span className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
          {initialNotes ? initialNotes : 'Add note…'}
        </span>
      </button>
    )
  }

  return (
    <div className="space-y-1.5">
      <textarea
        autoFocus
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs resize-none focus:border-gray-400 focus:outline-none"
        placeholder="Add a note about this lead…"
      />
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => { setValue(initialNotes ?? ''); setEditing(false) }}
          className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function OwnerField({ leadId, initialOwner, onSaved }: { leadId: number; initialOwner: string | null; onSaved: (o: string | null) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialOwner ?? '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      await fetch(`/directory/api/portal/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerName: value }),
      })
      onSaved(value.trim() || null)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex items-center gap-1 rounded-md px-1.5 py-1 -mx-1.5 transition-colors hover:bg-gray-50 group"
      >
        <User className="h-3.5 w-3.5 text-gray-500 group-hover:text-gray-600" />
        <span className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
          {initialOwner ?? 'Assign…'}
        </span>
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setValue(initialOwner ?? ''); setEditing(false) } }}
        className="rounded-lg border border-gray-200 px-2 py-1 text-xs focus:border-gray-400 focus:outline-none w-28"
        placeholder="Staff name"
      />
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="rounded-lg bg-gray-900 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'OK'}
      </button>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
  locked,
  placeholderWidth,
  emphasis,
}: {
  icon: LucideIcon
  label: string
  value: string | null
  locked: boolean
  placeholderWidth: string
  emphasis?: boolean
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
      <span className="w-10 shrink-0 text-xs text-gray-500">{label}</span>
      {locked ? (
        <span className={cn('h-4 rounded bg-gray-200 blur-[3px] select-none', placeholderWidth)} aria-hidden="true" />
      ) : (
        <span className={emphasis ? 'font-medium text-gray-900' : 'text-gray-800'}>{value ?? '—'}</span>
      )}
    </div>
  )
}

export function LeadCard({ lead, plan, onUnlocked, onSeen, onUpdated, onPulledToCore, highlighted }: LeadCardProps) {
  const [unlocking, setUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState<string | null>(null)
  const [localNotes, setLocalNotes] = useState(lead.notes)
  const [localOwner, setLocalOwner] = useState(lead.ownerName)
  const [pulling, setPulling] = useState(false)
  const [pullError, setPullError] = useState<string | null>(null)
  const [coreUrl, setCoreUrl] = useState<string | null>(null)

  const initials = lead.isUnlocked && lead.patientName
    ? lead.patientName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const avatarColor = hashToColor(lead.id)
  const isPPL = plan === 'pay_per_lead'
  const isFree = plan === 'free'
  const locked = !lead.isUnlocked

  async function handleStatusChange(s: PipelineStatus) {
    await fetch(`/directory/api/portal/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pipelineStatus: s }),
    })
    onUpdated(lead.id, { pipelineStatus: s })
  }

  async function handleUnlock() {
    setUnlockError(null)
    setUnlocking(true)
    try {
      const res = await fetch(`/directory/api/portal/leads/${lead.id}/unlock`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        if (data.setupRequired && data.url) { window.location.href = data.url; return }
        setUnlockError(data.error ?? 'Failed to unlock lead')
        return
      }
      onUnlocked(lead.id, {
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        patientEmail: data.patientEmail,
        patientAge: data.patientAge,
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

  async function handlePullToCore() {
    setPullError(null)
    setPulling(true)
    try {
      const res = await fetch(`/directory/api/portal/leads/${lead.id}/pull-to-core`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setPullError(data.error ?? 'Failed to pull lead into Core')
        return
      }
      setCoreUrl(data.coreUrl ?? null)
      onPulledToCore(lead.id, { coreUrl: data.coreUrl })
    } catch {
      setPullError('Network error. Please try again.')
    } finally {
      setPulling(false)
    }
  }

  return (
    <div
      id={`lead-${lead.id}`}
      className={cn(
        'rounded-lg border bg-white p-4 transition-shadow ',
        highlighted ? 'border-violet-300 shadow-[0_0_0_2px_rgba(139,92,246,0.25)]'
          : lead.isNew ? 'border-blue-200 shadow-[0_0_0_1px_rgba(59,130,246,0.15)]' : 'border-gray-200',
      )}
      onMouseEnter={handleSeen}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white', avatarColor)}>
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              {lead.treatment ?? 'Consultation Request'}
              {lead.source === 'pricing' && (
                <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">Pricing</span>
              )}
              {lead.isNew && (
                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">New</span>
              )}
            </p>
            {lead.location && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />
                {lead.location}
              </p>
            )}
          </div>
        </div>

        {/* Status pill + lock badge */}
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {lead.coreSynced && (
            <span
              title="Synced to Consentz Core"
              className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[10px] font-medium text-violet-700"
            >
              <RefreshCw className="h-2.5 w-2.5" />
              Core
            </span>
          )}
          <StatusPill status={lead.pipelineStatus} onChange={handleStatusChange} />
          {locked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              <Lock className="h-3 w-3" />
              Locked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              <Unlock className="h-3 w-3" />
              Unlocked
            </span>
          )}
        </div>
      </div>

      {/* Patient details */}
      <div className="space-y-1.5 mb-3 rounded-lg bg-gray-50/60 px-2.5 py-2">
        <DetailRow icon={User} label="Name" value={lead.patientName} locked={locked} placeholderWidth="w-32" emphasis />
        <DetailRow icon={Phone} label="Phone" value={lead.patientPhone} locked={locked} placeholderWidth="w-28" />
        <DetailRow icon={Mail} label="Email" value={lead.patientEmail} locked={locked} placeholderWidth="w-40" />
        <DetailRow icon={CalendarDays} label="Age" value={lead.patientAge != null ? String(lead.patientAge) : null} locked={locked} placeholderWidth="w-8" />
        {lead.preferredTime && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            Prefers {lead.preferredTime}
          </div>
        )}
        <p className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Owner + Notes */}
      <div className="mb-3 space-y-2 border-t border-gray-50 pt-2.5">
        <OwnerField
          leadId={lead.id}
          initialOwner={localOwner}
          onSaved={(o) => { setLocalOwner(o); onUpdated(lead.id, { ownerName: o }) }}
        />
        <NotesSection
          leadId={lead.id}
          initialNotes={localNotes}
          onSaved={(n) => { setLocalNotes(n); onUpdated(lead.id, { notes: n }) }}
        />
      </div>

      {/* Actions */}
      {locked && isPPL && (
        <div className="space-y-1">
          <Button
            onClick={handleUnlock}
            disabled={unlocking}
            variant="outline" 
            className="border-[#e0e0e0]"
          >
            {unlocking ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processing…</>
            ) : (
              <><Unlock className="h-4 w-4 mr-2" />Unlock — £{PPL_LEAD_PRICE}</>
            )}
          </Button>
          {unlockError && <p className="text-xs text-red-600 text-center">{unlockError}</p>}
        </div>
      )}

      {locked && isFree && (
        <Button asChild variant="outline" className="w-full h-9 text-sm">
          <a href="/directory/portal/upgrade">Upgrade to unlock</a>
        </Button>
      )}

      {!locked && (
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-white hover:bg-primary/90 hover:cursor-pointer transition-colors">
              <a href={`tel:${lead.patientPhone}`}>
                <Phone className="h-3.5 w-3.5 mr-1.5" />
                Call
              </a>
            </Button>
            {lead.patientEmail && (
              <Button asChild size="sm" variant="outline" className="border-[#e0e0e0] ">
                <a href={`mailto:${lead.patientEmail}`}>
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                  Email
                </a>
              </Button>
            )}
            {!lead.coreSynced && (
              <Button
                onClick={handlePullToCore}
                disabled={pulling}
                size="sm"
                variant="outline"
                className="border-violet-200 text-violet-700 hover:bg-violet-50"
              >
                {pulling ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Pulling…</>
                ) : (
                  <><RefreshCw className="h-3.5 w-3.5 mr-1.5" />Pull into Consentz Core</>
                )}
              </Button>
            )}
            {lead.coreSynced && coreUrl && (
              <Button asChild size="sm" variant="outline" className="border-violet-200 text-violet-700 hover:bg-violet-50">
                <a href={coreUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  View in Core
                </a>
              </Button>
            )}
          </div>
          {pullError && <p className="text-xs text-red-600">{pullError}</p>}
        </div>
      )}
    </div>
  )
}

function hashToColor(id: number): string {
  const colors = [
    'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-amber-500', 'bg-indigo-500',
  ]
  return colors[id % colors.length]
}
