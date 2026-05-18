'use client'

import { useEffect, useState } from 'react'
import { ClinicForm } from '@/components/admin/forms/ClinicForm'

export const dynamic = 'force-dynamic'

export default function PortalClinicPage() {
  const [idVerified, setIdVerified] = useState<boolean | null>(null)
  const [entitySlug, setEntitySlug] = useState<string | null>(null)

  useEffect(() => {
    fetch('/directory/api/portal/clinic')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return
        setIdVerified(data.idVerified ?? false)
        setEntitySlug(data.slug ?? null)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
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

      {/* Profile editor */}
      <ClinicForm
        fetchUrl="/directory/api/portal/clinic"
        saveUrl="/directory/api/portal/clinic"
        mode="portal"
        disabled={idVerified !== true}
        onSaved={() => {}}
      />
    </div>
  )
}
