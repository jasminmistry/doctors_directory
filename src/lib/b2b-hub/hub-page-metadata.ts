import type { Metadata } from "next"
import type { HubEntry, HubSegment } from "@/lib/b2b-hub/registry"
import { COMPETITOR_LABEL } from "@/lib/b2b-hub/competitors"
import { segmentLabel } from "@/lib/b2b-hub/registry"
import { b2bBaseUrl, b2bOgImageUrl, toCurrentSiteUrl } from "@/lib/b2b-hub/seo"
import type { TemplateCategory } from "@/lib/b2b-hub/templates-registry"
import { TEMPLATE_CATEGORY_LABEL } from "@/lib/b2b-hub/templates-registry"

const BRAND = "Consentz"
const RATING = "4.9★ Rated"
const UK = "UK"

const OG_IMAGE = "/images/Consentz Logo.webp"

function trimTitle(value: string, max = 60) {
  if (value.length <= max) return value
  return `${value.slice(0, max - 1).trim()}…`
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

function topicPhrase(title: string) {
  return title.replace(/\s+for\s+clinics$/i, "").replace(/\s+software$/i, " software").trim()
}

export function hubDetailMetaTitle(segment: HubSegment, entry: HubEntry): string {
  const topic = topicPhrase(entry.title)
  const rival = competitorLabelFromSlug(entry.slug)

  switch (segment) {
    case "software":
      return trimTitle(`${topic} ${UK} | ${RATING} | ${BRAND}`)
    case "compare":
      return trimTitle(`${entry.title} | ${UK} Clinic Software | ${RATING}`)
    case "migrate":
      return trimTitle(`Migrate from ${rival ?? topic} | ${UK} | ${RATING} | ${BRAND}`)
    case "pricing":
      return trimTitle(`${rival ?? topic} Pricing Alternative | ${UK} | ${RATING}`)
    case "alternatives":
      return trimTitle(`${rival ?? topic} Alternative | ${UK} Aesthetic CRM | ${RATING}`)
    case "cqc":
      if (rival) {
        return trimTitle(`${rival} CQC Alternative | ${UK} | ${RATING} | ${BRAND}`)
      }
      return trimTitle(`${topic} ${UK} | ${RATING} | ${BRAND}`)
    case "consent":
      if (rival) {
        return trimTitle(`${rival} Consent Alternative | ${UK} | ${RATING}`)
      }
      return trimTitle(`${topic} ${UK} | ${RATING} | ${BRAND}`)
    case "automation":
      if (entry.slug.endsWith("-automation-alternative") && rival) {
        return trimTitle(`${rival} Automation Alternative | ${UK} | ${RATING}`)
      }
      if (entry.slug.endsWith("-automation-tool")) {
        return trimTitle(`${topic} | ${UK} Aesthetic Clinics | ${RATING}`)
      }
      return trimTitle(`${topic} ${UK} | ${RATING} | ${BRAND}`)
    case "practitioners":
      return trimTitle(`${topic} ${UK} | ${RATING} | ${BRAND}`)
    default:
      return trimTitle(`${entry.title} | ${BRAND}`)
  }
}

export function hubDetailMetaDescription(segment: HubSegment, entry: HubEntry): string {
  const summary = entry.summary ?? entry.title
  const rival = competitorLabelFromSlug(entry.slug)

  switch (segment) {
    case "software":
      return `${summary} ${RATING} by UK aesthetic clinics — consent, CQC evidence, booking & automation in one platform.`
    case "compare":
      return `Side-by-side ${entry.title} for UK clinics: consent, CQC, pricing & automation. ${RATING} on Trustpilot-style reviews — see why teams switch.`
    case "migrate":
      return `Plan your move from ${rival ?? "legacy software"} without losing patients or compliance evidence. ${RATING} ${BRAND} migration playbook for UK clinics.`
    case "pricing":
      return `Compare ${rival ?? "competitor"} pricing with ${BRAND} for growing UK aesthetic clinics. ${RATING} — transparent plans, fewer hidden add-ons.`
    case "alternatives":
      return `Best ${rival ?? "clinic software"} alternative for UK aesthetics: consent, CRM, CQC & automation. ${RATING} ${BRAND} — book a demo.`
    case "cqc":
      return `${summary} ${RATING} ${BRAND} helps UK clinics pass inspections with audit-ready evidence.`
    case "consent":
      return `${summary} ${RATING} digital consent trusted by UK aesthetic clinics — fewer paper gaps, calmer inspections.`
    case "automation":
      return `${summary} ${RATING} workflows for UK clinics — reactivation, intake & aftercare without brittle spreadsheets.`
    case "practitioners":
      return `${summary} ${RATING} ${BRAND} — built for ${UK} practitioner roles, not generic salon tools.`
    default:
      return summary
  }
}

export function hubSegmentIndexMetaTitle(segment: HubSegment): string {
  const label = segmentLabel(segment)
  const hooks: Partial<Record<HubSegment, string>> = {
    software: `Aesthetic Clinic Software Guides ${UK}`,
    compare: `Clinic Software Comparisons ${UK}`,
    migrate: `Clinic Software Migration Guides ${UK}`,
    pricing: `Clinic Software Pricing ${UK}`,
    alternatives: `Clinic Software Alternatives ${UK}`,
    cqc: `CQC Compliance Software ${UK}`,
    consent: `Digital Consent Forms ${UK}`,
    automation: `Clinic Automation Software ${UK}`,
    templates: `Free Aesthetic Clinic Templates ${UK}`,
    practitioners: `Practitioner Software by Role ${UK}`,
  }
  return trimTitle(`${hooks[segment] ?? label} | ${RATING} | ${BRAND}`)
}

export function hubSegmentIndexMetaDescription(segment: HubSegment): string {
  const label = segmentLabel(segment).toLowerCase()
  return `Browse ${label} for UK aesthetic clinics. ${RATING} ${BRAND} — structured buyer guides, comparisons & evidence-ready workflows.`
}

export function hubHomeMetaTitle() {
  return trimTitle(`Aesthetic Clinic Software Buyer Hub ${UK} | ${RATING}`)
}

export function hubHomeMetaDescription() {
  return `Compare clinic software, consent, CQC, automation & templates for UK aesthetics. ${RATING} ${BRAND} — structured guides that convert searchers into demos.`
}

export function hubCityPageMetaTitle(cityTitle: string, pageSlug: string, pageTitle: string) {
  if (pageSlug === "aesthetic-clinic-software") {
    return trimTitle(`Aesthetic Clinic Software ${cityTitle} | ${RATING} | ${BRAND}`)
  }
  return trimTitle(`${pageTitle} ${cityTitle} | ${RATING} | ${BRAND}`)
}

export function hubCityPageMetaDescription(
  cityTitle: string,
  pageTitle: string,
) {
  return `${pageTitle} for ${cityTitle} clinics — local directory links plus ${RATING} ${BRAND} consent, CQC & booking workflows.`
}

export function hubTreatmentPageMetaTitle(treatmentLabel: string, typeLabel: string) {
  return trimTitle(`${treatmentLabel} ${typeLabel} ${UK} | ${RATING} | ${BRAND}`)
}

export function hubTreatmentPageMetaDescription(
  treatmentLabel: string,
  typeLabel: string,
) {
  return `${treatmentLabel} ${typeLabel.toLowerCase()} for UK clinics — connect consent, automation & software pathways. ${RATING} ${BRAND}.`
}

export function hubTreatmentIndexMetaTitle() {
  return trimTitle(`Treatment Workflow Guides ${UK} | ${RATING} | ${BRAND}`)
}

export function hubTreatmentIndexMetaDescription() {
  return `Treatment-specific consent, automation & clinic software pathways for UK aesthetics. ${RATING} ${BRAND} buyer hub.`
}

export function hubUkIndexMetaTitle() {
  return trimTitle(`Clinic Software by UK City | ${RATING} | ${BRAND}`)
}

export function hubUkIndexMetaDescription() {
  return `Local aesthetic clinic software, consent & practitioner guides for every UK city in our directory. ${RATING} ${BRAND}.`
}

export function hubTemplateDetailMetaTitle(templateTitle: string) {
  return trimTitle(`Free ${templateTitle} | ${UK} Download | ${RATING}`)
}

export function hubTemplateDetailMetaDescription(summary: string) {
  return `${summary} Free ${UK} template — customise for your clinic. ${RATING} ${BRAND} library.`
}

export function hubTemplateCategoryMetaTitle(category: TemplateCategory) {
  const label = TEMPLATE_CATEGORY_LABEL[category]
  return trimTitle(`Free ${label} ${UK} | ${RATING} | ${BRAND}`)
}

export function hubTemplateCategoryMetaDescription(category: TemplateCategory) {
  const label = TEMPLATE_CATEGORY_LABEL[category].toLowerCase()
  return `Download free ${label} for UK aesthetic clinics. ${RATING} ${BRAND} — ready to customise.`
}

export function hubTemplatesIndexMetaTitle() {
  return trimTitle(`Free Aesthetic Clinic Templates ${UK} | ${RATING}`)
}

export function hubTemplatesIndexMetaDescription() {
  return `123+ free consent, intake, aftercare & CQC templates for UK aesthetic clinics. ${RATING} ${BRAND} — download and digitise.`
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
