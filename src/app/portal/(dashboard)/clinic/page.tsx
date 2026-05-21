'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ClinicForm } from '@/components/admin/forms/ClinicForm'

export const dynamic = 'force-dynamic'

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  pay_per_lead: 'Pay-Per-Lead',
  subscription: 'Subscription',
}

interface SubscriptionInfo {
  plan: string | null
  stripeSubscriptionId: string | null
  approvedAt: string | null
}

export default function PortalClinicPage() {
  const [idVerified, setIdVerified] = useState<boolean | null>(null)
  const [entitySlug, setEntitySlug] = useState<string | null>(null)
  const [verificationChecked, setVerificationChecked] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)

  useEffect(() => {
    fetch('/directory/api/portal/clinic')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return
        setIdVerified(data.idVerified ?? false)
        setEntitySlug(data.slug ?? null)
        setSubscription(data.subscription ?? null)
      })
      .catch(() => {})
      .finally(() => setVerificationChecked(true))
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Subscription */}
      {subscription && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Subscription</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Plan</p>
              <p className="text-sm font-semibold text-gray-900">
                {PLAN_LABELS[subscription.plan ?? ''] ?? subscription.plan ?? '—'}
              </p>
            </div>
            {subscription.approvedAt && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Active since</p>
                <p className="text-sm font-semibold text-gray-900">
                  {format(new Date(subscription.approvedAt), 'd MMM yyyy')}
                </p>
              </div>
            )}
            {subscription.stripeSubscriptionId && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Billing</p>
                <p className="text-sm font-semibold text-gray-900">Monthly</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ID Verification */}
      {idVerified === false && entitySlug && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Identity Verification</h2>
          <p className="text-sm text-gray-600 mb-4">
            Verify your identity to display an &ldquo;ID Verified&rdquo; badge on your clinic profile, building trust with potential patients.
          </p>
          <a
            href={`/directory/verify/clinic/${entitySlug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            Get ID Verified
          </a>
        </div>
      )}

      {/* Profile editor — only mount once verification status is known */}
      {verificationChecked && (
        <ClinicForm
          fetchUrl="/directory/api/portal/clinic"
          saveUrl="/directory/api/portal/clinic"
          mode="portal"
          disabled={idVerified !== true}
          onSaved={() => {}}
        />
      )}
    </div>
  )
}
