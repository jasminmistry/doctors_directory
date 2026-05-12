import { COMPETITOR_ORDER, COMPETITOR_LABEL } from "./competitors"

export type HubSegment =
  | "software"
  | "compare"
  | "migrate"
  | "pricing"
  | "alternatives"
  | "cqc"
  | "consent"
  | "automation"
  | "templates"
  | "practitioners"

export type HubEntry = {
  slug: string
  title: string
  segment: HubSegment
  summary?: string
}

type PartialEntry = Omit<HubEntry, "segment">

function withSegment(
  segment: HubSegment,
  items: PartialEntry[]
): HubEntry[] {
  return items.map((i) => ({ ...i, segment }))
}

const softwareEntries = withSegment("software", [
  {
    slug: "consent-and-booking-software",
    title: "Consent & booking software for clinics",
    summary:
      "Bring consent, booking, and payments into one patient journey instead of duct-taped tools.",
  },
  {
    slug: "aesthetic-clinic-software",
    title: "Aesthetic clinic software",
    summary:
      "Operate high-volume aesthetic clinics with safer paperwork and clearer operational visibility.",
  },
  {
    slug: "med-spa-software",
    title: "Med spa software",
    summary:
      "Run med spas with consistent intake, treatments, and compliance evidence.",
  },
  {
    slug: "hair-clinic-software",
    title: "Hair clinic software",
    summary:
      "Support hair restoration journeys with structured consent and follow-up.",
  },
  {
    slug: "skin-clinic-software",
    title: "Skin clinic software",
    summary:
      "Coordinate dermatology and skin treatments with audit-ready records.",
  },
  {
    slug: "laser-clinic-software",
    title: "Laser clinic software",
    summary:
      "Reduce laser treatment risk with clear consent capture and aftercare workflows.",
  },
  {
    slug: "weight-loss-clinic-software",
    title: "Weight loss clinic software",
    summary:
      "Standardise GLP-1 and weight management programmes with safer documentation.",
  },
  {
    slug: "wellness-clinic-software",
    title: "Wellness clinic software",
    summary:
      "Offer wellness programmes without operational chaos or fragile spreadsheets.",
  },
  {
    slug: "longevity-clinic-software",
    title: "Longevity clinic software",
    summary:
      "Support advanced therapies with structured consent and longitudinal records.",
  },
  {
    slug: "dental-aesthetic-clinic-software",
    title: "Dental aesthetic clinic software",
    summary:
      "Align facial aesthetic dentistry with intake, consent, and recall workflows.",
  },
  {
    slug: "clinic-crm-software",
    title: "Clinic CRM software",
    summary:
      "Replace generic CRMs with a clinic-native operating layer for patients and revenue.",
  },
  {
    slug: "clinic-marketing-software",
    title: "Clinic marketing software",
    summary:
      "Turn campaigns into booked appointments with measurable intake and consent.",
  },
  {
    slug: "clinic-reputation-software",
    title: "Clinic reputation software",
    summary:
      "Protect brand trust by fixing the operational gaps that cause poor reviews.",
  },
  {
    slug: "two-way-patient-messaging-software",
    title: "Two-way patient messaging software",
    summary:
      "Keep conversations in one thread linked to treatment context and consent.",
  },
  {
    slug: "whatsapp-for-clinics-software",
    title: "WhatsApp for clinics software",
    summary:
      "Move WhatsApp traffic into governed workflows instead of informal chats.",
  },
  {
    slug: "sms-marketing-for-clinics-software",
    title: "SMS marketing for clinics software",
    summary:
      "Send compliant SMS campaigns that convert without breaking clinical governance.",
  },
  {
    slug: "email-marketing-for-clinics-software",
    title: "Email marketing for clinics software",
    summary:
      "Automate nurture and recall without losing consent and clinical context.",
  },
  {
    slug: "clinic-loyalty-software",
    title: "Clinic loyalty software",
    summary:
      "Increase repeat visits with programmes tied to real booking and spend data.",
  },
  {
    slug: "clinic-referral-software",
    title: "Clinic referral software",
    summary:
      "Track referrers and reward programmes without spreadsheet drift.",
  },
  {
    slug: "clinic-gift-cards-software",
    title: "Clinic gift cards software",
    summary:
      "Sell and redeem gift experiences without breaking operational workflows.",
  },
  {
    slug: "clinic-pos-software",
    title: "Clinic POS software",
    summary:
      "Take payments in-clinic with pricing and packages aligned to treatments.",
  },
  {
    slug: "clinic-invoicing-software",
    title: "Clinic invoicing software",
    summary:
      "Invoice accurately with treatment-linked documentation and fewer disputes.",
  },
  {
    slug: "clinic-subscriptions-software",
    title: "Clinic subscriptions software",
    summary:
      "Run memberships and programmes with predictable billing and retention.",
  },
  {
    slug: "clinic-inventory-software",
    title: "Clinic inventory software",
    summary:
      "Track consumables and retail without operational blind spots.",
  },
  {
    slug: "clinic-reporting-software",
    title: "Clinic reporting software",
    summary:
      "See performance by practitioner, treatment, and channel in one place.",
  },
  {
    slug: "multi-location-clinic-software",
    title: "Multi-location clinic software",
    summary:
      "Standardise operations across sites without losing local nuance.",
  },
  {
    slug: "franchise-clinic-software",
    title: "Franchise clinic software",
    summary:
      "Give franchise partners one playbook with consistent governance.",
  },
  {
    slug: "white-label-clinic-software",
    title: "White-label clinic software",
    summary:
      "Deliver a branded patient experience under your operational standards.",
  },
  {
    slug: "api-first-clinic-software",
    title: "API-first clinic software",
    summary:
      "Integrate booking, consent, and CRM without brittle point-to-point glue.",
  },
])

