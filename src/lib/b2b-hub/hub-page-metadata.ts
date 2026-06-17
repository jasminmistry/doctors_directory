import type { Metadata } from "next"
import type { HubEntry, HubSegment } from "@/lib/b2b-hub/registry"
import { getCityRegulator, type UkRegulator } from "@/lib/b2b-hub/city-regulator"
import { COMPETITOR_LABEL } from "@/lib/b2b-hub/competitors"
import { segmentLabel } from "@/lib/b2b-hub/registry"
import { b2bBaseUrl, b2bOgImageUrl, toCurrentSiteUrl } from "@/lib/b2b-hub/seo"
import type { TemplateCategory } from "@/lib/b2b-hub/templates-registry"
import { TEMPLATE_CATEGORY_LABEL } from "@/lib/b2b-hub/templates-registry"

const BRAND = "Consentz"
const RATING = "4.9★ Rated"
const CRM_TOOLS = "CRM, Consent & CQC Tools"

const OG_IMAGE = "/images/Consentz Logo.webp"
const TITLE_SEP = " - "

function joinTitle(...parts: string[]) {
  return parts.join(TITLE_SEP)
}

function trimTitle(value: string, max = 60) {
  const normalized = value.replace(/\s*\|\s*/g, TITLE_SEP)
  if (normalized.length <= max) return normalized
  return `${normalized.slice(0, max - 1).trim()}…`
}

function competitorLabelFromSlug(slug: string) {
  const vs = slug.match(/^consentz-vs-(.+)$/)
  if (vs) return COMPETITOR_LABEL[vs[1]] ?? vs[1]
  const from = slug.match(/^from-(.+)$/)
  if (from) return COMPETITOR_LABEL[from[1]] ?? from[1]
  const pricing = slug.match(/^(.+)-pricing-alternative$/)
  if (pricing) return COMPETITOR_LABEL[pricing[1]] ?? pricing[1]
  const alt = COMPETITOR_LABEL[slug]
  if (alt) return alt
  const cqc = slug.match(/^(.+)-cqc-compliance-alternative$/)
  if (cqc) return COMPETITOR_LABEL[cqc[1]] ?? cqc[1]
  const consent = slug.match(/^(.+)-consent-form-alternative$/)
  if (consent) return COMPETITOR_LABEL[consent[1]] ?? consent[1]
  const automation = slug.match(/^(.+)-automation-alternative$/)
  if (automation) return COMPETITOR_LABEL[automation[1]] ?? automation[1]
  return null
}

function freeTemplateTitle(title: string) {
  return title.match(/^free\s/i) ? title : `Free ${title}`
}

export function hubDetailMetaTitle(segment: HubSegment, entry: HubEntry): string {
  const rival = competitorLabelFromSlug(entry.slug)

  switch (segment) {
    case "software":
      return trimTitle(joinTitle(entry.title, CRM_TOOLS))
    case "compare":
      return trimTitle(
        joinTitle(`${rival ?? "Competitor"} vs Consentz`, "Which Is Better for Clinics?")
      )
    case "migrate":
      return trimTitle(joinTitle(`Migrate from ${rival ?? entry.title}`, "Clinic Software Guide"))
    case "pricing":
      return trimTitle(joinTitle(`${rival ?? entry.title} Pricing vs Consentz`, "Compare Plans"))
    case "alternatives":
      return trimTitle(joinTitle(`Best ${rival ?? entry.title} Alternative for Aesthetic Clinics`))
    case "cqc":
      if (rival) {
        return trimTitle(joinTitle(`Best ${rival} CQC Alternative`, "Checklist & Tools"))
      }
      return trimTitle(joinTitle("CQC Compliance for UK Aesthetic Clinics", "Checklist & Tools"))
    case "consent":
      if (rival) {
        return trimTitle(joinTitle(`Best ${rival} Consent Form Alternative`))
      }
      return trimTitle(joinTitle(entry.title, "Digital Forms for Aesthetic Clinics"))
    case "automation":
      if (entry.slug.endsWith("-automation-alternative") && rival) {
        return trimTitle(joinTitle(`Best ${rival} Automation Alternative`))
      }
      return trimTitle(joinTitle(entry.title, "Clinic Automation Guide"))
    case "practitioners":
      return trimTitle(joinTitle(entry.title, "Built for Aesthetic Practitioners"))
    default:
      return trimTitle(joinTitle(entry.title, BRAND))
  }
}

