import Image from "next/image"
import Link from "next/link"
import { HubDetailHeroShell } from "@/components/b2b-hub/hub-detail-hero-shell"
import { HubContentStart } from "@/components/b2b-hub/hub-content-start"
import { HubSectionCta } from "@/components/b2b-hub/hub-section-cta"
import { HubTemplateDownloadForm } from "@/components/b2b-hub/hub-template-download-form"
import {
  HUB_HERO_PHONE_SRC,
  HUB_HERO_PHONE_IMAGE_CLASS,
  HUB_HERO_INTRO_CLASS,
  HUB_HERO_TITLE_CLASS,
} from "@/components/b2b-hub/hub-hero-typography"
import { ServiceProviderCollage } from "@/components/b2b-hub/hub-pillar-detail-template"
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
import { toDisplayTitle } from "@/lib/b2b-hub/text"

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com"

type Props = {
  entry: TemplateEntry
}

export function HubTemplateDownloadPage({ entry }: Props) {
  const content = getTemplatePageContent(entry)
  const related = relatedTemplateEntries(entry.category, entry.slug, 9)

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
        <BreadcrumbItem>
          <BreadcrumbLink href={`/business/templates/${entry.category}/`}>
            {TEMPLATE_CATEGORY_LABEL[entry.category]}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
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
            className="inline-flex h-[52px] w-[min(100%,240px)] shrink-0 items-center justify-center rounded-[7px] bg-[#1A1A1A] px-8 text-[18px] font-semibold text-white transition-colors hover:bg-neutral-900"
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
        <section className="mb-12 grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div id="download-form" className="rounded-2xl border border-[#E2DDD7] bg-[#FAFAFA] p-6 md:p-8">
            <h2 className="mb-2 text-xl font-semibold text-[#111111]">Download Your Free Template</h2>
            <p className="mb-6 text-sm text-[#6B6B6B]">
              Enter your email to receive the PDF. We will also send practical tips for digitising this workflow in
              Consentz.
            </p>
            <HubTemplateDownloadForm />
          </div>
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-2xl border border-[#E2DDD7] bg-white shadow-sm">
              <div className="flex aspect-[4/5] items-center justify-center bg-[#f2eee6] p-8">
                <div className="w-full max-w-[280px] rounded-lg border border-[#E2DDD7] bg-white p-6 shadow-md">
                  <div className="mb-4 h-3 w-24 rounded bg-[#e6e0d8]" />
                  <div className="mb-2 h-2 w-full rounded bg-[#eef7f2]" />
                  <div className="mb-2 h-2 w-[90%] rounded bg-[#eef7f2]" />
                  <div className="mb-6 h-2 w-[75%] rounded bg-[#eef7f2]" />
                  <div className="h-8 w-32 rounded border border-[#1a877a] bg-[#e0f1ed]" />
                </div>
              </div>
              <p className="border-t border-[#E2DDD7] px-5 py-3 text-center text-sm text-[#6B6B6B]">
                Preview — PDF template thumbnail
              </p>
            </div>
          </div>
        </section>

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

        <section className="mb-12 max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold text-[#111111]">Why You Need This</h2>
          <p className="text-base leading-relaxed text-[#1A1A1A]">{content.whyNeed}</p>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-[#111111]">What To Include</h2>
          <ul className="flex max-w-3xl flex-col gap-3">
            {content.whatToInclude.map((item) => (
              <li key={item} className="flex gap-3 text-base leading-relaxed text-[#1A1A1A]">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a877a]" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12 rounded-2xl border border-[#E2DDD7] bg-[#faf8f5] p-8 md:p-10">
          <h2 className="mb-3 text-2xl font-bold text-[#111111]">Make It Digital With Consentz</h2>
          <p className="mb-6 max-w-2xl text-base leading-relaxed text-[#1A1A1A]">{content.digitalPitch}</p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`${baseUrl}/book-demo`}
              className="inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#1A1A1A] px-6 text-base font-semibold text-white transition-colors hover:bg-neutral-900"
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

        <section className="mb-16 w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 bg-[#F2EEE6] lg:h-[302px] lg:overflow-hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:py-12 lg:h-full lg:flex-row lg:items-center lg:justify-between lg:py-0">
            <div className="flex min-w-0 max-w-[629px] flex-col gap-2">
              <h2 className="text-[26px] font-semibold leading-[1.1] text-[#1A1A1A] sm:text-[30px] lg:text-[36px]">
                Are You A Service Provider?
              </h2>
              <p className="text-base font-medium text-[#1A1A1A] sm:text-lg">
                Join Consentz to streamline clinic operations and grow your business.
              </p>
              <a
                href={`${baseUrl}/book-demo`}
                className="mt-3 inline-flex h-[48px] w-[200px] items-center justify-center rounded-[12px] bg-[#1A1A1A] text-base font-semibold text-white transition-colors hover:bg-neutral-900"
              >
                Learn More
              </a>
            </div>
            <div className="relative mx-auto h-[220px] w-full max-w-[400px] lg:mx-0 lg:h-full lg:max-h-[302px] lg:w-[min(46vw,560px)]">
              <ServiceProviderCollage />
            </div>
          </div>
        </section>
      </HubContentStart>

      <HubSectionCta />
    </>
  )
}
