export type PractitionerWorkflowStep = {
  stepLabel: string
  title: string
  body: string
}

export type PractitionerSpotlight = {
  eyebrow: string
  title: string
  body: string
  tags: string[]
}

export type PractitionerHubCopy = {
  heroFocus: string
  heroAudience: string
  spotlight: PractitionerSpotlight
  workflow: PractitionerWorkflowStep[]
}

const WF_AESTHETIC: PractitionerWorkflowStep[] = [
  {
    stepLabel: "Step 1",
    title: "Consultation",
    body: "Capture patient details, concerns, suitability, and treatment goals.",
  },
  {
    stepLabel: "Step 2",
    title: "Consent",
    body: "Generate and store treatment-specific consent forms digitally.",
  },
  {
    stepLabel: "Step 3",
    title: "Treatment Notes",
    body: "Record structured notes, products used, batch details, and areas treated.",
  },
  {
    stepLabel: "Step 4",
    title: "Aftercare",
    body: "Send aftercare instructions and post-treatment guidance automatically.",
  },
  {
    stepLabel: "Step 5",
    title: "Reactivation",
    body: "Trigger reminders, reviews, and rebooking workflows at the right time.",
  },
]

const WF_DERMA: PractitionerWorkflowStep[] = [
  {
    stepLabel: "Step 1",
    title: "Assessment",
    body: "Document skin concerns, history, contraindications, and photography baselines.",
  },
  {
    stepLabel: "Step 2",
    title: "Consent",
    body: "Capture procedure-specific consent with version control tied to each visit.",
  },
  {
    stepLabel: "Step 3",
    title: "Treatment Record",
    body: "Log findings, products, settings, and clinical observations in structured notes.",
  },
  {
    stepLabel: "Step 4",
    title: "Aftercare",
    body: "Issue aftercare plans and product guidance from the same patient record.",
  },
  {
    stepLabel: "Step 5",
    title: "Review Cycle",
    body: "Schedule follow-ups, track response, and evidence outcomes for inspections.",
  },
]

const WF_LASER: PractitionerWorkflowStep[] = [
  {
    stepLabel: "Step 1",
    title: "Consultation",
    body: "Record Fitzpatrick type, patch tests, goals, and contraindications before first treatment.",
  },
  {
    stepLabel: "Step 2",
    title: "Consent",
    body: "Store laser-specific consent with risks, cooling plans, and patient acknowledgement.",
  },
  {
    stepLabel: "Step 3",
    title: "Session Log",
    body: "Capture device, fluence, passes, and immediate skin response in one note.",
  },
  {
    stepLabel: "Step 4",
    title: "Aftercare",
    body: "Automate cooling, sun care, and escalation instructions after each session.",
  },
  {
    stepLabel: "Step 5",
    title: "Follow-Up",
    body: "Book review visits and track series completion without manual chasing.",
  },
]

const WF_HAIR_NON_SURGICAL: PractitionerWorkflowStep[] = [
  {
    stepLabel: "Step 1",
    title: "Consultation",
    body: "Map scalp findings, expectations, and programme suitability in one intake.",
  },
  {
    stepLabel: "Step 2",
    title: "Consent",
    body: "Document treatment consent and photography permissions alongside the plan.",
  },
  {
    stepLabel: "Step 3",
    title: "Session Notes",
    body: "Track each visit, products used, response, and next steps in longitudinal notes.",
  },
  {
    stepLabel: "Step 4",
    title: "Home Care",
    body: "Share aftercare and product routines without separate messaging threads.",
  },
  {
    stepLabel: "Step 5",
    title: "Progress Reviews",
    body: "Compare visits over time and trigger recall when protocols need adjustment.",
  },
]