export function hubDetailMetaDescription(segment: HubSegment, entry: HubEntry): string {
  const summary = entry.summary ?? entry.title
  const rival = competitorLabelFromSlug(entry.slug)

  switch (segment) {
    case "software":
      return `${summary} ${RATING} — consent, CQC evidence, booking and automation in one platform.`
    case "compare":
      return `Compare ${rival ?? "competitors"} vs Consentz for aesthetic clinics: consent, CQC, pricing and automation. See which platform fits your team.`
    case "migrate":
      return `Plan your move from ${rival ?? "legacy software"} without losing patients or compliance evidence. ${RATING} ${BRAND} migration playbook.`
    case "pricing":
      return `Compare ${rival ?? "competitor"} pricing with ${BRAND} for growing aesthetic clinics. ${RATING} — transparent plans, fewer hidden add-ons.`
    case "alternatives":
      return `Best ${rival ?? "clinic software"} alternative for aesthetic clinics: consent, CRM, CQC and automation. ${RATING} ${BRAND} — book a demo.`
    case "cqc":
      return `${summary} ${RATING} ${BRAND} helps UK clinics pass inspections with audit-ready evidence and checklists.`
    case "consent":
      return `${summary} ${RATING} digital consent for aesthetic clinics — fewer paper gaps, calmer inspections.`
    case "automation":
      return `${summary} ${RATING} workflows for aesthetic clinics — reactivation, intake and aftercare without brittle spreadsheets.`
    case "practitioners":
      return `${summary} ${RATING} ${BRAND} — built for practitioner roles, not generic salon tools.`
    default:
      return summary
  }
}

export function hubSegmentIndexMetaTitle(segment: HubSegment): string {
  const hooks: Partial<Record<HubSegment, string>> = {
    software: joinTitle("Aesthetic Clinic Software", CRM_TOOLS),
    compare: joinTitle("Clinic Software Comparisons", "Which Platform Fits Your Clinic?"),
    migrate: joinTitle("Clinic Software Migration Guides"),
    pricing: joinTitle("Clinic Software Pricing Compared"),
    alternatives: joinTitle("Best Clinic Software Alternatives"),
    cqc: joinTitle("CQC Compliance for UK Aesthetic Clinics", "Checklist & Tools"),
    consent: joinTitle("Digital Consent Forms for Aesthetic Clinics"),
    automation: joinTitle("Clinic Automation Software"),
    templates: joinTitle("Free Aesthetic Clinic Templates", "Forms, Policies & Emails"),
    practitioners: joinTitle("Practitioner Software by Role"),
  }
  return trimTitle(hooks[segment] ?? segmentLabel(segment))
}

export function hubSegmentIndexMetaDescription(segment: HubSegment): string {
  const label = segmentLabel(segment).toLowerCase()
  if (segment === "cqc") {
    return `Browse ${label} for UK aesthetic clinics. ${RATING} ${BRAND} — inspection checklists, policies and evidence-ready workflows.`
  }
  return `Browse ${label} for aesthetic clinics. ${RATING} ${BRAND} — structured buyer guides, comparisons and evidence-ready workflows.`
}

export function hubHomeMetaTitle() {
  return trimTitle(joinTitle("Aesthetic Clinic CRM Built for Clinics"))
}

export function hubHomeMetaDescription() {
  return `Compare clinic software, consent, CQC, automation and templates for aesthetic clinics. ${RATING} ${BRAND} — structured guides that convert searchers into demos.`
}

function cityMetaComplianceSuffix(regulator: UkRegulator): string {
  switch (regulator) {
    case "HIS":
      return "HIS Compliant Software"
    case "HIW":
      return "HIW Compliant Software"
    case "RQIA":
      return "RQIA Compliant Software"
    default:
      return CRM_TOOLS
  }
}

function cityMetaRegulatorPhrase(regulator: UkRegulator): string {
  switch (regulator) {
    case "HIS":
      return "HIS"
    case "HIW":
      return "HIW"
    case "RQIA":
      return "RQIA"
    default:
      return "CQC"
  }
}

export function hubCityPageMetaTitle(
  cityTitle: string,
  pageSlug: string,
  pageTitle: string,
  citySlug: string
) {
  const regulator = getCityRegulator(citySlug)
  if (pageSlug === "aesthetic-clinic-software") {
    return trimTitle(
      joinTitle(`Aesthetic Clinic Software ${cityTitle}`, cityMetaComplianceSuffix(regulator))
    )
  }
  const topic = pageTitle.replace(new RegExp(`\\s*${cityTitle}\\s*`, "i"), "").trim() || pageTitle
  return trimTitle(joinTitle(`${topic} ${cityTitle}`, cityMetaComplianceSuffix(regulator)))
}

