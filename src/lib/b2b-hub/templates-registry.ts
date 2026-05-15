export type TemplateCategory =
  | "consent"
  | "intake"
  | "aftercare"
  | "cqc-policies"
  | "sop"
  | "risk-assessment"
  | "treatment-record"
  | "marketing"
  | "business"
  | "hr"
  | "pricing"

export type TemplateEntry = {
  category: TemplateCategory
  slug: string
  title: string
  summary: string
  treatmentLabel?: string
}

export const TEMPLATE_CATEGORY_LABEL: Record<TemplateCategory, string> = {
  consent: "Consent Form Templates",
  intake: "Intake & Medical History Templates",
  aftercare: "Aftercare Templates",
  "cqc-policies": "CQC Policy Templates",
  sop: "SOP & Procedure Templates",
  "risk-assessment": "Risk Assessment Templates",
  "treatment-record": "Treatment Record Templates",
  marketing: "Marketing & Email Templates",
  business: "Business & Admin Templates",
  hr: "Staff & HR Templates",
  pricing: "Pricing & Quote Templates",
}

function consentEntries(): TemplateEntry[] {
  const items: [string, string][] = [
    ["botox", "Botox"],
    ["dermal-filler", "Dermal Filler"],
    ["lip-filler", "Lip Filler"],
    ["facial", "Facial Treatment"],
    ["laser-hair-removal", "Laser Hair Removal"],
    ["microneedling", "Microneedling"],
    ["chemical-peel", "Chemical Peel"],
    ["hydrafacial", "Hydrafacial"],
    ["skin-booster", "Skin Booster"],
    ["profhilo", "Profhilo"],
    ["polynucleotide", "Polynucleotide"],
    ["prp", "PRP"],
    ["fat-dissolving", "Fat Dissolving"],
    ["hifu", "HIFU"],
    ["morpheus8", "Morpheus8"],
    ["sculptra", "Sculptra"],
    ["kybella", "Kybella"],
    ["pdo-thread-lift", "PDO Thread Lift"],
    ["mesotherapy", "Mesotherapy"],
    ["ipl", "IPL"],
    ["microblading", "Microblading"],
    ["lash-extension", "Lash Extension"],
    ["tattoo-removal", "Tattoo Removal"],
    ["cryolipolysis", "Cryolipolysis"],
    ["aesthetic-treatment", "Generic Aesthetic Treatment"],
    ["model", "Model (Training)"],
    ["photography", "Photography / Before-After"],
    ["minor", "Minor / Under 18"],
  ]
  return items.map(([key, label]) => ({
    category: "consent" as const,
    slug: key === "facial" ? "facial-consent-form-template" : `${key}-consent-form-template`,
    title: `${label} Consent Form Template`,
    summary: `Free ${label.toLowerCase()} consent form template for UK aesthetic clinics — download and use with your governance workflow.`,
    treatmentLabel: label,
  }))
}

function intakeEntries(): TemplateEntry[] {
  const slugs: [string, string][] = [
    ["new-client-intake-form-template", "New Client Intake Form Template"],
    ["patient-information-form-template", "Patient Information Form Template"],
    ["medical-history-form-template", "Medical History Form Template"],
    ["aesthetic-clinic-intake-form-template", "Aesthetic Clinic Intake Form Template"],
    ["med-spa-intake-form-template", "Med Spa Intake Form Template"],
    ["esthetician-intake-form-template", "Esthetician Client Intake Form Template"],
    ["skin-consultation-form-template", "Skin Consultation Form Template"],
    ["allergy-contraindication-screening-template", "Allergy & Contraindication Screening Template"],
    ["pre-treatment-questionnaire-template", "Pre-Treatment Questionnaire Template"],
    ["patient-registration-form-template", "Patient Registration Form Template"],
    ["cosmetic-consultation-form-template", "Cosmetic Consultation Form Template"],
    ["fitzpatrick-skin-type-assessment-template", "Skin Type / Fitzpatrick Assessment Template"],
    ["pregnancy-screening-template", "Pregnancy & Breastfeeding Screening Template"],
    ["gp-referral-form-template", "GP Referral Form Template"],
    ["mental-health-screening-template", "Mental Health Screening Template (BDD)"],
    ["treatment-goals-questionnaire-template", "Treatment Goals Questionnaire Template"],
    ["insurance-information-template", "Insurance / Payer Information Template"],
    ["wellness-clinic-intake-form-template", "Wellness Clinic Intake Form Template"],
  ]
  return slugs.map(([slug, title]) => ({
    category: "intake" as const,
    slug,
    title,
    summary: `Free ${title.replace(/ Template$/i, "").toLowerCase()} for clinic intake and patient onboarding.`,
  }))
}