const cqcEntries = withSegment("cqc", [
  {
    slug: "cqc-ready-clinic-software",
    title: "CQC-ready clinic software",
    summary:
      "Reduce inspection anxiety with evidence you can produce quickly and consistently.",
  },
  {
    slug: "cqc-compliance-software-for-clinics",
    title: "CQC compliance software for clinics",
    summary:
      "Turn scattered processes into demonstrable compliance routines.",
  },
  {
    slug: "cqc-evidence-software",
    title: "CQC evidence software",
    summary:
      "Capture proof of safe care as part of normal operations.",
  },
  {
    slug: "cqc-record-keeping-software",
    title: "CQC record keeping software",
    summary:
      "Keep records structured, retrievable, and aligned to what inspectors ask for.",
  },
  {
    slug: "cqc-governance-software",
    title: "CQC governance software",
    summary:
      "Make governance operational instead of a quarterly paperwork scramble.",
  },
  {
    slug: "cqc-audit-trail-software",
    title: "CQC audit trail software",
    summary:
      "Show who did what, when, and why across consent and care pathways.",
  },
  {
    slug: "cqc-outcomes-monitoring-software",
    title: "CQC outcomes monitoring software",
    summary:
      "Track outcomes and incidents without manual reconciliation.",
  },
  {
    slug: "cqc-staff-training-evidence-software",
    title: "CQC staff training evidence software",
    summary:
      "Demonstrate competence and training coverage without folder archaeology.",
  },
  {
    slug: "cqc-patient-safety-software",
    title: "CQC patient safety software",
    summary:
      "Make safety practices visible and repeatable across teams.",
  },
  {
    slug: "cqc-medicines-management-software",
    title: "CQC medicines management software",
    summary:
      "Support prescribing and administration workflows with clearer oversight.",
  },
  {
    slug: "cqc-infection-prevention-software",
    title: "CQC infection prevention software",
    summary:
      "Document protocols and incidents with traceable follow-up.",
  },
  {
    slug: "cqc-privacy-and-security-software",
    title: "CQC privacy & security software",
    summary:
      "Align consent, access controls, and records handling with regulatory expectations.",
  },
  {
    slug: "cqc-digital-transformation-software",
    title: "CQC digital transformation software",
    summary:
      "Modernise care delivery without creating new compliance gaps.",
  },
  {
    slug: "cqc-inspection-readiness-software",
    title: "CQC inspection readiness software",
    summary:
      "Run continuous readiness instead of last-minute evidence hunts.",
  },
])

