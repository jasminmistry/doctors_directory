import type { Metadata } from "next"
import { HubSectionCta } from "@/components/b2b-hub/hub-section-cta"
import { HubTemplateLibrarySection } from "@/components/b2b-hub/hub-template-library-section"
import { HubTemplatesIndexHero } from "@/components/b2b-hub/hub-templates-index-hero"
import { getHubTemplateLibraryItems } from "@/lib/b2b-hub/hub-template-library-data"
import { TEMPLATE_CATEGORIES } from "@/lib/b2b-hub/templates-registry"
import {
  buildHubPageMetadata,
  hubTemplatesIndexMetaDescription,
  hubTemplatesIndexMetaTitle,
} from "@/lib/b2b-hub/hub-page-metadata"

export const metadata: Metadata = buildHubPageMetadata({
  title: hubTemplatesIndexMetaTitle(),
  description: hubTemplatesIndexMetaDescription(),
  canonicalPath: "/business/templates/",
  ogType: "website",
})

export default function TemplatesHubPage() {
  const libraryCount = getHubTemplateLibraryItems().length
  return (
    <>
      <HubTemplatesIndexHero
        templateCount={libraryCount}
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
