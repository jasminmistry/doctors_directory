'use client'

import { useCallback, useEffect, useState } from 'react'
import { PractitionerForm } from '@/components/admin/forms/PractitionerForm'
import { CommercialPanel, type SubscriptionInfo } from '@/components/portal/CommercialPanel'
import { PPL_LEAD_PRICE, SUBSCRIPTION_MONTHLY_PRICE } from '@/lib/pricing'

export const dynamic = 'force-dynamic'

const PLAN_ORDER: Record<string, number> = { free: 0, pay_per_lead: 1, subscription: 2 }

const UPGRADEABLE_PLANS: { key: string; label: string; description: string }[] = [
  { key: 'pay_per_lead', label: `Pay-Per-Lead — £${PPL_LEAD_PRICE}/mo`, description: 'Priority listing + Verified badge' },
  { key: 'subscription', label: `Subscription — £${SUBSCRIPTION_MONTHLY_PRICE}/mo`, description: 'Unlimited leads at £0 each' },
]

export default function PortalPractitionerPage() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [idVerified, setIdVerified] = useState<boolean | null>(null)
  const [entitySlug, setEntitySlug] = useState<string | null>(null)
  const [verificationChecked, setVerificationChecked] = useState(false)

  const fetchPractitionerData = useCallback(() => {
    setVerificationChecked(false)
    fetch('/directory/api/portal/practitioner/')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return
        setSubscription(data.subscription ?? null)
        setIdVerified(data.idVerified ?? false)
        setEntitySlug(data.slug ?? null)
      })
      .catch(() => {})
      .finally(() => setVerificationChecked(true))
  }, [])

  useEffect(() => { fetchPractitionerData() }, [fetchPractitionerData])

  async function handleUpgrade(plan: string) {
    setUpgrading(plan)
    try {
      const res = await fetch('/directory/api/portal/upgrade/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error ?? 'Upgrade failed'); return }
      if (data.redirect) {
        window.location.href = data.redirect
      } else if (data.upgraded) {
        setSubscription((prev) => prev ? { ...prev, plan } : prev)
      }
    } finally {
      setUpgrading(null)
    }
  }

  return (
    <div className="px-4 py-8 space-y-6">
      {/* Commercial panel */}
      {subscription && (
        <CommercialPanel subscription={subscription} entityType="practitioner" onChanged={fetchPractitionerData} />
      )}

      {/* Upgrade options */}
      {subscription && subscription.stripeStatus !== 'cancel_at_period_end' && (() => {
        const currentRank = PLAN_ORDER[subscription.plan ?? 'free'] ?? 0
        const options = UPGRADEABLE_PLANS.filter((p) => PLAN_ORDER[p.key] > currentRank)
        if (!options.length) return null
        return (
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Upgrade plan</p>
            <div className="flex flex-col sm:flex-row gap-2">
              {options.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleUpgrade(opt.key)}
                  disabled={upgrading === opt.key}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-left hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {upgrading === opt.key ? 'Redirecting…' : opt.label}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>
        )
      })()}

      {/* ID Verification */}
      {idVerified === false && entitySlug && (
        <div className="rounded-lg border border-[#e4dccf] bg-[#f2eee5] p-6">
          <h2 className="text-xs font-medium text-[#000000] uppercase tracking-[0.2em] mb-3">Identity Verification</h2>
          <p className="text-sm text-gray-600 mb-4">
            Verify your identity to display an &ldquo;ID Verified&rdquo; badge on your profile, building trust with potential patients.
          </p>
          <a
            href={`/directory/verify/practitioner/${entitySlug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            Get ID Verified
          </a>
        </div>
      )}

      {/* Profile editor — only mount once verification status is known */}
      {verificationChecked && (
        <PractitionerForm
          fetchUrl="/directory/api/portal/practitioner/"
          saveUrl="/directory/api/portal/practitioner/"
          mode="portal"
          disabled={idVerified !== true}
          onSaved={fetchPractitionerData}
        />
      )}
    </div>
  )
}
