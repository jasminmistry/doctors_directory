import {
  TEMPLATE_ENTRIES,
  templatePageHref,
  type TemplateEntry,
} from "@/lib/b2b-hub/templates-registry"

export type TemplateTreatmentGroup = {
  slug: string
  label: string
}

export function treatmentSlugFromEntry(entry: TemplateEntry): string | null {
  if (!entry.treatmentLabel) return null
  const consent = entry.slug.match(/^(.+?)-consent-form-template$/)
  if (consent) return consent[1]
  const aftercare = entry.slug.match(/^(.+?)-aftercare-template$/)
  if (aftercare) return aftercare[1]
  return null
}

function buildTreatmentGroups(): TemplateTreatmentGroup[] {
  const map = new Map<string, string>()
  for (const entry of TEMPLATE_ENTRIES) {
    const slug = treatmentSlugFromEntry(entry)
    if (!slug || map.has(slug)) continue
    map.set(slug, entry.treatmentLabel ?? slug)
  }
  return [...map.entries()]
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }))
}

export const TEMPLATE_TREATMENT_GROUPS = buildTreatmentGroups()

export function isTemplateTreatmentSlug(value: string): boolean {
  return TEMPLATE_TREATMENT_GROUPS.some((g) => g.slug === value)
}

export function getTemplateTreatmentGroup(
  slug: string
): TemplateTreatmentGroup | undefined {
  return TEMPLATE_TREATMENT_GROUPS.find((g) => g.slug === slug)
}

export function templatesByTreatment(treatmentSlug: string): TemplateEntry[] {
  return TEMPLATE_ENTRIES.filter((e) => treatmentSlugFromEntry(e) === treatmentSlug)
}

export function templateTreatmentIndexHref(treatmentSlug: string) {
  return `/business/templates/treatment/${treatmentSlug}/`
}

export function templateLibraryHrefForEntry(entry: TemplateEntry): string {
  const treatmentSlug = treatmentSlugFromEntry(entry)
  if (treatmentSlug) return templateTreatmentIndexHref(treatmentSlug)
  return `/business/templates/${entry.category}/`
}

export function templateDetailHrefForEntry(entry: TemplateEntry) {
  return templatePageHref(entry)
}
