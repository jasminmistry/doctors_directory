import type { TemplateEntry } from "@/lib/b2b-hub/templates-registry"
import { TEMPLATE_CATEGORY_LABEL } from "@/lib/b2b-hub/templates-registry"

export type TemplatePageContent = {
  includes: string[]
  whyNeed: string
  whatToInclude: string[]
  digitalPitch: string
}

export function getTemplatePageContent(entry: TemplateEntry): TemplatePageContent {
  const subject = entry.treatmentLabel ?? entry.title.replace(/ Template$/i, "")
  const lower = subject.toLowerCase()
  const categoryLabel = TEMPLATE_CATEGORY_LABEL[entry.category]

  const includes =
    entry.category === "consent"
      ? [
          "Treatment-specific risks and benefits section",
          "Alternative options and no-treatment pathway",
          "Aftercare expectations and complication signs",
          "Patient declaration and signature block",
          "Practitioner details and batch/product fields where relevant",
          "Photography consent addendum where applicable",
        ]
      : entry.category === "aftercare"
        ? [
            "Immediate post-treatment do's and don'ts",
            "Activity restrictions and sun exposure guidance",
            "When to contact the clinic urgently",
            "Follow-up appointment prompts",
            "Product use and hygiene instructions",
            "Emergency contact details",
          ]
        : entry.category === "intake"
          ? [
              "Patient demographics and contact details",
              "Medical history and current medications",
              "Allergies and contraindications screening",
              "Previous aesthetic treatments",
              "Consent for data processing",
              "Signature and date fields",
            ]
          : [
              "Clinic-branded header and version control",
              "Roles and responsibilities",
              "Step-by-step procedure or policy clauses",
              "Evidence and record-keeping requirements",
              "Review date and sign-off section",
              "CQC mapping notes where relevant",
            ]

  return {
    includes,
    whyNeed: `Clinics need a governed ${lower} workflow that patients understand and inspectors can trace. A structured ${categoryLabel.toLowerCase()} reduces variance between practitioners, supports CQC evidence, and keeps your team aligned when volume grows.`,
    whatToInclude: [
      `Clear scope: what the ${lower} template covers and what it does not`,
      "Plain-language risks written for patients, not lawyers",
      "Space for practitioner competency and product batch details",
      "Version number and date so you know which form was signed",
      "Digital signature fields if you move to Consentz",
      "Internal notes on when to re-consent or refresh the form",
    ],
    digitalPitch:
      "Download the PDF to get started today — then move the same workflow into Consentz to send, sign, store, and audit automatically without retyping patient details.",
  }
}