const consentEntries = withSegment("consent", [
  {
    slug: "consent-form-software",
    title: "Consent form software",
    summary:
      "Replace paper packs with digital consent that fits clinical workflows.",
  },
  {
    slug: "digital-consent-form-software",
    title: "Digital consent form software",
    summary:
      "Capture signatures and versions without losing context between systems.",
  },
  {
    slug: "aesthetic-clinic-consent-software",
    title: "Aesthetic clinic consent software",
    summary:
      "Standardise consent across treatments and practitioners.",
  },
  {
    slug: "medical-consent-form-software",
    title: "Medical consent form software",
    summary:
      "Support complex procedures with structured disclosure and documentation.",
  },
  {
    slug: "patient-consent-software",
    title: "Patient consent software",
    summary:
      "Give patients clarity while teams retain governed records.",
  },
  {
    slug: "online-consent-forms-for-clinics",
    title: "Online consent forms for clinics",
    summary:
      "Send secure links that reduce no-shows and front-desk bottlenecks.",
  },
  {
    slug: "botox-consent-form-software",
    title: "Botox consent form software",
    summary:
      "Capture botulinum toxin consent with treatment-specific detail.",
  },
  {
    slug: "dermal-filler-consent-form-software",
    title: "Dermal filler consent form software",
    summary:
      "Document filler risks, alternatives, and aftercare consistently.",
  },
  {
    slug: "lip-filler-consent-form-software",
    title: "Lip filler consent form software",
    summary:
      "Reduce variance across practitioners for high-risk lip treatments.",
  },
  {
    slug: "skin-booster-consent-form-software",
    title: "Skin booster consent form software",
    summary:
      "Align booster protocols with clear patient understanding.",
  },
  {
    slug: "polynucleotide-consent-form-software",
    title: "Polynucleotide consent form software",
    summary:
      "Support emerging modalities with appropriate disclosure templates.",
  },
  {
    slug: "profhilo-consent-form-software",
    title: "Profhilo consent form software",
    summary:
      "Standardise Profhilo consent across pricing and package bundles.",
  },
  {
    slug: "prp-consent-form-software",
    title: "PRP consent form software",
    summary:
      "Document PRP pathways with traceable patient acknowledgement.",
  },
  {
    slug: "laser-hair-removal-consent-form-software",
    title: "Laser hair removal consent form software",
    summary:
      "Capture laser-specific risks and contraindications reliably.",
  },
  {
    slug: "microneedling-consent-form-software",
    title: "Microneedling consent form software",
    summary:
      "Reduce consent drift for devices and practitioner variance.",
  },
  {
    slug: "chemical-peel-consent-form-software",
    title: "Chemical peel consent form software",
    summary:
      "Match peel depth and downtime messaging to each patient.",
  },
  {
    slug: "fat-dissolving-consent-form-software",
    title: "Fat dissolving consent form software",
    summary:
      "Document expectations and aftercare for injectable fat reduction.",
  },
  {
    slug: "hifu-consent-form-software",
    title: "HIFU consent form software",
    summary:
      "Support device-led tightening treatments with clear disclosure.",
  },
  {
    slug: "morpheus8-consent-form-software",
    title: "Morpheus8 consent form software",
    summary:
      "Combine RF microneedling consent with treatment planning context.",
  },
  {
    slug: "botox-aftercare-workflow-software",
    title: "Botox aftercare workflow software",
    summary:
      "Automate aftercare messaging linked to the consent record.",
  },
  {
    slug: "filler-aftercare-workflow-software",
    title: "Filler aftercare workflow software",
    summary:
      "Reduce complications through structured follow-up prompts.",
  },
  {
    slug: "laser-aftercare-workflow-software",
    title: "Laser aftercare workflow software",
    summary:
      "Send laser-specific aftercare without manual chasing.",
  },
])

const automationEntries = withSegment("automation", [
  {
    slug: "clinic-automation-software",
    title: "Clinic automation software",
    summary:
      "Automate repetitive clinic work without losing clinical governance.",
  },
  {
    slug: "aesthetic-clinic-automation-software",
    title: "Aesthetic clinic automation software",
    summary:
      "Scale bookings and treatments without adding admin headcount.",
  },
  {
    slug: "patient-journey-automation-software",
    title: "Patient journey automation software",
    summary:
      "Orchestrate intake, consent, treatment, and recall as one journey.",
  },
  {
    slug: "med-spa-automation-software",
    title: "Med spa automation software",
    summary:
      "Keep med spas fast-moving with consistent operational guardrails.",
  },
  {
    slug: "hair-clinic-automation-software",
    title: "Hair clinic automation software",
    summary:
      "Automate long programmes without losing patient context.",
  },
  {
    slug: "skin-clinic-automation-software",
    title: "Skin clinic automation software",
    summary:
      "Reduce manual follow-ups across dermatology pathways.",
  },
  {
    slug: "laser-clinic-automation-software",
    title: "Laser clinic automation software",
    summary:
      "Automate laser-specific reminders and aftercare safely.",
  },
  {
    slug: "weight-loss-clinic-automation-software",
    title: "Weight loss clinic automation software",
    summary:
      "Support medication programmes with structured monitoring prompts.",
  },
  {
    slug: "wellness-clinic-automation-software",
    title: "Wellness clinic automation software",
    summary:
      "Automate programmes without generic marketing chaos.",
  },
  {
    slug: "longevity-clinic-automation-software",
    title: "Longevity clinic automation software",
    summary:
      "Coordinate advanced therapies with longitudinal automation.",
  },
  {
    slug: "dental-aesthetic-clinic-automation-software",
    title: "Dental aesthetic clinic automation software",
    summary:
      "Align cosmetic dentistry workflows with recall and consent automation.",
  },
  {
    slug: "clinic-marketing-automation-software",
    title: "Clinic marketing automation software",
    summary:
      "Turn campaigns into measurable bookings with governed messaging.",
  },
  {
    slug: "clinic-reactivation-automation-software",
    title: "Clinic reactivation automation software",
    summary:
      "Bring dormant patients back using ethical, contextual outreach.",
  },
])

