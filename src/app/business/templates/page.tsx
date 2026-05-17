import type { Metadata } from "next"
import { HubLogoStrip } from "@/components/b2b-hub/hub-logo-strip"
import { HubSectionCta } from "@/components/b2b-hub/hub-section-cta"
import { HubTemplateLibrarySection } from "@/components/b2b-hub/hub-template-library-section"
import { HUB_INDEX_HERO_TITLE_CLASS_DEFAULT } from "@/components/b2b-hub/hub-index-hero-search"
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
      <section className="bg-[var(--primary-bg-color)] border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 pb-0 md:pt-10">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <h1 className={HUB_INDEX_HERO_TITLE_CLASS_DEFAULT}>Free Clinic Templates</h1>
              <p className="text-neutral-600 text-base md:text-lg max-w-2xl leading-relaxed mb-0">
                Treatment-specific downloads for consent, intake, aftercare, CQC policies, and clinic operations.
                {` ${TEMPLATE_ENTRIES.length} templates across ${TEMPLATE_CATEGORIES.length} categories.`}
              </p>
            </div>
            <figure className="flex justify-center lg:justify-end order-first lg:order-none">
              <img
                src="/directory/images/Consentz Aesthetic Clinic Directory.webp"
                alt=""
                className="max-w-[220px] sm:max-w-xs w-full h-auto object-contain"
              />
            </figure>
          </div>
          <HubLogoStrip />
        </div>
      </section>

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