function aftercareEntries(): TemplateEntry[] {
  const items: [string, string][] = [
    ["botox", "Botox"],
    ["dermal-filler", "Dermal Filler"],
    ["lip-filler", "Lip Filler"],
    ["laser-hair-removal", "Laser Hair Removal"],
    ["microneedling", "Microneedling"],
    ["chemical-peel", "Chemical Peel"],
    ["hydrafacial", "Hydrafacial"],
    ["prp", "PRP"],
    ["profhilo", "Profhilo"],
    ["skin-booster", "Skin Booster"],
    ["hifu", "HIFU"],
    ["morpheus8", "Morpheus8"],
    ["fat-dissolving", "Fat Dissolving"],
    ["pdo-thread-lift", "PDO Thread Lift"],
    ["polynucleotide", "Polynucleotide"],
    ["ipl", "IPL"],
    ["mesotherapy", "Mesotherapy"],
    ["microblading", "Microblading"],
    ["lash-extension", "Lash Extension"],
    ["tattoo-removal", "Tattoo Removal"],
    ["post-treatment-email-templates", "Post-Treatment Email Templates (Bundle)"],
    ["aftercare-sms-templates", "24-Hour / 48-Hour Aftercare SMS Templates"],
  ]
  return items.map(([key, label]) => {
    const isBundle = key.includes("templates") || key.includes("sms")
    const slug = isBundle ? key : `${key}-aftercare-template`
    return {
      category: "aftercare" as const,
      slug,
      title: isBundle ? label : `${label} Aftercare Instructions Template`,
      summary: `Free aftercare template for ${label.toLowerCase()} — give patients clear post-treatment guidance.`,
      treatmentLabel: isBundle ? undefined : label,
    }
  })
}

function simpleEntries(
  category: TemplateCategory,
  pairs: [string, string][],
  summaryFn: (title: string) => string
): TemplateEntry[] {
  return pairs.map(([slug, title]) => ({
    category,
    slug,
    title,
    summary: summaryFn(title),
  }))
}

const cqcPolicies = simpleEntries(
  "cqc-policies",
  [
    ["safeguarding-policy-template", "Safeguarding Policy Template"],
    ["infection-control-policy-template", "Infection Prevention & Control Policy Template"],
    ["medicines-management-policy-template", "Medicines Management Policy Template"],
    ["consent-policy-template", "Consent Policy Template"],
    ["complaints-handling-policy-template", "Complaints Handling Policy Template"],
    ["health-and-safety-policy-template", "Health & Safety Policy Template"],
    ["data-protection-policy-template", "Confidentiality & Data Protection Policy Template"],
    ["equality-and-diversity-policy-template", "Equality & Diversity Policy Template"],
    ["whistleblowing-policy-template", "Whistleblowing Policy Template"],
    ["duty-of-candour-policy-template", "Duty of Candour Policy Template"],
    ["mental-capacity-act-policy-template", "Mental Capacity Act Policy Template"],
    ["sharps-needlestick-policy-template", "Sharps & Needlestick Injury Policy Template"],
    ["sepsis-policy-template", "Sepsis Management Policy Template"],
    ["anaphylaxis-policy-template", "Anaphylaxis Management Policy Template"],
    ["resuscitation-policy-template", "Resuscitation Policy Template"],
    ["lone-working-policy-template", "Lone Working Policy Template"],
    ["adverse-event-reporting-policy-template", "Adverse Event Reporting Policy Template"],
    ["chaperone-policy-template", "Chaperone Policy Template"],
    ["dbs-recruitment-policy-template", "DBS / Recruitment Policy Template"],
    ["staff-induction-policy-template", "Staff Induction Policy Template"],
    ["cpd-policy-template", "Continuing Professional Development Policy Template"],
    ["records-management-policy-template", "Records Management Policy Template"],
    ["clinical-governance-policy-template", "Clinical Governance Policy Template"],
    ["information-governance-policy-template", "Information Governance Policy Template"],
    ["gdpr-policy-template", "GDPR Policy Template (UK)"],
    ["equipment-maintenance-policy-template", "Equipment Maintenance Policy Template"],
    ["fire-safety-policy-template", "Fire Safety Policy Template"],
    ["clinical-waste-policy-template", "Waste Disposal Policy Template (Clinical)"],
    ["hand-hygiene-policy-template", "Hand Hygiene Policy Template"],
    ["cold-chain-policy-template", "Cold Chain / Vaccine Storage Policy Template"],
    ["patient-identification-policy-template", "Patient Identification Policy Template"],
    ["vulnerable-adults-policy-template", "Vulnerable Adults Policy Template"],
    ["bullying-harassment-policy-template", "Bullying & Harassment Policy Template"],
    ["social-media-policy-template", "Social Media Policy Template (Clinic Staff)"],
    ["cqc-notification-policy-template", "CQC Notification Policy Template"],
  ],
  (t) => `Free ${t.replace(/ Template$/i, "").toLowerCase()} for CQC-registered clinics.`
)

