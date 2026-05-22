import { HubBuyerFaq, mapLegacyHubFaqs } from "@/components/b2b-hub/hub-buyer-faq"
import { HubTestimonialsSection } from "@/components/b2b-hub/hub-testimonials-section"
import {
  HUB_CTA_PRIMARY_CLASS,
  HUB_CTA_PRIMARY_HERO_CLASS,
  HUB_CTA_SECONDARY_CLASS,
  HUB_CTA_SECONDARY_HERO_CLASS,
  HUB_CTA_LINK_CLASS,
} from "@/components/b2b-hub/hub-cta-buttons"
import { HUB_BTN_VIEW_ALL_BLOGS_CLASS } from "@/components/b2b-hub/hub-marketing-typography"
import { HubMainDifferenceSection } from "@/components/b2b-hub/hub-main-difference-section"
import { HubSectionCta } from "@/components/b2b-hub/hub-section-cta"
import { HubServiceProviderSection } from "@/components/b2b-hub/hub-service-provider-section"
import { HubLogoStrip } from "@/components/b2b-hub/hub-logo-strip"
import Image from "next/image";
import Link from "next/link"
import { HUB_DETAIL_HERO_VIEWPORT_CLASS } from "@/lib/b2b-hub/hub-index-hero-layout"
import {
  HUB_HERO_ACTIONS_ROW,
  HUB_SPLIT_HERO_CONTENT,
  HUB_SPLIT_HERO_GRID_TWO_COL,
  HUB_SPLIT_HERO_VISUAL_TALL,
} from "@/components/b2b-hub/hub-hero-layout-classes"

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { HubComparisonTable } from "@/components/b2b-hub/hub-comparison-table";
import {
  SoftwareHeroVisual,
} from "@/components/b2b-hub/hub-pillar-detail-template";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { HUB_BLOG_LINKS } from "@/lib/b2b-hub/hub-blog-links";
import {
  migrateHubNavLinks,
  migrateSlugToCompetitorKey,
} from "@/lib/b2b-hub/migrate-hub-nav-links";
import { COMPETITOR_LABEL } from "@/lib/b2b-hub/competitors";
import type { HubEntry, HubSegment } from "@/lib/b2b-hub/registry";
import { segmentLabel } from "@/lib/b2b-hub/registry";
import { toDisplayTitle } from "@/lib/b2b-hub/text";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com";

const migrationProgressRows = [
  "Patient profiles",
  "Medical history",
  "Appointment history",
  "Treatment notes",
  "Staff & billing history",
] as const;

const migratePainCards = [
  {
    title: "Data Gets Lost In The Transfer",
    body: "Patient records, consent forms, and appointment histories vanish during unmanaged migrations — leaving clinics scrambling to rebuild from scratch.",
  },
  {
    title: "Weeks Of Manual Re-Entry",
    body: "Without proper tooling, teams spend weeks copying data by hand. Errors creep in, staff burn out, and the clinic loses focus on patient care.",
  },
  {
    title: "Clinics Go Dark During Transition",
    body: "Going offline — even for a few days — means missed bookings, frustrated patients, and revenue you can't recover.",
  },
  {
    title: "No Expert Guidance When You Need It",
    body: "Most platforms hand you a help article and wish you luck. When things break, you're left to figure it out alone.",
  },
] as const;

const migrationHandledSteps = [
  {
    title: "Book A Discovery Call",
    body: "We align on your current setup in {platform}, timelines, and what “good” looks like for go-live.",
  },
  {
    title: "We Audit Your Data",
    body: "We review exports and integrations so issues are caught before cutover — not in front of patients.",
  },
  {
    title: "Secure Transfer",
    body: "Data moves over encrypted channels with clear ownership of each dataset and rollback options.",
  },
  {
    title: "Quality Check",
    body: "We verify key records, consent artefacts, and booking continuity before you switch traffic.",
  },
  {
    title: "Go Live",
    body: "Your team runs on Consentz from day one with support on hand for the first busy week.",
  },
] as const;

const everythingBrings = [
  "Patient profiles",
  "Appointment schedules",
  "Treatment notes",
  "Medical records",
  "Staff records",
  "Invoices",
  "Marketing data",
  "Inventory",
  "Consent forms",
  "Product lists",
] as const;

