import { HubBuyerFaq, mapLegacyHubFaqs } from "@/components/b2b-hub/hub-buyer-faq"
import {
  HUB_CTA_PRIMARY_CLASS,
  HUB_CTA_PRIMARY_HERO_CLASS,
  HUB_CTA_SECONDARY_CLASS,
  HUB_CTA_SECONDARY_HERO_CLASS,
  HUB_CTA_LINK_CLASS,
} from "@/components/b2b-hub/hub-cta-buttons"
import { HUB_BTN_VIEW_ALL_BLOGS_CLASS } from "@/components/b2b-hub/hub-marketing-typography"
import { HubLogoStrip } from "@/components/b2b-hub/hub-logo-strip"
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  FileWarning,
  Layers,
  Mail,
  Table2,
  UserRound,
} from "lucide-react";
import { HubComparisonTable } from "@/components/b2b-hub/hub-comparison-table";
import {
  ServiceProviderCollage,
  SoftwareHeroCollage,
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
import { COMPETITOR_LABEL } from "@/lib/b2b-hub/competitors";
import type { HubEntry, HubSegment } from "@/lib/b2b-hub/registry";
import { segmentLabel } from "@/lib/b2b-hub/registry";
import { toDisplayTitle } from "@/lib/b2b-hub/text";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com";

const SOFTWARE_LAPTOP_MOCKUP_SRC = "/directory/images/software-laptop-mockup.svg";
const CTA_CLINIC_PHONE_SRC = "/directory/images/cta-clinic-phone.png";

const alternativesPainPoints = [
  {
    Icon: FileWarning,
    text: "Paper consent forms get lost — creating direct CQC risk",
  },
  {
    Icon: UserRound,
    text: "Patients aren’t reactivated after treatment",
  },
  {
    Icon: Table2,
    text: "CQC evidence scattered across spreadsheets",
  },
  {
    Icon: CalendarDays,
    text: "Booking software doesn’t handle compliance requirements",
  },
  {
    Icon: Mail,
    text: "No automated follow-up or aftercare workflows",
  },
  {
    Icon: Layers,
    text: "Clinic data siloed across too many disconnected tools",
  },
] as const;

function alternativesFaqCopy(competitorLabel: string) {
  return [
    {
      open: true,
      q: `Is Consentz a direct ${competitorLabel} replacement?`,
      a: `Consentz is strongest where regulated clinics need governed consent, CQC-ready evidence, and automation tied to the patient record. ${competitorLabel} is often stronger on general booking and front-desk scheduling. Many teams use a phased approach: align consent and compliance first, then deepen scheduling and payments.`,
    },
    {
      open: false,
      q: `Can I keep my existing patient data when switching from ${competitorLabel}?`,
      a: "Yes, in most cases core patient and appointment data can be migrated or connected. On a demo we map what transfers cleanly, what needs restructuring, and how to avoid disruption to live clinics.",
    },
    {
      open: false,
      q: `How long does migration from ${competitorLabel} take?`,
      a: "Timelines depend on data quality and how many workflows you move first. A common pattern is weeks for consent and evidence, with wider scheduling and payments following once foundations are stable.",
    },
  ] as const;
}

type Props = {
  entry: HubEntry;
};

export function HubAlternativesDetailTemplate({ entry }: Props) {
  const seg = entry.segment as HubSegment;
  const competitorSlug = entry.slug;
  const competitorLabel = COMPETITOR_LABEL[competitorSlug] ?? toDisplayTitle(competitorSlug);
  const intro =
    entry.summary ||
    `How clinics evaluate Consentz against ${competitorLabel} for operations, compliance, and growth.`;
  const navLinks = alternativesHubNavLinks(competitorSlug);
  const faqs = alternativesFaqCopy(competitorLabel);

  return (
    <>
      <section className="w-full border-b border-[#E5E7EB] bg-[var(--primary-bg-color)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0">
          <div className="relative box-border overflow-hidden pt-8 pb-12 lg:grid lg:h-[562px] lg:min-h-[562px] lg:max-h-[562px] lg:grid-cols-2 lg:items-stretch lg:gap-12 lg:px-0 lg:py-0">
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
                <h1 className="mb-5 max-w-[700px] text-[clamp(1.75rem,5vw,3.25rem)] font-medium leading-[1.08] tracking-[0.468px] text-[#1A1A1A] [font-family:var(--font-playfair),Georgia,serif] lg:text-[52px]">
                  {toDisplayTitle(entry.title)}
                </h1>
                <p className="mb-9 max-w-[700px] text-lg font-medium leading-[1.65] text-[#1A1A1A] [font-family:Inter,system-ui,sans-serif] lg:text-2xl">
                  {intro}
                </p>
                <div className="flex max-sm:flex-col max-sm:items-stretch gap-3 sm:flex-row sm:flex-nowrap sm:items-center sm:gap-2.5 sm:overflow-x-auto">
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
                  <a
                    href={`${baseUrl}/book-demo`}
                    className={HUB_CTA_LINK_CLASS}
                  >
                    See How It Works →
                  </a>
                </div>
              </header>
            </div>
            <div
              className="relative z-0 mt-8 flex h-[260px] w-full min-w-0 justify-center overflow-hidden sm:h-[300px] lg:mt-0 lg:h-full lg:justify-end"
              aria-hidden
            >
              <div className="relative h-full w-full min-h-[220px] max-w-[720px] lg:max-w-none">
                <SoftwareHeroCollage />
              </div>
            </div>
          </div>
        
        <HubLogoStrip />
</div>
      </section>

      <article className="mx-auto max-w-[1280px] px-4 pb-0 pt-8 md:pt-10 [font-family:Inter,system-ui,sans-serif]">
        <section className="mb-12">
          <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] p-6 shadow-sm md:p-8">
              <h2 className="mb-3 text-lg font-semibold text-[#111111]">Operational Reality</h2>
              <p className="text-base leading-relaxed text-[#1A1A1A]">
                Teams outgrow generic tools when consent, payments, and clinical evidence sit
                in different places. The result is slower bookings, weaker compliance
                confidence, and fragile patient communication.
              </p>
            </div>
            <div className="rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] p-6 shadow-sm md:p-8">
              <h2 className="mb-3 text-lg font-semibold text-[#111111]">What Changes With Consentz</h2>
              <p className="text-base leading-relaxed text-[#1A1A1A]">
                Consentz is built as an operating layer for clinics: structured consent,
                workflow automation, and reporting that maps to how regulated teams actually
                work day to day.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-[-0.02em] text-[#111111] md:mb-10 md:text-4xl">
            The Problem With Most Clinic Software
          </h2>
          <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-6 md:grid-cols-2">
            {alternativesPainPoints.map(({ Icon, text }) => (
              <div
                key={text}
                className="flex min-h-[88px] items-center gap-6 rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] py-[15px] pl-6 pr-4"
              >
                <Icon
                  className="h-12 w-12 shrink-0 text-[#1A1A1A]"
                  strokeWidth={1.25}
                  aria-hidden
                />
                <p className="text-lg font-medium leading-[1.45] text-[#1A1A1A] md:text-xl">
                  {text}
                </p>
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

        <div className="mx-auto mb-6 max-w-[900px] text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-[-0.02em] text-[#111111]">
            {competitorLabel} vs Consentz
          </h2>
          <p className="text-xl font-normal leading-[1.6] text-[#1A1A1A] md:text-2xl">
            No bolt-on integrations. No compliance gaps. No switching between tools.
          </p>
        </div>

        <HubComparisonTable variant="alternatives" competitorName={competitorLabel} />

        <section className="mb-16">
          <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="min-w-0">
              <h2 className="mb-4 text-[28px] font-bold tracking-tight text-[#111111] md:text-[34px]">
                Migrating from {competitorLabel}?
              </h2>
              <p className="mb-8 text-base leading-relaxed text-[#1A1A1A] md:text-lg">
                We support migrations from {competitorLabel}. Book a demo and we will explain
                the process, what data transfers, and how we handle the transition without
                disrupting your clinic.
              </p>
              <a
                href={`${baseUrl}/book-demo`}
                className={HUB_CTA_PRIMARY_CLASS}
              >
                Book Demo
              </a>
            </div>
            <div className="flex justify-center lg:justify-end">
              <Image
                src={SOFTWARE_LAPTOP_MOCKUP_SRC}
                alt=""
                width={640}
                height={340}
                className="h-auto w-full max-w-[560px] object-contain"
                loading="lazy"
                unoptimized
              />
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mx-auto grid max-w-[1072px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-[93px] items-center justify-center rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] px-5 py-[18px] text-center text-xl font-semibold text-[#111111] hover:border-neutral-400 hover:bg-white transition-colors"
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

        <section className="mb-16">
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
                <p className="flex-1 text-xl leading-snug tracking-tight text-[#2E2E2E]">
                  {t.quote}
                </p>
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
                Join Consentz to streamline your clinic operations, enhance patient experience,
                and grow your business.
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
          title="Frequently Asked Questions"
          items={mapLegacyHubFaqs(faqs)}
        />

        <section className="mb-16 mx-auto max-w-[1280px]">
          <h2 className="mb-3 text-3xl font-bold text-[#111111] md:text-4xl">Our Latest Blogs</h2>
          <p className="mb-10 max-w-[1280px] text-xl leading-snug text-[#1A1A1A]">
            Explore insights and tips to help you manage and grow your aesthetics clinic
            efficiently. Stay informed with our latest articles.
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

        <section className="mb-0 w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 overflow-hidden bg-[var(--primary-bg-color)]">
          <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-8 sm:pb-14 sm:pt-10 lg:h-[472px] lg:overflow-hidden lg:px-20 lg:pb-20 lg:pt-0">
            <div className="relative z-10 flex w-full max-w-[720px] flex-col items-center text-center lg:absolute lg:left-1/2 lg:top-[118px] lg:-translate-x-1/2">
              <h2 className="text-[26px] font-bold leading-tight tracking-[-0.03em] text-[#111111] sm:text-[30px] lg:text-[36px] lg:leading-normal lg:tracking-[-1.08px]">
                Ready to run your clinic properly?
              </h2>
              <p className="mt-3 max-w-xl text-base leading-[1.6] text-[#1A1A1A] sm:text-lg lg:mt-[14px] lg:text-[20px]">
                Join aesthetic clinics across the UK using Consentz
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={`${baseUrl}/book-demo`}
                  className={HUB_CTA_PRIMARY_CLASS}
                >
                  Book a Demo
                </a>
                <a
                  href={`${baseUrl}/book-demo`}
                  className="inline-flex items-center justify-center rounded-[12px] border-[1.5px] border-[#E2DDD7] bg-white px-6 py-[13px] text-sm font-medium text-[#111111] transition-colors hover:bg-neutral-50"
                >
                  Get CQC Readiness Audit
                </a>
              </div>
            </div>
            <div
              className="relative z-0 mx-auto mt-8 h-[200px] w-[174px] overflow-hidden sm:h-[220px] sm:w-[191px] lg:absolute lg:mx-0 lg:mt-0 lg:h-[469px] lg:w-[407px] lg:max-w-none lg:right-20 lg:top-[41px]"
              aria-hidden
            >
              <Image
                src={CTA_CLINIC_PHONE_SRC}
                alt=""
                width={586}
                height={731}
                className="pointer-events-none absolute max-w-none select-none"
                sizes="(max-width: 1024px) 191px, 407px"
                style={{
                  height: "156.09%",
                  width: "144.06%",
                  left: "-15.65%",
                  top: "-7.82%",
                }}
              />
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
