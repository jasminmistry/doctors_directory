// Central source of truth for all platform pricing and commission rates.
// Import from here — never hardcode these values elsewhere.

/** Monthly subscription price charged to clinics (£) */
export const SUBSCRIPTION_MONTHLY_PRICE = 99

/** Monthly subscription price in pence, for Stripe amount/unit_amount fields */
export const SUBSCRIPTION_MONTHLY_PRICE_PENCE = SUBSCRIPTION_MONTHLY_PRICE * 100

/** Pay-per-lead unlock price per lead (£) */
export const PPL_LEAD_PRICE = 55

/** Pay-per-lead unlock price in pence, for Stripe amount/unit_amount fields */
export const PPL_LEAD_PRICE_PENCE = PPL_LEAD_PRICE * 100

/**
 * Commission rates on teleconsult booking deposits, inclusive of Stripe processing.
 * pay_per_lead clinics: 18%  →  clinic keeps 82%
 * subscription clinics:  5%  →  clinic keeps 95%
 * free clinics:          0%  →  teleconsult payments not available on free plan
 */
export const COMMISSION_RATE: Record<string, number> = {
  pay_per_lead: 0.18,
  subscription: 0.05,
}

/** Returns the commission rate for a given plan (0 if plan has no commission). */
export function commissionRate(plan: string | null | undefined): number {
  return COMMISSION_RATE[plan ?? ''] ?? 0
}

/** Human-readable percentage label for a plan's commission rate. */
export function commissionPct(plan: string | null | undefined): number {
  return Math.round(commissionRate(plan) * 100)
}

/** Fraction the clinic keeps after commission (e.g. 0.82 for PPL). */
export function clinicNetRate(plan: string | null | undefined): number {
  return 1 - commissionRate(plan)
}