function migrateFaqs(platform: string) {
  return [
    {
      open: true,
      q: `How long does a typical migration from ${platform} take?`,
      a: "Most structured migrations complete within a few business days once exports are available. Larger groups or multi-site operators may phase by location — we map that on the discovery call.",
    },
    {
      open: false,
      q: `Will we lose bookings while we move off ${platform}?`,
      a: "We plan cutover windows with you so calendars, deposits, and patient comms stay coherent. The goal is no “dark days” where patients cannot book or pay.",
    },
    {
      open: false,
      q: `Do you export data from ${platform} for us?`,
      a: "We guide your team on exports and API options where available. Consentz stays responsible for mapping, validation, and import — so nothing is left as an ambiguous CSV project.",
    },
  ] as const;
}

type Props = {
  entry: HubEntry;
};

export function HubMigrateDetailTemplate({ entry }: Props) {
  const seg = entry.segment as HubSegment;
  const competitorKey = migrateSlugToCompetitorKey(entry.slug);
  const platform =
    (competitorKey && COMPETITOR_LABEL[competitorKey]) ||
    (competitorKey ? toDisplayTitle(competitorKey.replaceAll("-", " ")) : "your platform");
  const intro =
    entry.summary ||
    `Plan a migration away from ${platform} without breaking bookings, consent evidence, or day-to-day operations.`;
  const navLinks = migrateHubNavLinks(entry.slug);
  const faqs = migrateFaqs(platform);
  const compareHref =
    competitorKey != null
      ? `/business/compare/consentz-vs-${competitorKey}/`
      : "/business/compare/";

  return (
    <>
      <section
        className={cn(
          "w-full border-b border-[#E5E7EB] bg-[var(--primary-bg-color)]",
          HUB_DETAIL_HERO_VIEWPORT_CLASS
        )}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-0">
          <div className={HUB_SPLIT_HERO_GRID_TWO_COL}>
            <div className={HUB_SPLIT_HERO_CONTENT}>
              <Breadcrumb className="mb-6 flex w-full justify-center lg:justify-start">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/business/">Buyer Hub</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/business/${seg}/`}>
                      {segmentLabel(seg)}
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
              <header>
                <h1 className="mb-5 max-w-[700px] text-[clamp(1.75rem,5vw,3.25rem)] font-medium leading-[1.08] tracking-[0.468px] text-[#1A1A1A] [font-family:var(--font-playfair),Georgia,serif] lg:text-[52px]">
                  {toDisplayTitle(entry.title)}
                </h1>
                <p className="mb-9 max-w-[700px] text-lg font-medium leading-[1.65] text-[#1A1A1A] [font-family:Inter,system-ui,sans-serif] lg:text-2xl">
                  {intro}
                </p>
                <div className={HUB_HERO_ACTIONS_ROW}>
                  <a
                    href={`${baseUrl}/book-demo`}
                    className={HUB_CTA_PRIMARY_HERO_CLASS}
                  >
                    Book a Demo
                  </a>
                  <a
                    href={`${baseUrl}/book-demo`}
                    className={HUB_CTA_SECONDARY_HERO_CLASS}
                  >
                    Get CQC Readiness Audit
                  </a>
                  <Link
                    href={compareHref}
                    className={HUB_CTA_LINK_CLASS}
                  >
                    Consentz vs {platform} →
                  </Link>
                </div>
              </header>
            </div>
            <div
              className={HUB_SPLIT_HERO_VISUAL_TALL}
              aria-hidden
            >
              <SoftwareHeroVisual />
            </div>
          </div>
        
        <HubLogoStrip className="mt-auto shrink-0" />
</div>
      </section>

      <article className="mx-auto w-full min-w-0 max-w-[1280px] overflow-x-clip px-4 pb-0 pt-8 md:pt-10 [font-family:Inter,system-ui,sans-serif]">
        <p className="mx-auto mb-10 max-w-[900px] text-center text-base leading-relaxed text-[#4a4a4a] md:text-lg">
          This page is for clinic teams switching from{" "}
          <span className="font-semibold text-[#1a1a1a]">{platform}</span> who want a structured, low-risk
          migration onto Consentz — with clear ownership of data, consent, and bookings.
        </p>

        <section className="mb-12">
          <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] p-6 shadow-sm md:p-8">
              <h2 className="mb-3 text-lg font-semibold text-[#111111]">Operational Reality</h2>
              <p className="text-base leading-relaxed text-[#1A1A1A]">
                Teams outgrow generic tools when consent, payments, and clinical evidence sit in different
                places. The result is slower bookings, weaker compliance confidence, and fragile patient
                communication.
              </p>
            </div>
            <div className="rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] p-6 shadow-sm md:p-8">
              <h2 className="mb-3 text-lg font-semibold text-[#111111]">What Changes With Consentz</h2>
              <p className="text-base leading-relaxed text-[#1A1A1A]">
                Consentz is built as an operating layer for clinics: structured consent, workflow automation,
                and reporting that maps to how regulated teams actually work day to day.
              </p>
            </div>
          </div>
        </section>

        <HubMainDifferenceSection competitorLabel={platform} />

        <HubComparisonTable />

        <section className="mb-16">
          <div className="mx-auto mb-6 max-w-[1120px] text-center">
            <h2 className="text-3xl font-bold leading-tight text-[#2e2e2e] md:text-[36px] md:leading-[44px]">
              Why Most Clinic Migrations Go Wrong
            </h2>
            <p className="mx-auto mt-4 max-w-[900px] text-left text-base leading-7 text-[#1a1a1a] md:text-center md:text-xl md:leading-7">
              Switching practice management software is one of the highest-risk moves a clinic can make.
              Here&apos;s what typically goes wrong — and why we built a better process.
            </p>
          </div>
          <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-5 md:grid-cols-2">
            {migratePainCards.map((card) => (
              <div
                key={card.title}
                className="flex flex-col gap-4 rounded-[14px] border border-[#e3dfd9] bg-[#f8f8f8] p-8 text-left"
              >
                <p className="text-2xl font-bold leading-7 text-[#2e2e2e]">{card.title}</p>
                <p className="text-xl font-medium leading-[26px] text-[#1a1a1a]">{card.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <a
              href={`${baseUrl}/book-demo`}
              className={HUB_CTA_PRIMARY_CLASS}
            >
              Book Demo
            </a>
          </div>
        </section>

        <section className="mb-16" aria-labelledby="migrate-progress-heading">
          <div className="mx-auto max-w-[920px] overflow-hidden rounded-2xl border border-[#E2DDD7] bg-white shadow-sm">
            <div className="border-b border-[#ECEAE6] bg-[#faf9f7] px-6 py-4">
              <p
                id="migrate-progress-heading"
                className="text-center text-sm font-semibold uppercase tracking-wide text-[#6B6B6B]"
              >
                Migration Progress
              </p>
              <p className="mt-1 text-center text-lg font-semibold text-[#111111]">
                What We Validate For Your {platform} Move
              </p>
            </div>
            <div className="divide-y divide-[#ECEAE6] px-4 py-2 md:px-6">
              {migrationProgressRows.map((row) => (
                <div
                  key={row}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <span className="min-w-0 shrink-0 text-base font-medium text-[#1a1a1a]">{row}</span>
                  <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-[360px]">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E8E6E2]">
                      <div className="h-full w-full rounded-full bg-[#2eb073]" />
                    </div>
                    <Check className="h-5 w-5 shrink-0 text-[#1a6e45]" strokeWidth={2.5} aria-hidden />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mx-auto mb-10 max-w-[900px] text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#111111] md:text-[34px]">
              Your Migration, Handled Start To Finish
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#6B6B6B] md:text-lg">
              A dedicated specialist, a written runbook, and an average of a few business days for structured
              moves — depending on data quality and sites.
            </p>
          </div>
          <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {migrationHandledSteps.map((step, i) => (
              <div
                key={step.title}
                className="flex flex-col rounded-xl border border-[#E2DDD7] bg-[#FAFAFA] p-5 text-left"
              >
                <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a1a] text-sm font-bold text-white">
                  {i + 1}
                </span>
                <p className="text-lg font-semibold text-[#111111]">{step.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#6B6B6B]">
                  {step.body.replace("{platform}", platform)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16 rounded-2xl border border-[#E2DDD7] bg-[#FAFAFA] px-6 py-10 md:px-12 md:py-12">
          <h2 className="mb-2 text-center text-3xl font-bold text-[#111111] md:text-[32px]">
            Everything Comes With You
          </h2>
          <p className="mx-auto mb-10 max-w-[720px] text-center text-base text-[#6B6B6B] md:text-lg">
            Typical datasets we map when you migrate from {platform}. Exact scope is confirmed on your audit
            call.
          </p>
          <div className="mx-auto grid max-w-[900px] grid-cols-1 gap-x-12 gap-y-3 sm:grid-cols-2">
            {everythingBrings.map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-base font-medium text-[#1a1a1a]">
                <Check className="h-5 w-5 shrink-0 text-[#1a6e45]" strokeWidth={2.5} aria-hidden />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-12 grid max-w-[960px] grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: "500+", label: "Clinics Migrated" },
              { value: "99.9%", label: "Data Accuracy Target" },
              { value: "3 days", label: "Typical Structured Move" },
              { value: "£0", label: "Migration Cost" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-[#E2DDD7] bg-white px-4 py-5 text-center"
              >
                <p className="text-3xl font-bold tracking-tight text-[#111111] md:text-4xl">{s.value}</p>
                <p className="mt-1 text-sm font-medium text-[#6B6B6B]">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16 w-full min-w-0 rounded-2xl border border-[#E2DDD7] bg-white px-4 py-10 text-center sm:px-6 md:px-12 md:py-14">
          <h2 className="text-2xl font-bold text-[#111111] md:text-3xl">
            We Have A Dedicated Migration Path For {platform}
          </h2>
          <p className="mx-auto mt-4 max-w-[640px] text-base leading-relaxed text-[#6B6B6B] md:text-lg">
            Your workspace is pre-configured for {platform}-style data shapes, consent artefacts, and booking
            patterns — so imports are predictable and inspection-friendly.
          </p>
          <div className="mx-auto mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-xl sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4 md:gap-8">
            <div className="w-full rounded-xl border-2 border-[#E2DDD7] bg-[#FAFAFA] px-6 py-4 text-center text-lg font-bold text-[#1a1a1a] sm:w-auto sm:px-8 sm:py-5 sm:text-xl">
              {platform}
            </div>
            <span className="text-center text-2xl font-light text-[#6B6B6B] sm:text-3xl" aria-hidden>
              →
            </span>
            <div className="w-full rounded-xl border-2 border-[#1a1a1a] bg-[#1a1a1a] px-6 py-4 text-center text-lg font-bold text-white sm:w-auto sm:px-8 sm:py-5 sm:text-xl">
              Consentz
            </div>
          </div>
          <div className="mt-10 flex justify-center">
            <a
              href={`${baseUrl}/book-demo`}
              className={HUB_CTA_PRIMARY_CLASS}
            >
              Get My Migration Guide
            </a>
          </div>
        </section>

        <HubTestimonialsSection title="What Clinics Say About Migrating" />

        <section className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-[#111111] md:text-3xl">
            Migration Guides By Platform
          </h2>
          <div className="mx-auto grid w-full min-w-0 max-w-[1072px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-[80px] w-full min-w-0 items-center justify-center rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] px-4 py-4 text-center text-base font-semibold text-[#111111] transition-colors hover:border-neutral-400 hover:bg-white sm:min-h-[93px] sm:px-5 sm:py-[18px] sm:text-lg md:text-xl"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <a
              href={`${baseUrl}/book-demo`}
              className={HUB_CTA_PRIMARY_CLASS}
            >
              Book Demo
            </a>
          </div>
        </section>
        <HubServiceProviderSection />

        <HubBuyerFaq
          title="Frequently Asked Questions"
          items={mapLegacyHubFaqs(faqs)}
        />

        <section className="mb-16 mx-auto max-w-[1280px] px-4 text-center md:text-left">
          <h2 className="mb-3 text-3xl font-bold text-[#111111] md:text-4xl">Our Latest Blogs</h2>
          <p className="mb-10 max-w-[1280px] text-xl leading-snug text-[#1A1A1A]">
            Explore insights and tips to help you manage and grow your aesthetics clinic efficiently. Stay
            informed with our latest articles.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {HUB_BLOG_LINKS.slice(0, 3).map((post) => (
              <a
                key={post.id}
                href={post.href}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col overflow-hidden rounded-2xl border border-[#DCDBD9] bg-[#FAFAFA] transition-shadow hover:shadow-md"
              >
                <div className="relative h-[200px] w-full overflow-hidden bg-[#E8E6E2]">
                  <Image
                    src={post.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="flex flex-col gap-4 px-5 py-5 pb-6">
                  <span className="text-[15px] leading-snug text-[#111111] underline underline-offset-2">
                    {post.title}
                  </span>
                  <span className="text-sm text-[#111111] underline underline-offset-2">
                    Read more →
                  </span>
                </div>
              </a>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <a
              href="https://www.consentz.com/blog/"
              target="_blank"
              rel="noreferrer"
              className={HUB_BTN_VIEW_ALL_BLOGS_CLASS}
            >
              View all blogs
            </a>
          </div>
        </section>

      </article>
      <HubSectionCta className="mb-0" withBorder={false} />
    </>
  );
}

export function isMigrateFromHubSlug(slug: string) {
  return slug.startsWith("from-");
}
