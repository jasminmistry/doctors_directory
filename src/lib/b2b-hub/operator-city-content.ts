import { sanitizeDisplayText } from "@/lib/utils"
import type { City } from "@/lib/types"
import type { CityMarketStats } from "@/lib/b2b-hub/city-page-stats"
import { toDisplayTitle } from "@/lib/b2b-hub/text"

export type OperatorCitySection = {
  title: string
  intro?: string
  bullets: string[]
}

function splitField(value: string | null | undefined): string[] {
  const text = sanitizeDisplayText(String(value ?? "").trim())
  if (!text) return []
  return text
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const sentence =
        part.charAt(0).toUpperCase() + part.slice(1)
      return sentence.endsWith(".") ? sentence : `${sentence}.`
    })
}

function operatorizeBullet(text: string, city: string): string {
  const base = sanitizeDisplayText(text)
  if (/patient|consumer|you /i.test(base)) {
    return base
      .replace(/\byou\b/gi, "your clinic")
      .replace(/\bpatients\b/gi, "patient demand")
      .replace(/\bpatient\b/gi, "patient")
  }
  if (/clinic|market|competition|operator/i.test(base)) {
    return base
  }
  return `In ${city}, operators should note: ${base.charAt(0).toLowerCase()}${base.slice(1)}`
}

export function buildOperatorCitySections(
  cityData: City,
  stats: CityMarketStats
): OperatorCitySection[] {
  const city = cityData.City
  const sections: OperatorCitySection[] = []

  const marketBullets = [
    ...splitField(cityData.beauty_spend_indicators_market_maturity_level),
    ...splitField(cityData.market_size_indicators_estimated_private_aesthetic_market_strength),
  ].map((b) => operatorizeBullet(b, city))

  if (marketBullets.length > 0) {
    sections.push({
      title: toDisplayTitle("Local aesthetics market"),
      intro: `Directory data shows ${stats.clinicCount} clinic(s), ${stats.practitionerCount} linked practitioners, and roughly ${cityData.market_size_indicators_review_volume_total} public reviews (average ${cityData.market_size_indicators_average_rating_citywide}). Use this as commercial context, not consumer marketing copy.`,
      bullets: marketBullets,
    })
  }

  const infraBullets = splitField(
    cityData.city_overview_medical_infrastructure_presence
  ).map((b) => operatorizeBullet(b, city))

  if (infraBullets.length > 0) {
    sections.push({
      title: toDisplayTitle("Healthcare infrastructure"),
      intro: `How local NHS and private infrastructure shapes referrals, escalation paths, and the compliance burden for aesthetic clinics in ${city}.`,
      bullets: infraBullets,
    })
  }

  const accessBullets = [
    ...splitField(cityData.accessibility_factors_public_transport_proximity),
    ...splitField(cityData.accessibility_factors_parking_availability),
    ...splitField(cityData.accessibility_factors_city_centre_vs_suburban_distribution),
    ...splitField(cityData.medical_tourism_potential_airport_proximity),
  ].map((b) => operatorizeBullet(b, city))

  if (accessBullets.length > 0) {
    sections.push({
      title: toDisplayTitle("Access and clinic distribution"),
      intro: `Operational factors that affect no-show risk, consultation scheduling, and how aggressively you should invest in online booking and reminders in ${city}.`,
      bullets: accessBullets,
    })
  }

  const regulatoryBullets = [
    ...splitField(cityData.regulatory_environment_primary_regulator),
    ...splitField(cityData.regulatory_environment_inspection_framework),
    ...splitField(cityData.regulatory_environment_prescribing_requirements),
  ].map((b) => operatorizeBullet(b, city))

  if (regulatoryBullets.length > 0) {
    sections.push({
      title: toDisplayTitle("Regulatory and compliance context"),
      intro: `What clinic leaders in ${city} should plan for when choosing consent, CRM, and evidence workflows.`,
      bullets: regulatoryBullets,
    })
  }

  const topTreatments = [stats.topTreatment, stats.secondTreatment].filter(Boolean)
  if (topTreatments.length > 0) {
    sections.push({
      title: toDisplayTitle("Treatment mix signal"),
      intro: `Highest-volume treatment categories locally help prioritise consent templates, aftercare automation, and practitioner scheduling.`,
      bullets: topTreatments.map(
        (t) =>
          `${t} appears frequently among ${city} clinics. Align intake, consent, and recall journeys to this demand.`
      ),
    })
  }

  return sections
}
