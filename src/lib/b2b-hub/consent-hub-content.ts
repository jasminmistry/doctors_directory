import { toDisplayTitle } from "@/lib/b2b-hub/text"

export type ConsentStats = {
  treatmentLabel: string
  treatmentValue: string
  consentRequiredSub: string
  cqcSub: string
  signatureSub: string
}

export type ConsentPageDynamic = {
  includesHeading: string
  stats: ConsentStats
  includes: string[]
}

function slugToTreatmentPhrase(slug: string): string | null {
  const m = slug.match(/^(.+?)-(consent-form-software|aftercare-workflow-software)$/)
  if (!m) return null
  return toDisplayTitle(m[1].replace(/-/g, " "))
}

export function getConsentPageDynamic(slug: string, title: string): ConsentPageDynamic {
  const treatmentFromSlug = slugToTreatmentPhrase(slug)
  const displayTitle = toDisplayTitle(title)

  let focusForHeading = treatmentFromSlug
  if (!focusForHeading) {
    if (slug === "consent-form-software" || slug === "digital-consent-form-software") {
      focusForHeading = "Digital Consent"
    } else if (slug === "patient-consent-software") {
      focusForHeading = "Patient Consent"
    } else if (slug === "medical-consent-form-software") {
      focusForHeading = "Medical Treatments"
    } else if (slug === "aesthetic-clinic-consent-software") {
      focusForHeading = "Aesthetic Clinics"
    } else if (slug === "online-consent-forms-for-clinics") {
      focusForHeading = "Clinic Intake"
    } else {
      focusForHeading = displayTitle.replace(/\s+Software$/i, "").trim()
    }
  }

  const includesHeading = `What Consentz Includes For ${focusForHeading} Consent`

  const treatmentValue = treatmentFromSlug ?? "All Treatment Types"

  const stats: ConsentStats = {
    treatmentLabel: "Treatment",
    treatmentValue,
    consentRequiredSub: "Before every\ntreatment",
    cqcSub: "Mandatory\nrecord",
    signatureSub: "Digital,\nany device",
  }

  const isAftercare = slug.includes("aftercare-workflow")
  const includes = treatmentFromSlug
    ? [
        isAftercare
          ? `${treatmentFromSlug}-specific aftercare sequences linked to each consent record`
          : `Pre-built ${treatmentFromSlug} consent form template`,
        "Digital patient signature on any device",
        "Consent stored against patient record",
        "CQC audit trail automatically generated",
        "Automated follow-up after treatment",
        "Aftercare instructions sent automatically",
      ]
    : [
        "Pre-built consent form templates for common treatments",
        "Digital patient signature on any device",
        "Consent stored against patient record",
        "CQC audit trail automatically generated",
        "Automated follow-up after treatment",
        "Aftercare instructions sent automatically",
      ]

  return { includesHeading, stats, includes }
}

export const CONSENT_FLOW_STEPS = [
  { n: 1, label: "Appointment Booked" },
  { n: 2, label: "Consent Sent Via SMS" },
  { n: 3, label: "Patient Signs Digitally" },
  { n: 4, label: "Treatment Takes Place" },
  { n: 5, label: "Form Stored In Record" },
  { n: 6, label: "Aftercare Sent Automatically" },
] as const
