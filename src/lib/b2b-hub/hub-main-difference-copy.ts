export const CONSENTZ_MAIN_DIFFERENCE_BULLETS = [
  "Modern platform built for UK aesthetic clinics with governed consent, bookings, and compliance in one stack.",
  "Marketing and clinical workflows share one patient record so teams are not reconciling exports between tools.",
  "Designed for independent clinic growth with CQC-ready evidence and automation without losing clinical control.",
  "Intuitive front-desk and practitioner flows that reduce manual admin between visits.",
] as const

export function competitorMainDifferenceBullets(competitorLabel: string): readonly string[] {
  return [
    `Booking and scheduling are often the headline strength for platforms like ${competitorLabel}.`,
    "Consent and regulated evidence may depend on add-ons, exports, or tools that sit outside the core record.",
    "Marketing and patient comms can live outside the governed clinical workflow the front desk relies on.",
    "Teams may still bridge spreadsheets, PDFs, and manual handoffs between treatment and follow-up.",
  ]
}