export function hubCityPageMetaDescription(
  cityTitle: string,
  pageTitle: string,
  citySlug: string
) {
  const regulator = cityMetaRegulatorPhrase(getCityRegulator(citySlug))
  return `${pageTitle} for ${cityTitle} clinics — local directory links plus ${RATING} ${BRAND} consent, ${regulator} and booking workflows.`
}

export function hubTreatmentPageMetaTitle(treatmentLabel: string, typeLabel: string) {
  return trimTitle(joinTitle(`${treatmentLabel} ${typeLabel}`, CRM_TOOLS))
}

export function hubTreatmentPageMetaDescription(treatmentLabel: string, typeLabel: string) {
  return `${treatmentLabel} ${typeLabel.toLowerCase()} for aesthetic clinics — connect consent, automation and software pathways. ${RATING} ${BRAND}.`
}

export function hubTreatmentIndexMetaTitle() {
  return trimTitle(joinTitle("Treatment Workflow Guides", BRAND))
}

export function hubTreatmentIndexMetaDescription() {
  return `Treatment-specific consent, automation and clinic software pathways for aesthetic clinics. ${RATING} ${BRAND} buyer hub.`
}

export function hubUkIndexMetaTitle() {
  return trimTitle(joinTitle("Clinic Software by City", CRM_TOOLS))
}

export function hubUkIndexMetaDescription() {
  return `Local aesthetic clinic software, consent and practitioner guides for cities in our directory. ${RATING} ${BRAND}.`
}

export function hubTemplateDetailMetaTitle(templateTitle: string) {
  return trimTitle(joinTitle(freeTemplateTitle(templateTitle), "Editable Download"))
}

export function hubTemplateDetailMetaDescription(summary: string) {
  return `${summary} Free template — customise for your clinic. ${RATING} ${BRAND} library.`
}

export function hubTemplateCityMetaTitle(templateTitle: string, cityTitle: string) {
  return trimTitle(joinTitle(freeTemplateTitle(templateTitle), cityTitle, "Clinic Template"))
}

export function hubTemplateCityMetaDescription(summary: string, cityTitle: string) {
  return `${summary} Free template for ${cityTitle} clinics — customise and digitise with ${BRAND}.`
}

export function hubTemplateCategoryMetaTitle(category: TemplateCategory) {
  const label = TEMPLATE_CATEGORY_LABEL[category]
  return trimTitle(joinTitle(`Free ${label}`, "Forms, Policies & Emails"))
}

export function hubTemplateCategoryMetaDescription(category: TemplateCategory) {
  const label = TEMPLATE_CATEGORY_LABEL[category].toLowerCase()
  return `Download free ${label} for aesthetic clinics. ${RATING} ${BRAND} — ready to customise.`
}

export function hubTemplatesIndexMetaTitle() {
  return trimTitle(joinTitle("Free Aesthetic Clinic Templates", "Forms, Policies & Emails"))
}

export function hubTemplatesIndexMetaDescription() {
  return `123+ free consent, intake, aftercare and CQC templates for aesthetic clinics. ${RATING} ${BRAND} — download and digitise.`
}

export function hubTemplateTreatmentIndexMetaTitle(treatmentLabel: string) {
  return trimTitle(joinTitle(`Free ${treatmentLabel} Templates`, "Consent, Aftercare & Downloads"))
}

export function hubTemplateTreatmentIndexMetaDescription(treatmentLabel: string) {
  return `Free ${treatmentLabel.toLowerCase()} templates — consent forms, aftercare and downloads. Preview on-site, then digitise with ${BRAND}.`
}

export function buildHubPageMetadata(opts: {
  title: string
  description: string
  canonicalPath: string
  ogType?: "website" | "article"
}): Metadata {
  const url = toCurrentSiteUrl(opts.canonicalPath.endsWith("/") ? opts.canonicalPath : `${opts.canonicalPath}/`)
  const image = b2bOgImageUrl([OG_IMAGE])
  return {
    metadataBase: new URL(b2bBaseUrl()),
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      type: opts.ogType ?? "article",
      url,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  }
}

export function hubDetailPageMetadata(segment: HubSegment, entry: HubEntry): Metadata {
  return buildHubPageMetadata({
    title: hubDetailMetaTitle(segment, entry),
    description: hubDetailMetaDescription(segment, entry),
    canonicalPath: `/business/${segment}/${entry.slug}/`,
    ogType: "article",
  })
}

export function hubSegmentIndexPageMetadata(segment: HubSegment): Metadata {
  return buildHubPageMetadata({
    title: hubSegmentIndexMetaTitle(segment),
    description: hubSegmentIndexMetaDescription(segment),
    canonicalPath: `/business/${segment}/`,
    ogType: "website",
  })
}
