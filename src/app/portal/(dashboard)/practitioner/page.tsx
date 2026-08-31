'use client'

import { useCallback, useEffect, useState } from 'react'
import { PractitionerForm } from '@/components/admin/forms/PractitionerForm'
import { DangerZonePanel } from '@/components/portal/danger-zone-panel'
import { PPL_LEAD_PRICE, SUBSCRIPTION_MONTHLY_PRICE } from '@/lib/pricing'
import { CommercialPanel, type SubscriptionInfo } from '@/components/portal/CommercialPanel'

export const dynamic = 'force-dynamic'

export default function PortalPractitionerPage() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [idVerified, setIdVerified] = useState<boolean | null>(null)
  const [entitySlug, setEntitySlug] = useState<string | null>(null)
  const [entityName, setEntityName] = useState<string | null>(null)
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
        setEntityName(data.displayName ?? data.slug ?? null)
      })
      .catch(() => {})
      .finally(() => setVerificationChecked(true))
  }, [])

  useEffect(() => { fetchPractitionerData() }, [fetchPractitionerData])

  return (
    <div className="px-4 py-8 space-y-6">
      {/* Commercial panel */}
      {subscription && (
        <CommercialPanel subscription={subscription} entityType="practitioner" onChanged={fetchPractitionerData} />
      )}

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

      {/* Delete profile */}
      {entityName && <DangerZonePanel entityType="practitioner" entityName={entityName} plan={subscription?.plan} />}
    </div>
  )
}
