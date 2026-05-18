'use client'

import { useEffect, useState } from 'react'
import { PractitionerForm } from '@/components/admin/forms/PractitionerForm'

export const dynamic = 'force-dynamic'

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  pay_per_lead: 'Pay-Per-Lead £15/mo',
  subscription: 'Subscription £99/mo',
}

const PLAN_ORDER: Record<string, number> = { free: 0, pay_per_lead: 1, subscription: 2 }

const UPGRADEABLE_PLANS: { key: string; label: string; description: string }[] = [
  { key: 'pay_per_lead', label: 'Pay-Per-Lead — £15/mo', description: 'Priority listing + Verified badge' },
  { key: 'subscription', label: 'Subscription — £99/mo', description: 'Unlimited leads at £0 each' },
]

interface SubscriptionInfo {
  plan: string | null
  stripeSubscriptionId: string | null
  approvedAt: string | null
}

export default function PortalPractitionerPage() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [profileUrl, setProfileUrl] = useState<string | null>(null)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [idVerified, setIdVerified] = useState<boolean | null>(null)
  const [entitySlug, setEntitySlug] = useState<string | null>(null)

  useEffect(() => {
    fetch('/directory/api/portal/practitioner')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return
        setSubscription(data.subscription ?? null)
        setIdVerified(data.idVerified ?? false)
        setEntitySlug(data.slug ?? null)
        if (data.citySlug && data.slug) {
          setProfileUrl(`/${data.citySlug}/practitioner/${data.slug}/`)
        }
      })
      .catch(() => {})
  }, [])

  async function handleUpgrade(plan: string) {
    setUpgrading(plan)
    try {
      const res = await fetch('/directory/api/portal/upgrade', {
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
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Subscription card */}
      {subscription && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Subscription</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Plan</p>
              <p className="font-semibold text-gray-900">
                {PLAN_LABELS[subscription.plan ?? ''] ?? subscription.plan ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Status</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Active
              </span>
            </div>
            {subscription.approvedAt && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Member since</p>
                <p className="text-sm text-gray-700">
                  {new Date(subscription.approvedAt).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>
            )}
            {subscription.stripeSubscriptionId && (
              <div className="col-span-2 sm:col-span-3">
                <p className="text-xs text-gray-400 mb-0.5">Subscription ID</p>
                <p className="text-xs text-gray-500 font-mono">{subscription.stripeSubscriptionId}</p>
              </div>
            )}
          </div>

          {/* Upgrade options */}
          {(() => {
            const currentRank = PLAN_ORDER[subscription.plan ?? 'free'] ?? 0
            const options = UPGRADEABLE_PLANS.filter((p) => PLAN_ORDER[p.key] > currentRank)
            if (!options.length) return null
            return (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Upgrade plan</p>
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
                      <p className="text-xs text-gray-400 mt-0.5">{opt.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* ID Verification */}
      {idVerified === false && entitySlug && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Identity Verification</h2>
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

      {/* Profile editor */}
      <PractitionerForm
        fetchUrl="/directory/api/portal/practitioner"
        saveUrl="/directory/api/portal/practitioner"
        mode="portal"
        disabled={idVerified !== true}
        onSaved={() => {}}
        previewHref={profileUrl ?? undefined}
      />
    </div>
  )
}
