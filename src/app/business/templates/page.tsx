import type { Metadata } from "next"
import Link from "next/link"
import { HubLogoStrip } from "@/components/b2b-hub/hub-logo-strip"
import { HubSectionCta } from "@/components/b2b-hub/hub-section-cta"
import { HUB_INDEX_HERO_TITLE_CLASS_DEFAULT } from "@/components/b2b-hub/hub-index-hero-search"
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_CATEGORY_LABEL,
  TEMPLATE_ENTRIES,
  templatesByCategory,
} from "@/lib/b2b-hub/templates-registry"
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

      <section className="bg-white px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-14">
            {TEMPLATE_CATEGORIES.map((cat) => {
              const items = templatesByCategory(cat)
              if (items.length === 0) return null
              return (
                <div key={cat}>
                  <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <h2 className="text-2xl font-bold text-[#111111]">
                      {TEMPLATE_CATEGORY_LABEL[cat]}
                    </h2>
                    <Link
                      href={`/business/templates/${cat}/`}
                      className="text-sm font-semibold text-[#1a877a] hover:underline"
                    >
                      View all ({items.length}) →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.slice(0, 6).map((e) => (
                      <Link
                        key={e.slug}
                        href={`/business/templates/${e.category}/${e.slug}/`}
                        className="flex min-h-[88px] flex-col justify-center rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-4 hover:border-neutral-400 hover:bg-white transition-colors"
                      >
                        <span className="font-semibold text-[#111111] leading-snug">{e.title}</span>
                        <span className="mt-1 text-sm text-neutral-600 line-clamp-2">{e.summary}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <HubSectionCta
        heading="Ready To Digitise Your Templates?"
        sub="Move from PDF downloads to governed digital consent and clinic workflows with Consentz."
        secondaryLabel="Browse Buyer Hub"
        secondaryHref="/business/"
      />
    </>
  )
}
