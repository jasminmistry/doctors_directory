import { HubBuyerFaq, mapLegacyHubFaqs } from "@/components/b2b-hub/hub-buyer-faq"
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
import { HubLogoStrip } from "@/components/b2b-hub/hub-logo-strip"
import Image from "next/image";
import Link from "next/link";
import { HubCompareFeatureTable } from "@/components/b2b-hub/hub-compare-feature-table";
import {
  ServiceProviderCollage,
  hubBuyerHubTestimonials,
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
import { alternativesHubNavLinks } from "@/lib/b2b-hub/alternatives-hub-nav-links";
import { compareSlugToCompetitorKey } from "@/lib/b2b-hub/compare-slug";
import { COMPETITOR_LABEL } from "@/lib/b2b-hub/competitors";
import type { HubEntry, HubSegment } from "@/lib/b2b-hub/registry";
import { segmentLabel } from "@/lib/b2b-hub/registry";
import { toDisplayTitle } from "@/lib/b2b-hub/text";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com";

const readyToSwitchSteps = [
  {
    title: "Book A Discovery Call",
    body: "We map your current stack, priorities, and what a clean switch looks like for patients and staff.",
  },
  {
    title: "Compare Workflows In Detail",
    body: "Walk through consent, bookings, evidence, and marketing so gaps are visible before you commit.",
  },
  {
    title: "Plan Data And Go-Live Windows",
    body: "Exports, validation, and cutover timing are agreed up front so the clinic does not go dark.",
  },
  {
    title: "Pilot With Your Front Desk Team",
    body: "Run real appointments in parallel where needed until everyone is confident.",
  },
  {
    title: "Go Live With Dedicated Support",
    body: "Launch on Consentz with engineers and success on hand for the first busy weeks.",
  },
] as const;

function comparePricingFaqs(competitorLabel: string) {
  return [
    {
      open: true,
      q: "How Is Consentz Priced Relative To Other Clinic Platforms?",
      a: `Pricing reflects governed consent, CQC-ready evidence, and automation depth — not just scheduling seats. On a short call we map your locations and modules so you only subscribe to what you operate.`,
    },
    {
      open: false,
      q: `Can We Evaluate Consentz Alongside ${competitorLabel}?`,
      a: "Yes. Many teams run a phased evaluation: align consent and compliance first, then widen scheduling, payments, and marketing once foundations are stable.",
    },
    {
      open: false,
      q: "Do Subscription Changes Affect Historical Consent And Audit Records?",
      a: "No. Historical consent artefacts, sends, and audit-relevant records remain available. Plan changes only affect what you can create or edit going forward.",
    },
  ] as const;
}

function CompareHeroPreviewCard({ competitorLabel }: { competitorLabel: string }) {
  const rows = [
    { feature: "Patient records", cz: "✓", alt: "Limited" },
    { feature: "Digital consent", cz: "✓", alt: "—" },
    { feature: "Marketing templates", cz: "✓", alt: "Limited" },
    { feature: "CQC compliance", cz: "✓", alt: "—" },
    { feature: "Email campaigns", cz: "✓", alt: "Limited" },
    { feature: "Treatment notes", cz: "✓", alt: "—" },
  ] as const;

  return (
    <div className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-[#e6e0d8] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#e6e0d8] bg-[#faf8f5] px-6 py-4">
        <span className="flex-1 text-[13px] font-semibold text-[#2e2e2e]">
          Feature Comparison
        </span>
        <span className="rounded bg-[#e0f1ed] px-2 py-1 text-[11px] font-semibold text-[#1a877a]">
          vs. {competitorLabel}
        </span>
      </div>
      <div className="flex items-center gap-0 bg-[#f2eee6] px-6 py-2.5 text-[11px] font-semibold text-[#928b82]">
        <span className="flex-1">Feature</span>
        <span className="flex h-7 w-[126px] shrink-0 items-center justify-center rounded-md bg-[#e0f1ed] text-[11px] font-semibold text-[#1a877a]">
          Consentz
        </span>
        <span className="flex h-7 w-[126px] shrink-0 items-center justify-center rounded-md bg-[#e6e0d8] text-[11px] font-semibold text-[#928b82]">
          {competitorLabel}
        </span>
      </div>
      {rows.map((r, i) => (
        <div
          key={r.feature}
          className={`flex items-center px-6 py-3 text-[13px] ${
            i % 2 === 1 ? "bg-[#faf8f5]" : "bg-white"
          }`}
        >
          <span className="flex-1 text-[#2e2e2e]">{r.feature}</span>
          <span className="flex w-[126px] shrink-0 justify-center text-sm font-semibold text-[#1a877a]">
            {r.cz}
          </span>
          <span className="flex w-[126px] shrink-0 justify-center text-xs text-[#928b82]">{r.alt}</span>
        </div>
      ))}
    </div>
  );
}

function PlatformCard() {
  const tags = [
    ["Patient Records", "Consent Forms"],
    ["Treatment Notes", "Marketing"],
    ["Email Campaigns", "CQC Compliance"],
  ] as const;
  return (
    <div className="w-full max-w-[460px] overflow-hidden rounded-2xl border border-[#e6e0d8] bg-white shadow-sm">
      <div className="flex items-center gap-2 bg-[#1a1a1a] px-6 py-3.5">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/90" aria-hidden />
        <span className="text-[13px] font-semibold text-white">Consentz Platform</span>
      </div>
      <div className="flex flex-col gap-2.5 p-6">
        {tags.map((pair) => (
          <div key={pair[0]} className="flex gap-2.5">
            {pair.map((label) => (
              <div
                key={label}
                className="flex flex-1 items-center justify-center rounded-lg border border-[#e6e0d8] bg-[#faf8f5] px-3.5 py-3 text-center text-xs font-semibold text-[#2e2e2e]"
              >
                {label}
              </div>
            ))}
          </div>
        ))}
        <div className="flex justify-center rounded-md bg-[#e0f1ed] px-3.5 py-2">
          <span className="text-xs font-semibold text-[#1a877a]">
            All connected in one platform
          </span>
        </div>
      </div>
    </div>
  );
}

function TemplateLibraryCard() {
  const items = [
    { label: "Carousels", highlight: true },
    { label: "Reels", highlight: false },
    { label: "Email Templates", highlight: false },
    { label: "Forms", highlight: false },
    { label: "SOPs & Policies", highlight: false },
    { label: "CQC", highlight: false },
  ] as const;
  return (
    <div className="w-full max-w-[460px] overflow-hidden rounded-2xl border border-[#e6e0d8] bg-white shadow-sm">
      <div className="flex items-center gap-2 bg-[#1a1a1a] px-6 py-3.5">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/90" aria-hidden />
        <span className="text-[13px] font-semibold text-white">Template Library</span>
      </div>
      <div className="flex flex-col gap-2.5 p-6">
        {items.map(({ label, highlight }) => (
          <div
            key={label}
            className={`flex items-center gap-2 rounded-md px-3 py-2.5 ${
              highlight ? "bg-[#e0f1ed]" : ""
            }`}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2e2e2e]/40" aria-hidden />
            <span
              className={`text-[13px] ${highlight ? "font-semibold text-[#1a877a]" : "font-normal text-[#2e2e2e]"}`}
            >
              {label}
            </span>
          </div>
        ))}
        <div className="rounded-md border border-[#e6e0d8] bg-[#faf8f5] px-3.5 py-2 text-center text-xs text-[#928b82]">
          48 clinic-ready templates
        </div>
      </div>
    </div>
  );
}

function CqcEvidenceCard() {
  const rows = [
    "Consent forms signed & stored",
    "Treatment notes completed",
    "Staff training records",
    "Risk assessments filed",
    "Patient communication logged",
  ] as const;
  return (
    <div className="w-full max-w-[460px] overflow-hidden rounded-2xl border border-[#e6e0d8] bg-white shadow-sm">
      <div className="flex items-center gap-2 bg-[#1a1a1a] px-6 py-3.5">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/90" aria-hidden />
        <span className="text-[13px] font-semibold text-white">CQC Evidence Overview</span>
      </div>
      <div className="flex flex-col gap-2.5 p-6">
        {rows.map((label, i) => (
          <div
            key={label}
            className={`flex items-center justify-between gap-2 rounded-md px-3.5 py-3 ${
              i % 2 === 0 ? "bg-[#faf8f5]" : "bg-white"
            }`}
          >
            <span className="flex items-center gap-2 text-[13px] text-[#2e2e2e]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2e2e2e]/35" aria-hidden />
              {label}
            </span>
            <span className="rounded bg-[#e0f1ed] px-2 py-0.5 text-[10px] font-semibold text-[#1a877a]">
              ✓
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type Props = {
  entry: HubEntry;
};

export function HubCompareDetailTemplate({ entry }: Props) {
  const seg = entry.segment as HubSegment;
  const compKey = compareSlugToCompetitorKey(entry.slug);
  const competitorLabel =
    (compKey && COMPETITOR_LABEL[compKey]) ||
    (compKey ? toDisplayTitle(compKey.replaceAll("-", " ")) : "Alternative Software");
  const intro =
    entry.summary ||
    `See how Consentz stacks up against ${competitorLabel} for records, consent, marketing, and compliance in one connected platform.`;
  const navLinks = compKey ? alternativesHubNavLinks(compKey) : alternativesHubNavLinks("pabau");
  const faqs = comparePricingFaqs(competitorLabel);

  return (
    <>
      <section className="w-full border-b border-[#E5E7EB] bg-[var(--primary-bg-color)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0">
          <div className="relative box-border overflow-hidden pt-8 pb-12 lg:grid lg:min-h-[480px] lg:max-h-[720px] lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:items-center lg:gap-x-12 lg:px-12 lg:py-16 xl:px-[120px]">
            <div className="relative z-10 flex min-w-0 flex-col items-start justify-center lg:min-h-0 lg:pr-2">
              <Breadcrumb className="mb-6 flex justify-start">
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
                <h1 className="mb-5 max-w-[720px] text-[clamp(1.75rem,5vw,3.25rem)] font-medium leading-[1.08] tracking-[0.468px] text-[#2e2e2e] [font-family:var(--font-playfair),Georgia,serif] lg:text-[52px] lg:leading-[60px]">
                  {toDisplayTitle(entry.title)}
                </h1>
                <p className="mb-9 max-w-[720px] text-lg font-medium leading-[1.65] text-[#1a1a1a] [font-family:Inter,system-ui,sans-serif] lg:text-2xl">
                  {intro}
                </p>
                <div className="flex max-sm:flex-col max-sm:items-stretch gap-3 sm:flex-row sm:flex-nowrap sm:items-center sm:gap-4">
                  <a
                    href={`${baseUrl}/book-demo`}
                    className={HUB_CTA_PRIMARY_HERO_CLASS}
                  >
                    Book A Demo
                  </a>
                  <a
                    href="#feature-comparison"
                    className={HUB_CTA_SECONDARY_HERO_CLASS}
                  >
                    Compare Features
                  </a>
                </div>
              </header>
            </div>
            <div
              className="relative z-0 mt-10 flex w-full min-w-0 justify-center lg:mt-0 lg:justify-end"
              aria-hidden
            >
              <CompareHeroPreviewCard competitorLabel={competitorLabel} />
            </div>
          </div>
        
        <HubLogoStrip />
</div>
      </section>

      <article className="mx-auto max-w-[1280px] px-4 pb-0 pt-8 md:pt-10 [font-family:Inter,system-ui,sans-serif]">
        <HubMainDifferenceSection competitorLabel={competitorLabel} />

        <section className="mb-16">
          <div className="mx-auto grid max-w-[1072px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-[93px] items-center justify-center rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] px-5 py-[18px] text-center text-xl font-semibold text-[#111111] transition-colors hover:border-neutral-400 hover:bg-white"
              >
                <span className="line-clamp-3">{item.label}</span>
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

        <HubCompareFeatureTable id="feature-comparison" competitorLabel={competitorLabel} />

        <section className="mb-20">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-[#111111] md:text-4xl">
            Ready To Switch To Consentz?
          </h2>
          <ol className="mx-auto grid max-w-[900px] list-none gap-6">
            {readyToSwitchSteps.map((step, idx) => (
              <li
                key={step.title}
                className="flex gap-5 rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] p-6 md:p-8"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-lg font-bold text-white">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-[#111111]">{step.title}</h3>
                  <p className="text-base leading-relaxed text-[#1A1A1A]">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-20">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
            <div className="min-w-0 max-w-[640px] flex-1">
              <h2 className="mb-6 text-3xl font-semibold leading-tight text-[#1a1a1a] md:text-4xl">
                All-In-One Clinic Operations Vs Disconnected Tools
              </h2>
              <p className="mb-5 text-lg leading-relaxed text-[#1a1a1a] md:text-xl md:leading-[26px]">
                Consentz brings records, consent, workflows, communication, and compliance into one
                connected platform.
              </p>
              <p className="text-lg leading-relaxed text-[#1a1a1a] md:text-xl md:leading-[26px]">
                Alternative tools often solve one part of the clinic workflow, leaving teams to
                manage the rest across spreadsheets, folders, and separate platforms.
              </p>
            </div>
            <PlatformCard />
          </div>
        </section>

        <section className="mb-20">
          <div className="mx-auto flex max-w-[1200px] flex-col-reverse items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
            <TemplateLibraryCard />
            <div className="min-w-0 max-w-[640px] flex-1">
              <h2 className="mb-6 text-3xl font-semibold leading-tight text-[#1a1a1a] md:text-4xl md:leading-[36px]">
                Marketing Independence With A Built-In Template Library
              </h2>
              <p className="mb-5 text-lg leading-snug text-[#1a1a1a] md:text-xl">
                Consentz includes clinic-ready templates, email campaigns, website tools, and
                patient communication workflows to support independent growth.
              </p>
              <p className="text-lg leading-snug text-[#1a1a1a] md:text-xl">
                Many alternatives rely on limited marketing features or external platforms, making
                it harder to build consistent clinic communication.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
            <div className="min-w-0 max-w-[640px] flex-1">
              <h2 className="mb-6 text-3xl font-semibold leading-tight text-[#1a1a1a] md:text-4xl md:leading-[36px]">
                Compliance Workflows Designed For Real Clinical Evidence
              </h2>
              <p className="mb-5 text-lg leading-relaxed text-[#1a1a1a] md:text-xl md:leading-[26px]">
                Consentz helps clinics organise consent forms, treatment records, policies, CQC
                evidence, and follow-up activity in one place.
              </p>
              <p className="text-lg leading-snug text-[#1a1a1a] md:text-xl md:leading-[21px]">
                Generic booking or CRM tools often require clinics to manage compliance evidence
                manually across files, folders, and disconnected systems.
              </p>
            </div>
            <CqcEvidenceCard />
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-[#111111] md:text-3xl">
            What Clinics Say About Consentz
          </h2>
          <div className="mx-auto grid max-w-[1224px] grid-cols-1 gap-5 md:grid-cols-3">
            {hubBuyerHubTestimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col gap-4 rounded-[19px] border border-[#E6E0D8] bg-[#FAF8F5] p-7 md:p-8"
              >
                <div className="flex gap-0.5 text-[#2E2E2E]" aria-hidden>
                  {"★★★★★".split("").map((s, i) => (
                    <span key={i} className="text-sm">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="flex-1 text-xl leading-snug tracking-tight text-[#2E2E2E]">{t.quote}</p>
                <div className="h-px bg-[#E1DCD5]" />
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D8D4CE] text-[10px] font-semibold tracking-wide text-[#7A7570]">
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#2E2E2E]">{t.name}</p>
                    <p className="text-[11px] leading-snug text-[#928B82]">{t.role}</p>
                  </div>
                </div>
                <span className="inline-flex w-fit items-center rounded-md bg-[#EDE9E3] px-2 py-1 text-[9px] font-medium tracking-wide text-[#5C564E]">
                  ↑ {t.tag}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16 w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 bg-[var(--primary-bg-color)] lg:h-[302px] lg:overflow-hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:py-12 lg:h-full lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-0 lg:pl-20 lg:pr-6">
            <div className="flex min-w-0 max-w-[629px] flex-col gap-2 lg:max-h-[302px] lg:gap-3 lg:py-1">
              <h2 className="text-[26px] font-semibold leading-[1.1] text-[#1A1A1A] sm:text-[30px] lg:text-[36px] lg:leading-[1.08]">
                Are You A Service Provider?
              </h2>
              <p className="text-base font-medium leading-snug text-[#1A1A1A] sm:text-lg lg:text-[20px] lg:leading-normal">
                Join Consentz to streamline your clinic operations, enhance patient experience, and
                grow your business.
              </p>
              <div className="pt-3 lg:pt-2">
                <a
                  href={`${baseUrl}/book-demo`}
                  className={HUB_CTA_PRIMARY_CLASS}
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="relative mx-auto h-[220px] w-full max-w-[400px] overflow-hidden sm:h-[260px] sm:max-w-[440px] lg:mx-0 lg:ml-auto lg:mr-0 lg:h-full lg:max-h-[302px] lg:w-[min(46vw,560px)] lg:max-w-[560px] lg:shrink-0">
              <ServiceProviderCollage />
            </div>
          </div>
        </section>

        <HubBuyerFaq
          title="Pricing And Subscription Questions"
          items={mapLegacyHubFaqs(faqs)}
        />

        <section className="mb-16 mx-auto max-w-[1280px]">
          <h2 className="mb-3 text-3xl font-bold text-[#111111] md:text-4xl">Our Latest Blogs</h2>
          <p className="mb-10 max-w-[1280px] text-xl leading-snug text-[#1A1A1A]">
            Explore insights and tips to help you manage and grow your aesthetics clinic efficiently.
            Stay informed with our latest articles.
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
              View All Blogs
            </a>
          </div>
        </section>

      </article>
      <HubSectionCta className="mb-0" withBorder={false} />
    </>
  );
}
