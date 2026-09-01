'use client'

import { useState } from 'react'
import { GbpConnectionCard } from '@/components/portal/gbp/gbp-connection-card'
import { GbpFieldsForm } from '@/components/portal/gbp/gbp-fields-form'

export function GbpGoogleBody({ plan }: { plan: 'pay_per_lead' | 'subscription' }) {
  // Bumping the key remounts the form so it re-fetches after an import from Google.
  const [formKey, setFormKey] = useState(0)
  return (
    <div className="space-y-6">
      <GbpConnectionCard onChange={() => setFormKey((k) => k + 1)} />
      <GbpFieldsForm key={formKey} plan={plan} />
    </div>
  )
}