const templatesEntries = withSegment("templates", [
  {
    slug: "how-to-automate-an-aesthetic-clinic",
    title: "How to automate an aesthetic clinic",
    summary:
      "A practical framing for automation priorities and pitfalls.",
  },
  {
    slug: "how-to-automate-patient-reactivation",
    title: "How to automate patient reactivation",
    summary:
      "Reactivation that respects consent and clinical boundaries.",
  },
  {
    slug: "how-to-automate-consent-form-follow-up",
    title: "How to automate consent form follow-up",
    summary:
      "Close the gap between consent capture and treatment readiness.",
  },
  {
    slug: "how-to-automate-no-show-recovery",
    title: "How to automate no-show recovery",
    summary:
      "Recover revenue without aggressive messaging that damages trust.",
  },
  {
    slug: "how-to-automate-cqc-compliance-evidence",
    title: "How to automate CQC compliance evidence",
    summary:
      "Make evidence collection continuous instead of reactive.",
  },
  {
    slug: "how-to-automate-treatment-launches",
    title: "How to automate treatment launches",
    summary:
      "Launch new services with consistent intake and consent.",
  },
  {
    slug: "how-to-automate-aftercare-messages",
    title: "How to automate aftercare messages",
    summary:
      "Deliver aftercare that matches treatment context automatically.",
  },
])

const practitionersEntries = withSegment("practitioners", [
  {
    slug: "aesthetic-practitioner-software",
    title: "Aesthetic practitioner software",
    summary:
      "Give practitioners tools that match how aesthetic clinics actually run.",
  },
  {
    slug: "aesthetic-nurse-software",
    title: "Aesthetic nurse software",
    summary:
      "Support nurse injectors with structured consent and scheduling.",
  },
  {
    slug: "nurse-injector-software",
    title: "Nurse injector software",
    summary:
      "Reduce admin drag for high-volume injectors.",
  },
  {
    slug: "aesthetic-doctor-software",
    title: "Aesthetic doctor software",
    summary:
      "Align medical leadership with operational visibility.",
  },
  {
    slug: "dermatologist-crm-software",
    title: "Dermatologist CRM software",
    summary:
      "Move beyond generic CRM to dermatology-native workflows.",
  },
  {
    slug: "skin-clinic-software",
    title: "Skin clinic software",
    summary:
      "Coordinate skin treatments with governed records.",
  },
  {
    slug: "laser-clinic-software",
    title: "Laser clinic software",
    summary:
      "Support laser teams with safer consent and follow-up.",
  },
  {
    slug: "trichologist-software",
    title: "Trichologist software",
    summary:
      "Structure hair and scalp pathways without spreadsheet sprawl.",
  },
  {
    slug: "hair-loss-clinic-software",
    title: "Hair loss clinic software",
    summary:
      "Run programmes with clear consent and longitudinal tracking.",
  },
  {
    slug: "hair-transplant-clinic-software",
    title: "Hair transplant clinic software",
    summary:
      "Coordinate surgical hair pathways with complex consent needs.",
  },
  {
    slug: "weight-loss-clinic-software",
    title: "Weight loss clinic software",
    summary:
      "Support GLP-1 and medical weight pathways responsibly.",
  },
  {
    slug: "wellness-clinic-software",
    title: "Wellness clinic software",
    summary:
      "Operate wellness services without operational leakage.",
  },
  {
    slug: "longevity-clinic-software",
    title: "Longevity clinic software",
    summary:
      "Support advanced therapies with structured governance.",
  },
  {
    slug: "facial-aesthetics-dentist-software",
    title: "Facial aesthetics dentist software",
    summary:
      "Align facial aesthetics within dental practice operations.",
  },
])

