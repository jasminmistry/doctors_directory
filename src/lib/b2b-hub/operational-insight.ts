import type { City } from "@/lib/types"
import type { CityMarketStats } from "@/lib/b2b-hub/city-page-stats"
import type { TreatmentPageType } from "@/lib/b2b-hub/scaled-pages-shared"
import { toDisplayTitle } from "@/lib/b2b-hub/text"

export type OperationalInsight = {
  title: string
  points: string[]
}

function competitionLine(clinicCount: number, city: string): string {
  if (clinicCount >= 40) {
    return `${city} is a competitive market (${clinicCount} clinics in our directory). Fast lead response, clear pricing, and differentiated consent workflows matter for conversion.`
  }
  if (clinicCount >= 15) {
    return `${city} has moderate clinic density (${clinicCount} listings). Operators can win share with stronger follow-up, recall automation, and transparent treatment records.`
  }
  return `${city} shows lighter clinic density (${clinicCount} listings), a chance to dominate local search and referrals if your CRM and consent stack are disciplined.`
}

export function buildCityOperationalInsight(
  cityTitle: string,
  stats: CityMarketStats,
  cityData?: City | null
): OperationalInsight {
  const points: string[] = [
    competitionLine(stats.clinicCount, cityTitle),
  ]

  const reviews = cityData?.market_size_indicators_review_volume_total ?? 0
  if (reviews >= 200) {
    points.push(
      `High review volume (~${reviews}) suggests patients compare providers actively. Monitor reputation, respond to enquiries quickly, and document outcomes consistently.`
    )
  } else if (reviews > 0) {
    points.push(
      `With ~${reviews} public reviews locally, even a small improvement in response time and aftercare communication can shift perceived trust.`
    )
  }

  points.push(
    `Top local treatments (${stats.topTreatment}, ${stats.secondTreatment}) should drive which consent packs, stock checks, and practitioner rotas you standardise first.`
  )

  if (stats.practitionerCount > stats.clinicCount * 2) {
    points.push(
      "Practitioner-heavy footprint implies multi-chair scheduling and per-practitioner competency records. Avoid one shared login for all injectors."
    )
  }

  points.push(
    "Recommended stack: digital consent tied to the patient record, automated booking reminders, and a single audit trail for complaints, incidents, and policy versions."
  )

  const maturity = cityData?.beauty_spend_indicators_market_maturity_level
  if (maturity) {
    points.push(
      `Market maturity signal: plan marketing and retention spend against local demand patterns rather than generic national campaigns.`
    )
  }

  return {
    title: toDisplayTitle(`Operational insight for ${cityTitle} clinics`),
    points: points.slice(0, 6),
  }
}

const TYPE_OPERATOR_FOCUS: Record<TreatmentPageType, string> = {
  "consent-workflows":
    "Prioritise treatment-specific consent templates, witness rules, and photo documentation stored on the patient record.",
  "automation-workflows":
    "Map reminders, recalls, and post-treatment check-ins to this treatment’s risk profile and typical revisit interval.",
  "clinic-management-software":
    "Align diary, inventory, and practitioner permissions so high-volume treatment days do not break compliance routines.",
  workflows:
    "Standardise end-to-end pathways (intake → consent → treatment → aftercare) so locum and multi-site teams execute the same steps.",
}

export function buildTreatmentOperationalInsight(
  treatmentLabel: string,
  pageType: TreatmentPageType
): OperationalInsight {
  return {
    title: toDisplayTitle(`Operational insight for ${treatmentLabel}`),
    points: [
      `${treatmentLabel} pages attract high-intent operators. Lead with clarity on consent evidence, pricing transparency, and follow-up SLAs.`,
      TYPE_OPERATOR_FOCUS[pageType],
      "Use segmented lists and automation so enquiries do not sit in generic inboxes while practitioners are in clinic.",
      "Track complications, outcomes, and policy reviews in one system to support CQC-style inspections and insurer questions.",
      "Pair this treatment hub with city-local pages when you operate in multiple locations. Local competition changes acceptable response times.",
    ],
  }
}
