"use client"

import { useEffect } from "react"

import { attributionParams, trackOnce } from "@/lib/analytics/track"

/**
 * Fires the GA4 `sign_up` key event once per session (keyed by `dedupeKey`, the
 * Stripe session id — so a page refresh doesn't re-count it). Used on the
 * paid-plan checkout-success page; those claimants complete via Stripe and never
 * pass through the wizard's "pending" step where the free-plan `sign_up` fires,
 * so the two paths stay mutually exclusive.
 */
export function SignUpConversion({
  dedupeKey,
  plan,
  entityType,
}: Readonly<{ dedupeKey: string; plan?: string | null; entityType?: string | null }>) {
  useEffect(() => {
    trackOnce(`sign_up:${dedupeKey}`, "sign_up", {
      plan: plan ?? undefined,
      entity_type: entityType ?? undefined,
      ...attributionParams(),
    })
  }, [dedupeKey, plan, entityType])

  return null
}