const WF_HAIR_SURGICAL: PractitionerWorkflowStep[] = [
  {
    stepLabel: "Step 1",
    title: "Pre-Op Consultation",
    body: "Align graft plan, medications, and expectations with signed documentation.",
  },
  {
    stepLabel: "Step 2",
    title: "Consent Pack",
    body: "Bundle surgical, anaesthetic, and photography consents against the patient profile.",
  },
  {
    stepLabel: "Step 3",
    title: "Procedure Record",
    body: "Log graft counts, zones, medications, and intra-operative events in structured notes.",
  },
  {
    stepLabel: "Step 4",
    title: "Recovery Pack",
    body: "Issue post-op instructions, medications, and escalation contacts automatically.",
  },
  {
    stepLabel: "Step 5",
    title: "Aftercare Visits",
    body: "Track healing reviews, photos, and long-term density check-ins in one timeline.",
  },
]

const WF_METABOLIC: PractitionerWorkflowStep[] = [
  {
    stepLabel: "Step 1",
    title: "Clinical Intake",
    body: "Capture vitals, screening answers, and eligibility without duplicate forms.",
  },
  {
    stepLabel: "Step 2",
    title: "Consent & Counselling",
    body: "Record risks, dosing education, and shared decision-making in governed consent.",
  },
  {
    stepLabel: "Step 3",
    title: "Programme Notes",
    body: "Track titrations, side effects, and adherence alongside prescribing decisions.",
  },
  {
    stepLabel: "Step 4",
    title: "Touchpoints",
    body: "Automate check-ins, weigh-ins, and lab reminders tied to the care plan.",
  },
  {
    stepLabel: "Step 5",
    title: "Reviews",
    body: "Evidence outcomes and adjustments for regulators and multidisciplinary reviews.",
  },
]

const WF_WELLNESS: PractitionerWorkflowStep[] = [
  {
    stepLabel: "Step 1",
    title: "Discovery",
    body: "Capture goals, lifestyle context, and baseline metrics at the first visit.",
  },
  {
    stepLabel: "Step 2",
    title: "Consent",
    body: "Store service-specific consent and waivers with clear version history.",
  },
  {
    stepLabel: "Step 3",
    title: "Care Plan",
    body: "Document protocols, biomarkers, and interventions in one longitudinal record.",
  },
  {
    stepLabel: "Step 4",
    title: "Member Journey",
    body: "Coordinate reminders, content, and upsell pathways without losing context.",
  },
  {
    stepLabel: "Step 5",
    title: "Retention",
    body: "Trigger renewals, reviews, and rebooking based on attendance and outcomes.",
  },
]

const WF_DENTAL: PractitionerWorkflowStep[] = [
  {
    stepLabel: "Step 1",
    title: "Facial Consultation",
    body: "Record dental and aesthetic assessment with photography in one workflow.",
  },
  {
    stepLabel: "Step 2",
    title: "Consent",
    body: "Align facial treatment consent with dental charting and medico-legal needs.",
  },
  {
    stepLabel: "Step 3",
    title: "Treatment Notes",
    body: "Document injectable or facial procedures with product batch traceability.",
  },
  {
    stepLabel: "Step 4",
    title: "Aftercare",
    body: "Send combined dental and aesthetic aftercare without separate tools.",
  },
  {
    stepLabel: "Step 5",
    title: "Recall",
    body: "Schedule review visits that respect both dental recalls and facial treatment cycles.",
  },
]

