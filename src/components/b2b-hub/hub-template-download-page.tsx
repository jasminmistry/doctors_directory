import {
  HUB_CTA_PRIMARY_CLASS,
  HUB_CTA_PRIMARY_HERO_CLASS,
  HUB_CTA_SECONDARY_CLASS,
  HUB_CTA_SECONDARY_HERO_CLASS,
  HUB_CTA_LINK_CLASS,
} from "@/components/b2b-hub/hub-cta-buttons"
import Image from "next/image"
import Link from "next/link"
import { HubDetailHeroShell } from "@/components/b2b-hub/hub-detail-hero-shell"
import { HubContentStart } from "@/components/b2b-hub/hub-content-start"
import { HUB_CENTERED_MOBILE_CTAS } from "@/components/b2b-hub/hub-hero-layout-classes"
import { HubSectionCta } from "@/components/b2b-hub/hub-section-cta"
import { HubServiceProviderSection } from "@/components/b2b-hub/hub-service-provider-section"
import { HubTemplateDownloadForm } from "@/components/b2b-hub/hub-template-download-form"
import { HubTemplateLibrarySection } from "@/components/b2b-hub/hub-template-library-section"
import { HubTemplatePreviewPanel } from "@/components/b2b-hub/hub-template-preview-panel"
import {
  HUB_HERO_PHONE_SRC,
  HUB_HERO_PHONE_IMAGE_CLASS,
  HUB_HERO_INTRO_CLASS,
  HUB_HERO_TITLE_CLASS,
} from "@/components/b2b-hub/hub-hero-typography"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getTemplatePageContent } from "@/lib/b2b-hub/template-page-content"
import {
  TEMPLATE_CATEGORY_LABEL,
  type TemplateEntry,
  relatedTemplateEntries,
  templatePageHref,
} from "@/lib/b2b-hub/templates-registry"
import {
  getTemplateTreatmentGroup,
  templateTreatmentIndexHref,
  treatmentSlugFromEntry,
} from "@/lib/b2b-hub/template-treatments"
import { toDisplayTitle } from "@/lib/b2b-hub/text"

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com"

type Props = {
  entry: TemplateEntry
}