const sop = simpleEntries(
  "sop",
  [
    ["botox-sop-template", "Botox / Neurotoxin SOP Template"],
    ["dermal-filler-sop-template", "Dermal Filler SOP Template"],
    ["hyaluronidase-sop-template", "Hyaluronidase / Filler Dissolving SOP Template"],
    ["prp-sop-template", "PRP SOP Template"],
    ["microneedling-sop-template", "Microneedling SOP Template"],
    ["chemical-peel-sop-template", "Chemical Peel SOP Template"],
    ["laser-sop-template", "Laser Treatment SOP Template"],
    ["pdo-thread-lift-sop-template", "PDO Thread Lift SOP Template"],
    ["fat-dissolving-sop-template", "Fat Dissolving SOP Template"],
    ["anaphylaxis-sop-template", "Anaphylaxis Response SOP Template"],
    ["vascular-occlusion-sop-template", "Vascular Occlusion Emergency SOP Template"],
    ["consultation-sop-template", "Patient Consultation SOP Template"],
    ["cleaning-sop-template", "Clinic Cleaning SOP Template"],
    ["sterilisation-sop-template", "Equipment Sterilisation SOP Template"],
    ["sharps-disposal-sop-template", "Sharps Disposal SOP Template"],
    ["drug-storage-sop-template", "Drug Storage SOP Template"],
    ["emergency-response-sop-template", "Emergency Response SOP Template"],
    ["patient-discharge-sop-template", "Patient Discharge SOP Template"],
    ["complaint-resolution-sop-template", "Complaint Resolution SOP Template"],
    ["aesthetic-clinic-sop-bundle", "Complete Aesthetic Clinic SOP Bundle"],
  ],
  (t) => `Standard operating procedure template: ${t.replace(/ Template$/i, "")}.`
)

export const TEMPLATE_ENTRIES: TemplateEntry[] = [
  ...consentEntries(),
  ...intakeEntries(),
  ...aftercareEntries(),
  ...cqcPolicies,
  ...sop,
]

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "consent",
  "intake",
  "aftercare",
  "cqc-policies",
  "sop",
  "risk-assessment",
  "treatment-record",
  "marketing",
  "business",
  "hr",
  "pricing",
]

export function isTemplateCategory(value: string): value is TemplateCategory {
  return (TEMPLATE_CATEGORIES as readonly string[]).includes(value)
}

export function getTemplateEntry(
  category: TemplateCategory,
  slug: string
): TemplateEntry | undefined {
  return TEMPLATE_ENTRIES.find((e) => e.category === category && e.slug === slug)
}

export function templatesByCategory(category: TemplateCategory): TemplateEntry[] {
  return TEMPLATE_ENTRIES.filter((e) => e.category === category)
}

export function relatedTemplateEntries(
  category: TemplateCategory,
  slug: string,
  count = 9
): TemplateEntry[] {
  const same = TEMPLATE_ENTRIES.filter(
    (e) => e.category === category && e.slug !== slug
  )
  const rest = TEMPLATE_ENTRIES.filter((e) => e.category !== category)
  return [...same, ...rest].slice(0, count)
}

export function templatePageHref(entry: Pick<TemplateEntry, "category" | "slug">) {
  return `/business/templates/${entry.category}/${entry.slug}/`
}
