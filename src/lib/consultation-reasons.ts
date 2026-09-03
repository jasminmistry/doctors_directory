/**
 * "Reason for contact" options shown on the simplified enquiry form that
 * unclaimed clinics receive. Stored as a canonical string in
 * `ConsultationLead.contactReason`; the human label is also written into
 * `treatment` so existing portal / email / Core-sync rendering works unchanged.
 *
 * NOTE: this list is a placeholder — the final set of reasons is still being
 * agreed. Add entries here; no migration is needed (the column is a free string).
 */

export interface ContactReason {
  value: string
  label: string
}

export const CONTACT_REASONS: ContactReason[] = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'consultation_24h', label: 'Consultation within 24 hours' },
  { value: 'pricing', label: 'Pricing enquiry' },
  { value: 'general', label: 'General enquiry' },
]

const BY_VALUE = new Map(CONTACT_REASONS.map((r) => [r.value, r]))

export function isValidContactReason(value: unknown): value is string {
  return typeof value === 'string' && BY_VALUE.has(value)
}

/** Human label for a stored reason value; falls back to the raw value. */
export function contactReasonLabel(value: string): string {
  return BY_VALUE.get(value)?.label ?? value
}
