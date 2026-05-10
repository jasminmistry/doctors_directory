'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const PLAN_LABELS: Record<string, string> = {
  pay_per_lead: 'Pay-Per-Lead',
  subscription: 'Subscription',
}

export default function UpgradeSuccessPage() {
  const params = useSearchParams()
  const plan = params.get('plan') ?? ''

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Upgrade successful!</h1>
        <p className="text-gray-500 text-sm">
          You're now on the <strong>{PLAN_LABELS[plan] ?? plan}</strong> plan. Your profile has been updated.
        </p>
        <Link
          href="/portal/practitioner"
          className="inline-block mt-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