const SPOTLIGHTS: Record<string, PractitionerSpotlight> = {
  "aesthetic-practitioner-software": {
    eyebrow: "AESTHETIC PRACTITIONERS",
    title: "Software For Independent Aesthetic Practitioners",
    body: "Run consultations, consent, treatment notes, photography, and follow-ups from one connected workspace so patients never fall through the cracks between tools.",
    tags: ["Digital consent", "Treatment notes", "Marketing templates", "Follow-up automations"],
  },
  "aesthetic-nurse-software": {
    eyebrow: "AESTHETIC NURSES",
    title: "Software For Aesthetic Nurses",
    body: "Give nursing injectors governed consent, batch-aware notes, and aftercare automation without paper trails or late-night admin.",
    tags: ["Batch records", "Consent packs", "Aftercare", "Rebooking"],
  },
  "nurse-injector-software": {
    eyebrow: "NURSE INJECTORS",
    title: "Software For Nurse Injectors",
    body: "Manage consultations, consent, treatment records, aftercare, and patient reactivation in one place. No more paper forms, scattered PDFs, or manual follow-up chasing.",
    tags: ["Digital consent", "Treatment notes", "Batch records", "Aftercare templates"],
  },
  "aesthetic-doctor-software": {
    eyebrow: "AESTHETIC DOCTORS",
    title: "Software For Aesthetic Doctors",
    body: "Support clinical documentation, patient communication, treatment history, and compliance workflows — structured and always audit-ready from one connected system.",
    tags: ["Clinical documentation", "Patient history", "Compliance records", "Structured workflows"],
  },
  "dermatologist-crm-software": {
    eyebrow: "DERMATOLOGY TEAMS",
    title: "Software For Dermatology-Led Clinics",
    body: "Keep regulated consent, imaging, prescribing context, and follow-up evidence aligned so inspections do not depend on folder archaeology.",
    tags: ["Regulated consent", "Imaging notes", "CQC-ready trails", "Multi-practitioner access"],
  },
  "skin-clinic-software": {
    eyebrow: "SKIN CLINICS",
    title: "Software For Skin Clinics",
    body: "Coordinate therapists, nurses, and doctors with shared records, consent, and programme notes that stay consistent across every room.",
    tags: ["Shared records", "Consent", "Programme notes", "Reviews"],
  },
  "laser-clinic-software": {
    eyebrow: "LASER CLINICS",
    title: "Software For Laser Clinics",
    body: "Pair laser parameters, cooling protocols, and consent artefacts with each visit so safety and evidence stay tied to the patient timeline.",
    tags: ["Session logs", "Patch tests", "Consent", "Aftercare"],
  },
  "trichologist-software": {
    eyebrow: "TRICHOLOGISTS",
    title: "Software For Trichologists",
    body: "Track scalp assessments, home protocols, and visit outcomes longitudinally without spreadsheets or disconnected photo libraries.",
    tags: ["Scalp mapping", "Progress photos", "Consent", "Recall"],
  },
  "hair-loss-clinic-software": {
    eyebrow: "HAIR LOSS CLINICS",
    title: "Software For Hair Loss Programmes",
    body: "Evidence each step of medical and aesthetic hair pathways — from first consult through maintenance — with governed consent and follow-up.",
    tags: ["Programme notes", "Consent", "Progress reviews", "Automations"],
  },
  "hair-transplant-clinic-software": {
    eyebrow: "HAIR TRANSPLANT CLINICS",
    title: "Software For Hair Transplant Teams",
    body: "Unify surgical consent, graft documentation, medications, and aftercare visits so peri-operative risk is managed in one system.",
    tags: ["Surgical consent", "Graft logs", "Medications", "Aftercare"],
  },
  "weight-loss-clinic-software": {
    eyebrow: "WEIGHT LOSS CLINICS",
    title: "Software For Medical Weight Clinics",
    body: "Structure screening, prescribing, monitoring, and touchpoints for GLP-1 and supervised weight pathways with clear audit trails.",
    tags: ["Screening", "Programme notes", "Touchpoints", "Evidence"],
  },
  "wellness-clinic-software": {
    eyebrow: "WELLNESS CLINICS",
    title: "Software For Wellness Operators",
    body: "Blend memberships, services, and clinical-lite documentation without losing the thread between marketing, consent, and care delivery.",
    tags: ["Member journeys", "Consent", "Care plans", "Automations"],
  },
  "longevity-clinic-software": {
    eyebrow: "LONGEVITY CLINICS",
    title: "Software For Longevity Practices",
    body: "Capture advanced protocols, biomarker reviews, and consent-heavy therapies with the same rigour as regulated clinical notes.",
    tags: ["Protocols", "Biomarkers", "Consent", "Reviews"],
  },
  "facial-aesthetics-dentist-software": {
    eyebrow: "DENTAL AESTHETICS",
    title: "Software For Facial Aesthetics In Dental Practices",
    body: "Bridge dental charting expectations with facial injectable workflows so consent, photography, and notes stay coherent for dual regulators.",
    tags: ["Facial consent", "Photography", "Procedure notes", "Recall"],
  },
}

