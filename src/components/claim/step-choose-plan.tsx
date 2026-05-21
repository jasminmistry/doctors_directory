'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type Plan = 'free' | 'pay_per_lead' | 'subscription'

interface Props {
  claimId: number
  entitySlug: string
  onPending: () => void
}

const PLANS: {
  id: Plan
  name: string
  price: string
  priceNote: string
  description: string
  features: string[]
  badge?: string
}[] = [
  {
    id: 'free',
    name: 'Free Listing',
    price: '£0',
    priceNote: 'forever',
    description: 'Get your profile live with no commitment.',
    features: [
      'Standard directory listing',
      'Basic clinic profile',
      'Visible in search',
      'No lead access',
      'No Verified badge',
    ],
  },
  {
    id: 'subscription',
    name: 'Verified Subscription',
    price: '£99',
    priceNote: '/mo',
    description: 'Priority visibility with unlimited instant leads.',
    badge: 'Recommended',
    features: [
      'Priority + Verified badge',
      'Unlimited instant leads',
      'Full calendar sync',
      'Verified Patient reviews',
      'Full SSO + CRM sync',
    ],
  },
  {
    id: 'pay_per_lead',
    name: 'Pay-Per-Lead',
    price: '£15',
    priceNote: '/lead',
    description: 'Pay only for the leads you receive.',
    features: [
      'Standard listing',
      'Blurred leads — pay to unlock',
      'Manual lead requests',
      'Basic reviews',
      'Lite account (20% off w/ Core sub)',
    ],
  },
]

export function StepChoosePlan({ claimId, entitySlug, onPending }: Readonly<Props>) {
  const [selected, setSelected] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleContinue() {
    if (!selected) return
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/directory/api/claim/select-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, plan: selected }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Something went wrong. Please try again.')
        return
      }
      if (data.redirect) {
        window.location.href = data.redirect
      } else {
        onPending()
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Choose your plan</h2>
        <p className="text-sm text-muted-foreground">
          You can upgrade or change plan at any time from your dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => setSelected(plan.id)}
            className={cn(
              'relative text-left rounded-xl border-2 p-4 transition-all cursor-pointer',
              selected === plan.id
                ? 'border-foreground bg-muted/50'
                : 'border-border hover:border-muted-foreground/50'
            )}
          >
            {plan.badge && (
              <Badge className="absolute top-3 right-3 text-xs">{plan.badge}</Badge>
            )}
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  selected === plan.id ? 'border-foreground bg-foreground' : 'border-muted-foreground'
                )}
              >
                {selected === plan.id && <Check className="h-3 w-3 text-background" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="font-semibold">{plan.name}</span>
                  <span className="text-sm font-medium">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">{plan.priceNote}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                <ul className="space-y-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3 w-3 shrink-0 text-emerald-600" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleContinue} disabled={!selected || loading} className="w-full">
        {loading ? 'Processing…' : selected === 'free' ? 'Claim for free' : 'Continue to payment'}
      </Button>
    </div>
  )
}
