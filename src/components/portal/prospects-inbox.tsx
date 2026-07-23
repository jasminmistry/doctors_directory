'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, Inbox, CheckCircle, CreditCard } from 'lucide-react'
import { LeadCard, type Lead, type PipelineStatus } from '@/components/portal/lead-card'
import { cn } from '@/lib/utils'
import { PPL_LEAD_PRICE } from '@/lib/pricing'

interface ProspectsInboxProps {
  plan: 'free' | 'pay_per_lead' | 'subscription'
}

type SetupStatus = 'idle' | 'activating' | 'unlocked' | 'card_saved' | 'failed'

const PIPELINE_TABS: { value: PipelineStatus | 'all'; label: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'new',       label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'booked',    label: 'Booked' },
  { value: 'lost',      label: 'Lost' },
  { value: 'spam',      label: 'Spam' },
  { value: 'archived',  label: 'Archived' },
]

export function ProspectsInbox({ plan }: ProspectsInboxProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [setupStatus, setSetupStatus] = useState<SetupStatus>('idle')
  const [activeTab, setActiveTab] = useState<PipelineStatus | 'all'>('all')
  const searchParams = useSearchParams()

  useEffect(() => {
    async function load() {
      try {
        const setupDone = searchParams.get('setup') === 'done'

        if (setupDone) {
          setSetupStatus('activating')
          const leadParam = searchParams.get('lead') ?? ''
          const url = `/directory/api/portal/leads/activate-card${leadParam ? `?lead=${leadParam}` : ''}`

          let activated = false
          for (let attempt = 0; attempt < 3; attempt++) {
            if (attempt > 0) await new Promise((r) => setTimeout(r, 1500))
            try {
              const r = await fetch(url)
              const data = await r.json().catch(() => ({}))
              if (r.ok) {
                setSetupStatus(data.autoUnlocked ? 'unlocked' : 'card_saved')
                activated = true
                break
              }
              if (!data.retry) break
            } catch {
              break
            }
          }
          if (!activated) setSetupStatus('card_saved')
        }

        const r = await fetch('/directory/api/portal/leads', { cache: 'no-store' })
        const data = await r.json()
        setLeads(data.leads ?? [])
      } catch {
        setError('Failed to load leads')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [searchParams])

  function handleUnlocked(
    id: number,
    data: { patientName: string; patientPhone: string; patientEmail: string | null; patientAge: number | null },
  ) {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, isUnlocked: true, patientName: data.patientName, patientPhone: data.patientPhone, patientEmail: data.patientEmail, patientAge: data.patientAge }
          : l,
      ),
    )
  }

  function handleSeen(id: number) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, isNew: false } : l)))
  }

  function handleUpdated(id: number, patch: Partial<Pick<Lead, 'pipelineStatus' | 'notes' | 'ownerName'>>) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  function handlePulledToCore(id: number) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, coreSynced: true } : l)))
  }

  const highlightedLeadId = Number(searchParams.get('lead')) || null

  useEffect(() => {
    if (!highlightedLeadId || loading) return
    const el = document.getElementById(`lead-${highlightedLeadId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedLeadId, loading])

  const visibleLeads = activeTab === 'all'
    ? leads
    : leads.filter((l) => l.pipelineStatus === activeTab)

  const countFor = (tab: PipelineStatus | 'all') =>
    tab === 'all' ? leads.length : leads.filter((l) => l.pipelineStatus === tab).length

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        {setupStatus === 'activating' && (
          <p className="text-sm text-gray-500">Activating your payment method…</p>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
    )
  }

  return (
    <div className="space-y-4">
      {setupStatus === 'unlocked' && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Card saved and lead unlocked — patient details are now visible below.
        </div>
      )}

      {setupStatus === 'card_saved' && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-black">
          <CreditCard className="h-4 w-4 shrink-0" />
          Card saved successfully. Click <strong>Unlock — £{PPL_LEAD_PRICE}</strong> on any lead below to reveal patient details.
        </div>
      )}

      {/* Pipeline filter tabs */}
      {leads.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {PIPELINE_TABS.map((tab) => {
            const count = countFor(tab.value)
            if (tab.value !== 'all' && count === 0) return null
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  activeTab === tab.value
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400',
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span className={cn('ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]',
                    activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500',
                  )}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {visibleLeads.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <Inbox className="h-8 w-8 text-gray-300" />
          <div>
            {leads.length === 0 ? (
              <>
                <p className="text-sm font-medium text-gray-600">No leads yet</p>
                <p className="text-xs text-gray-500 mt-1">
                  When patients request a consultation from your profile, they will appear here.
                </p>
              </>
            ) : (
              <p className="text-sm font-medium text-gray-600">No leads in this stage</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              plan={plan}
              onUnlocked={handleUnlocked}
              onSeen={handleSeen}
              onUpdated={handleUpdated}
              onPulledToCore={() => handlePulledToCore(lead.id)}
              highlighted={lead.id === highlightedLeadId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