export function HubTemplateDownloadPage({ entry }: Props) {
  const content = getTemplatePageContent(entry)
  const related = relatedTemplateEntries(entry.category, entry.slug, 9)
  const treatmentSlug = treatmentSlugFromEntry(entry)
  const treatmentGroup = treatmentSlug
    ? getTemplateTreatmentGroup(treatmentSlug)
    : undefined

  const breadcrumb = (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/business/">Buyer Hub</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/business/templates/">Templates</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {treatmentGroup ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink href={templateTreatmentIndexHref(treatmentSlug!)}>
                {treatmentGroup.label} Templates
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ) : (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/business/templates/${entry.category}/`}>
                {TEMPLATE_CATEGORY_LABEL[entry.category]}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        <BreadcrumbItem>
          <BreadcrumbPage className="line-clamp-1">
            {toDisplayTitle(entry.title)}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )

  return (
    <>
      <HubDetailHeroShell
        breadcrumb={breadcrumb}
        title={
          <>
            <span className="mb-3 inline-flex rounded-full bg-[#1a877a] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Free Download
            </span>
            <h1 className={HUB_HERO_TITLE_CLASS}>{toDisplayTitle(entry.title)}</h1>
          </>
        }
        intro={<p className={HUB_HERO_INTRO_CLASS}>{entry.summary}</p>}
        actions={
          <a
            href="#download-form"
            className={HUB_CTA_PRIMARY_HERO_CLASS}
          >
            Download Template
          </a>
        }
        visual={
          <figure className="flex justify-center lg:justify-end">
            <Image
              src={HUB_HERO_PHONE_SRC}
              alt=""
              width={320}
              height={640}
              priority
              className={HUB_HERO_PHONE_IMAGE_CLASS}
            />
          </figure>
        }
      />

      <HubContentStart>
        <section className="mb-12 grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-12">
          <div id="download-form" className="rounded-2xl border border-[#E2DDD7] bg-[#FAFAFA] p-6 md:p-8">
            <h2 className="mb-2 text-xl font-semibold text-[#111111]">Download Your Free Template</h2>
            <p className="mb-6 text-sm text-[#6B6B6B]">
              Enter your email to receive the PDF. We will also send practical tips for digitising this workflow in
              Consentz.
            </p>
            <HubTemplateDownloadForm />
          </div>
          <HubTemplatePreviewPanel entry={entry} />
        </section>

        <HubTemplateLibrarySection
          excludeSlug={{ category: entry.category, slug: entry.slug }}
        />

        <section className="mb-12">
          <h2 className="mb-6 text-center text-2xl font-bold text-[#111111] md:text-3xl">
            What&apos;s Included
          </h2>
          <div className="mx-auto grid max-w-[920px] grid-cols-1 gap-2.5 md:grid-cols-2">
            {content.includes.map((line) => (
              <div
                key={line}
                className="flex items-center gap-3 rounded-xl bg-[#eef7f2] px-[18px] py-[14px]"
              >
                <span className="shrink-0 text-sm font-bold text-[#1a6e45]">✓</span>
                <p className="text-base font-medium text-[#1a1a1a]">{line}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-[#111111] md:text-3xl">Why You Need This</h2>
          <p className="text-base leading-relaxed text-[#1A1A1A]">{content.whyNeed}</p>
        </section>

        <section className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="mb-6 text-2xl font-bold text-[#111111] md:text-3xl">What To Include</h2>
          <ul className="mx-auto flex w-fit max-w-full flex-col gap-3 text-left">
            {content.whatToInclude.map((item) => (
              <li key={item} className="flex gap-3 text-base leading-relaxed text-[#1A1A1A]">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a877a]" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12 rounded-2xl border border-[#E2DDD7] bg-[#faf8f5] p-8 text-center md:p-10 md:text-left">
          <h2 className="mb-3 text-2xl font-bold text-[#111111]">Make It Digital With Consentz</h2>
          <p className="mx-auto mb-6 max-w-2xl text-base leading-relaxed text-[#1A1A1A] md:mx-0">
            {content.digitalPitch}
          </p>
          <div className={`${HUB_CENTERED_MOBILE_CTAS} md:justify-start`}>
            <a
              href={`${baseUrl}/book-demo`}
              className={HUB_CTA_PRIMARY_CLASS}
            >
              Book A Demo
            </a>
            <a
              href={`${baseUrl}/medical-templates/`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-[#E2DDD7] bg-white px-6 text-base font-medium text-[#111111] transition-colors hover:bg-neutral-50"
            >
              Create Workflow
            </a>
          </div>
        </section>

        <section className="mb-12">
          <div className="mx-auto grid max-w-[1072px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link
                key={`${r.category}-${r.slug}`}
                href={templatePageHref(r)}
                className="flex min-h-[93px] items-center justify-center rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] px-5 py-[18px] text-center text-lg font-semibold text-[#111111] transition-colors hover:border-neutral-400 hover:bg-white"
              >
                {toDisplayTitle(r.title)}
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-[#111111] md:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto max-w-[1056px] overflow-hidden rounded-xl border border-[#E2DDD7] bg-white">
            <details open className="group border-b border-[#EDE9E3]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-lg font-semibold text-[#111111]">
                Is This Template Suitable For CQC-Registered Clinics?
                <span className="shrink-0 text-sm text-neutral-400 transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <div className="px-6 pb-5">
                <p className="text-base leading-relaxed text-[#6B6B6B]">
                  The structure is designed to support common governance expectations. Your responsible clinician
                  should review and adapt wording to your scope of practice.
                </p>
              </div>
            </details>
            <details className="group border-b border-[#EDE9E3]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-lg font-semibold text-[#111111]">
                Can I Edit The Template For My Clinic?
                <span className="shrink-0 text-sm text-neutral-400 transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <div className="px-6 pb-5">
                <p className="text-base leading-relaxed text-[#6B6B6B]">
                  Yes. Download the PDF and customise branding, contact details, and treatment-specific clauses before
                  use.
                </p>
              </div>
            </details>
          </div>
        </section>
        <HubServiceProviderSection />
      </HubContentStart>

      <HubSectionCta />
    </>
  )
}
