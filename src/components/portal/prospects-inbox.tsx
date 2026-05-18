'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, Inbox, CheckCircle, CreditCard } from 'lucide-react'
import { LeadCard, type Lead } from '@/components/portal/lead-card'

interface ProspectsInboxProps {
  plan: 'free' | 'pay_per_lead' | 'subscription'
}

type SetupStatus = 'idle' | 'activating' | 'unlocked' | 'card_saved' | 'failed'

export function ProspectsInbox({ plan }: ProspectsInboxProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [setupStatus, setSetupStatus] = useState<SetupStatus>('idle')
  const searchParams = useSearchParams()

  useEffect(() => {
    async function load() {
      try {
        const setupDone = searchParams.get('setup') === 'done'

        if (setupDone) {
          setSetupStatus('activating')
          const leadParam = searchParams.get('lead') ?? ''
          const url = `/directory/api/portal/leads/activate-card${leadParam ? `?lead=${leadParam}` : ''}`

          // Retry up to 3× in case Stripe hasn't attached the payment method yet
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
    data: { patientName: string; patientPhone: string; patientEmail: string | null },
  ) {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, isUnlocked: true, patientName: data.patientName, patientPhone: data.patientPhone, patientEmail: data.patientEmail }
          : l,
      ),
    )
  }

  function handleSeen(id: number) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, isNew: false } : l)))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        {setupStatus === 'activating' && (
          <p className="text-sm text-gray-500">Activating your payment method…</p>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
    )
  }

  return (
    <div className="space-y-4">
      {setupStatus === 'unlocked' && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Card saved and lead unlocked — patient details are now visible below.
        </div>
      )}

      {setupStatus === 'card_saved' && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <CreditCard className="h-4 w-4 shrink-0" />
          Card saved successfully. Click <strong>Unlock — £15</strong> on any lead below to reveal patient details.
        </div>
      )}

      {leads.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <Inbox className="h-8 w-8 text-gray-300" />
          <div>
            <p className="text-sm font-medium text-gray-600">No leads yet</p>
            <p className="text-xs text-gray-400 mt-1">
              When patients request a consultation from your profile, they will appear here.
            </p>
          </div>
        </div>
      ) : (
        <>
          {leads.filter((l) => l.isNew).length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                New — {leads.filter((l) => l.isNew).length}
              </h2>
              <div className="space-y-3">
                {leads.filter((l) => l.isNew).map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    plan={plan}
                    onUnlocked={handleUnlocked}
                    onSeen={handleSeen}
                  />
                ))}
              </div>
            </section>
          )}

          {leads.filter((l) => !l.isNew).length > 0 && (
            <section>
              {leads.filter((l) => l.isNew).length > 0 && (
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Earlier
                </h2>
              )}
              <div className="space-y-3">
                {leads.filter((l) => !l.isNew).map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    plan={plan}
                    onUnlocked={handleUnlocked}
                    onSeen={handleSeen}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