const HERO: Record<string, { focus: string; audience: string }> = {
  "aesthetic-practitioner-software": { focus: "Independent Aesthetic", audience: "Practitioners" },
  "aesthetic-nurse-software": { focus: "Aesthetic Nursing", audience: "Teams" },
  "nurse-injector-software": { focus: "Nurse Injectors", audience: "Practitioners" },
  "aesthetic-doctor-software": { focus: "Aesthetic Doctors", audience: "Practitioners" },
  "dermatologist-crm-software": { focus: "Dermatology Practice", audience: "Teams" },
  "skin-clinic-software": { focus: "Skin Clinic", audience: "Teams" },
  "laser-clinic-software": { focus: "Laser Clinic", audience: "Teams" },
  "trichologist-software": { focus: "Trichology Practice", audience: "Practitioners" },
  "hair-loss-clinic-software": { focus: "Hair Loss Clinics", audience: "Teams" },
  "hair-transplant-clinic-software": { focus: "Hair Transplant Clinics", audience: "Teams" },
  "weight-loss-clinic-software": { focus: "Medical Weight Clinics", audience: "Teams" },
  "wellness-clinic-software": { focus: "Wellness Clinics", audience: "Teams" },
  "longevity-clinic-software": { focus: "Longevity Clinics", audience: "Teams" },
  "facial-aesthetics-dentist-software": { focus: "Dental Facial Aesthetics", audience: "Teams" },
}

type WorkflowKey = keyof typeof WORKFLOW_MAP

function workflowKeyForSlug(slug: string): WorkflowKey {
  if (slug === "dermatologist-crm-software" || slug === "skin-clinic-software") return "derma"
  if (slug === "laser-clinic-software") return "laser"
  if (slug === "trichologist-software" || slug === "hair-loss-clinic-software") return "hair"
  if (slug === "hair-transplant-clinic-software") return "transplant"
  if (slug === "weight-loss-clinic-software") return "metabolic"
  if (slug === "wellness-clinic-software" || slug === "longevity-clinic-software") return "wellness"
  if (slug === "facial-aesthetics-dentist-software") return "dental"
  return "aesthetic"
}

const WORKFLOW_MAP = {
  aesthetic: WF_AESTHETIC,
  derma: WF_DERMA,
  laser: WF_LASER,
  hair: WF_HAIR_NON_SURGICAL,
  transplant: WF_HAIR_SURGICAL,
  metabolic: WF_METABOLIC,
  wellness: WF_WELLNESS,
  dental: WF_DENTAL,
} as const

function defaultSpotlight(slug: string, title: string): PractitionerSpotlight {
  const short = title.replace(/\s+software$/i, "").trim()
  return {
    eyebrow: "PRACTITIONER TEAMS",
    title: `Software For ${short}`,
    body: "Consentz keeps consultations, consent, notes, and follow-ups in one governed workspace so you spend less time reconciling tools and more time with patients.",
    tags: ["Digital consent", "Structured notes", "Aftercare", "Automations"],
  }
}

export function getPractitionerHubCopy(
  slug: string,
  entryTitle: string,
  entrySummary: string
): PractitionerHubCopy {
  const hero = HERO[slug] ?? {
    focus: entryTitle.replace(/\s+software$/i, "").trim(),
    audience: "Teams",
  }
  const spotlight = SPOTLIGHTS[slug]
    ? { ...SPOTLIGHTS[slug], tags: [...SPOTLIGHTS[slug].tags] }
    : defaultSpotlight(slug, entryTitle)
  const wfKey = workflowKeyForSlug(slug)
  const workflow = [...WORKFLOW_MAP[wfKey]]
  if (entrySummary && !SPOTLIGHTS[slug]) {
    spotlight.body = entrySummary
  }
  return {
    heroFocus: hero.focus,
    heroAudience: hero.audience,
    spotlight,
    workflow,
  }
}