function buildCompareMigratePricing(): HubEntry[] {
  const out: HubEntry[] = []
  for (const comp of COMPETITOR_ORDER) {
    const label = COMPETITOR_LABEL[comp] ?? comp
    out.push({
      segment: "compare",
      slug: `consentz-vs-${comp}`,
      title: `Consentz vs ${label}`,
      summary: `How Consentz compares to ${label} for clinic operations.`,
    })
    out.push({
      segment: "migrate",
      slug: `from-${comp}`,
      title: `Migrate from ${label}`,
      summary: `Plan a migration away from ${label} without breaking the clinic.`,
    })
    out.push({
      segment: "pricing",
      slug: `${comp}-pricing-alternative`,
      title: `${label} pricing alternative`,
      summary: `Evaluate pricing trade-offs versus ${label} for growing clinics.`,
    })
  }
  return out
}

function buildCompetitorAlternativesADEF() {
  const alternatives: HubEntry[] = []
  const cqcCompetitor: HubEntry[] = []
  const consentCompetitor: HubEntry[] = []
  const automationCompetitor: HubEntry[] = []
  for (const comp of COMPETITOR_ORDER) {
    const label = COMPETITOR_LABEL[comp] ?? comp
    alternatives.push({
      segment: "alternatives",
      slug: comp,
      title: `${label} alternative`,
      summary: `How clinics evaluate Consentz against ${label} for operations, compliance, and growth.`,
    })
    cqcCompetitor.push({
      segment: "cqc",
      slug: `${comp}-cqc-compliance-alternative`,
      title: `${label} CQC compliance alternative`,
      summary: `CQC compliance and evidence workflows compared with ${label}.`,
    })
    consentCompetitor.push({
      segment: "consent",
      slug: `${comp}-consent-form-alternative`,
      title: `${label} consent form alternative`,
      summary: `Consent capture and record-keeping relative to ${label}.`,
    })
    automationCompetitor.push({
      segment: "automation",
      slug: `${comp}-automation-alternative`,
      title: `${label} automation alternative`,
      summary: `Patient journeys and automation capabilities versus ${label}.`,
    })
  }
  return {
    alternatives,
    cqcCompetitor,
    consentCompetitor,
    automationCompetitor,
  }
}

const competitorPdfAdEf = buildCompetitorAlternativesADEF()

export const HUB_ENTRIES: HubEntry[] = [
  ...softwareEntries,
  ...buildCompareMigratePricing(),
  ...competitorPdfAdEf.alternatives,
  ...cqcEntries,
  ...competitorPdfAdEf.cqcCompetitor,
  ...consentEntries,
  ...competitorPdfAdEf.consentCompetitor,
  ...automationEntries,
  ...competitorPdfAdEf.automationCompetitor,
  ...templatesEntries,
  ...practitionersEntries,
]

export function getHubEntry(
  segment: HubSegment,
  slug: string
): HubEntry | undefined {
  return HUB_ENTRIES.find(
    (e) => e.segment === segment && e.slug === slug
  )
}

export const HUB_ENTRIES_BY_SEGMENT = HUB_ENTRIES.reduce(
  (acc, e) => {
    if (!acc[e.segment]) acc[e.segment] = []
    acc[e.segment].push(e)
    return acc
  },
  {} as Record<HubSegment, HubEntry[]>
)

export const HUB_SEGMENTS: HubSegment[] = [
  "software",
  "compare",
  "migrate",
  "pricing",
  "alternatives",
  "cqc",
  "consent",
  "automation",
  "templates",
  "practitioners",
]

export function isHubSegment(value: string): value is HubSegment {
  return (HUB_SEGMENTS as readonly string[]).includes(value)
}

export function segmentLabel(segment: HubSegment): string {
  const labels: Record<HubSegment, string> = {
    software: "Software",
    compare: "Compare",
    migrate: "Migrate",
    pricing: "Pricing",
    alternatives: "Alternatives",
    cqc: "CQC",
    consent: "Consent",
    automation: "Automation",
    templates: "Templates",
    practitioners: "Practitioners",
  }
  return labels[segment]
}

export function relatedEntriesFor(
  segment: HubSegment,
  slug: string,
  count = 9
): HubEntry[] {
  const pool = HUB_ENTRIES.filter(
    (e) => !(e.segment === segment && e.slug === slug)
  )
  const sameFirst = pool.filter((e) => e.segment === segment)
  const rest = pool.filter((e) => e.segment !== segment)
  return [...sameFirst, ...rest].slice(0, count)
}
