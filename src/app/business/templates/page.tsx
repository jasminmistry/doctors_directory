import type { Metadata } from "next"
import { HubSectionCta } from "@/components/b2b-hub/hub-section-cta"
import { HubTemplateLibrarySection } from "@/components/b2b-hub/hub-template-library-section"
import { HubTemplatesIndexHero } from "@/components/b2b-hub/hub-templates-index-hero"
import { TEMPLATE_CATEGORIES, TEMPLATE_ENTRIES } from "@/lib/b2b-hub/templates-registry"
import { b2bBaseUrl, b2bOgImageUrl, toCurrentSiteUrl } from "@/lib/b2b-hub/seo"

export const metadata: Metadata = {
  metadataBase: new URL(b2bBaseUrl()),
  title: "Free Clinic Templates | Consentz Buyer Hub",
  description:
    "Download free consent, intake, aftercare, CQC policy, and clinic admin templates for UK aesthetic clinics.",
  alternates: { canonical: toCurrentSiteUrl("/business/templates/") },
  openGraph: {
    title: "Free Clinic Templates | Consentz Buyer Hub",
    description:
      "Treatment-specific templates for consent, intake, aftercare, and CQC evidence — free download.",
    type: "website",
    url: toCurrentSiteUrl("/business/templates/"),
    images: [{ url: b2bOgImageUrl(["/images/Consentz Logo.webp"]) }],
  },
}

export default function TemplatesHubPage() {
  return (
    <>
      <HubTemplatesIndexHero
        templateCount={TEMPLATE_ENTRIES.length}
        categoryCount={TEMPLATE_CATEGORIES.length}
      />

      <HubTemplateLibrarySection showViewAll={false} />

      <HubSectionCta
        heading="Ready To Digitise Your Templates?"
        sub="Move from PDF downloads to governed digital consent and clinic workflows with Consentz."
        secondaryLabel="Browse Buyer Hub"
        secondaryHref="/business/"
      />
    </>
  )
}
