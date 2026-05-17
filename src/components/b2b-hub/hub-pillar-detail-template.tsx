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
import { HubDetailHeroShell } from "@/components/b2b-hub/hub-detail-hero-shell";
import { HubContentStart } from "@/components/b2b-hub/hub-content-start";
import { HubSectionCta } from "@/components/b2b-hub/hub-section-cta";
import {
  HUB_HERO_INTRO_CLASS,
  HUB_HERO_TITLE_CLASS,
} from "@/components/b2b-hub/hub-hero-typography";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { HUB_BLOG_LINKS, HUB_CQC_GUIDE_LINKS } from "@/lib/b2b-hub/hub-blog-links";
import type { HubEntry, HubSegment } from "@/lib/b2b-hub/registry";
import { segmentLabel } from "@/lib/b2b-hub/registry";
import { toDisplayTitle } from "@/lib/b2b-hub/text";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com";

const SOFTWARE_LAPTOP_MOCKUP_SRC = "/directory/images/software-laptop-mockup.svg";
const CTA_CLINIC_PHONE_SRC = "/directory/images/cta-clinic-phone.png";

const PHONE_FAN_BOUNDS = { w: 915.348, h: 846.025 } as const;

const SOFTWARE_HERO_LAYERS = [
  { src: "/directory/images/software-hero-phones/hero-1.png", l: 473.56, t: 0 },
  { src: "/directory/images/software-hero-phones/hero-2.png", l: 578.09, t: 101.42 },
  { src: "/directory/images/software-hero-phones/hero-3.png", l: 273.84, t: 245.73 },
  { src: "/directory/images/software-hero-phones/hero-4.png", l: 168.54, t: 144.32 },
  { src: "/directory/images/software-hero-phones/hero-5.png", l: 379.16, t: 347.15 },
  { src: "/directory/images/software-hero-phones/hero-1.png", l: 0, t: 454.71 },
  { src: "/directory/images/software-hero-phones/hero-2.png", l: 108.47, t: 557.33 },
] as const;

const SERVICE_PROVIDER_COLLAGE = {
  w: PHONE_FAN_BOUNDS.w,
  h: PHONE_FAN_BOUNDS.h,
  layers: [
    { src: "/directory/images/service-provider-collage/phone-1.png", l: 473.56, t: 0 },
    { src: "/directory/images/service-provider-collage/phone-2.png", l: 578.09, t: 101.42 },
    { src: "/directory/images/service-provider-collage/phone-3.png", l: 273.84, t: 245.73 },
    { src: "/directory/images/service-provider-collage/phone-4.png", l: 168.54, t: 144.32 },
    { src: "/directory/images/service-provider-collage/phone-5.png", l: 379.16, t: 347.15 },
    { src: "/directory/images/service-provider-collage/phone-1.png", l: 0, t: 454.71 },
    { src: "/directory/images/service-provider-collage/phone-2.png", l: 108.47, t: 557.33 },
  ] as const,
} as const;

export const hubBuyerHubTestimonials = [
  {
    quote: "Consentz transformed how we handle patient consent.",
    name: "Sarah Mitchell",
    role: "Clinic Director · Clarity Aesthetics, London",
    initials: "SM",
    tag: "Inspection-ready workflows",
  },
  {
    quote:
      "We cut our admin time by nearly 40%. The automated reminders and digital consent flow means our team focuses on patients.",
    name: "Dr. James Okafor",
    role: "Medical Director · Revive Clinic Group",
    initials: "JO",
    tag: "Reduced admin workload",
  },
  {
    quote:
      "Patient follow-up used to be a manual headache. Consentz handles it automatically.",
    name: "Priya Sharma",
    role: "Practice Manager · Luminary Medical Aesthetics",
    initials: "PS",
    tag: "Faster patient follow-up",
  },
] as const;

const testimonials = hubBuyerHubTestimonials;

const softwarePainPoints = [
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

const cqcPainPoints = [
  {
    Icon: FileWarning,
    text: "Evidence lives across drives, paper, and tools — not one consistent audit trail",
  },
  {
    Icon: UserRound,
    text: "Training and competency proof is hard to evidence consistently across teams",
  },
  {
    Icon: Table2,
    text: "Inspectors ask for samples that take days to locate when records are siloed",
  },
  {
    Icon: CalendarDays,
    text: "Inspection readiness becomes a sprint instead of continuous operational practice",
  },
  {
    Icon: Mail,
    text: "Governance updates do not reach front-desk workflows in a traceable way",
  },
  {
    Icon: Layers,
    text: "Policies exist on paper while day-to-day practice is difficult to demonstrate",
  },
] as const;

const CQC_HUB = "/directory/images/cqc-hub";
/** Figma node 4196:21271 — MacBook + domain card + floats as one raster */
const CQC_HERO_GROUP = `${CQC_HUB}/cqc-hero-group.png`;
const CQC_MID_DOMAINS = `${CQC_HUB}/mid-domains.png`;
const CQC_MID_CARING = `${CQC_HUB}/mid-caring.png`;
const CQC_MID_HEATMAP = `${CQC_HUB}/mid-heatmap.png`;

const cqcEvidenceChecklist = [
  "Consent records with digital signatures",
  "Training and CPD records per practitioner",
  "Safeguarding evidence and documentation",
  "Medicines management records",
  "Infection control evidence",
  "Complaints handling log",
  "CQC audit trail per patient",
  "Inspection readiness score",
] as const;

function PhoneFanCollage({
  layers,
}: {
  layers: readonly { readonly src: string; readonly l: number; readonly t: number }[];
}) {
  const { w, h } = PHONE_FAN_BOUNDS;
  const cellW = (337.258 / w) * 100;
  const cellH = (288.695 / h) * 100;
  return (
    <div className="relative h-full w-full overflow-hidden" aria-hidden>
      <div className="absolute left-1/2 top-1/2 w-[min(122%,640px)] max-w-[130%] -translate-x-1/2 -translate-y-1/2 aspect-[915/846]">
        <div className="absolute inset-0">
          {layers.map(({ src, l, t }, i) => (
            <div
              key={`${src}-${i}`}
              className="absolute flex items-center justify-center"
              style={{
                left: `${(l / w) * 100}%`,
                top: `${(t / h) * 100}%`,
                width: `${cellW}%`,
                height: `${cellH}%`,
                zIndex: i,
              }}
            >
              <div
                className="relative overflow-hidden rounded-[7.66px] shadow-[0_14px_32px_rgba(0,0,0,0.14)]"
                style={{
                  width: "40%",
                  aspectRatio: "136.646 / 307.654",
                  transform: "rotate(44deg) skewX(-6.96deg) scaleY(0.99)",
                }}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="120px"
                  priority={i === 0}
                  loading={i === 0 ? undefined : "lazy"}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SoftwareHeroCollage() {
  return <PhoneFanCollage layers={SOFTWARE_HERO_LAYERS} />;
}

export function ServiceProviderCollage() {
  return <PhoneFanCollage layers={SERVICE_PROVIDER_COLLAGE.layers} />;
}

function CqcHeroVisual() {
  return (
    <div
      className="relative z-0 mt-8 flex min-h-0 w-full min-w-0 items-center justify-center lg:mt-0 lg:h-full lg:w-full lg:flex-1 lg:items-center lg:justify-end lg:pr-4 xl:pr-8"
      aria-hidden
    >
      <Image
        src={CQC_HERO_GROUP}
        alt=""
        width={580}
        height={372}
        className="h-auto w-full max-w-[min(100%,640px)] object-contain"
        priority
        sizes="(max-width: 1024px) 100vw, 640px"
      />
    </div>
  );
}

const cqcReadinessScores = [
  {
    pct: "100%",
    label: "Consent records",
    pctColor: "text-[#1a6e45]",
    barClass: "w-full bg-[#2eb073]",
  },
  {
    pct: "87%",
    label: "Training records",
    pctColor: "text-[#99730d]",
    barClass: "w-[87%] bg-[#eaa81e]",
  },
  {
    pct: "92%",
    label: "Safeguarding evidence",
    pctColor: "text-[#99730d]",
    barClass: "w-[92%] bg-[#2eb073]",
  },
  {
    pct: "100%",
    label: "Complaints log",
    pctColor: "text-[#1a6e45]",
    barClass: "w-full bg-[#2eb073]",
  },
] as const;

function CqcDashboardBrowserMock() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E2DDD7] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3 bg-[#19191c] px-5 py-4">
        <span className="h-3 w-3 shrink-0 rounded-full bg-[#ff5f56]" />
        <span className="h-3 w-3 shrink-0 rounded-full bg-[#ffbd2e]" />
        <span className="h-3 w-3 shrink-0 rounded-full bg-[#27c93f]" />
        <div className="ml-2 min-w-0 flex-1 rounded-md bg-[#232327] px-4 py-2">
          <p className="truncate text-[15px] text-[#9b9b9b]">
            CQC Evidence Dashboard — Consentz
          </p>
        </div>
      </div>
      <div className="bg-[#f8f7f5] px-6 pb-8 pt-7 md:px-8 md:pb-10 md:pt-8">
        <p className="text-[17px] font-semibold text-[#111111]">CQC Inspection Readiness</p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cqcReadinessScores.map((row) => (
            <div
              key={row.label}
              className="flex flex-col rounded-xl border border-[#E2DDD7] bg-white p-5"
            >
              <p
                className={`text-[34px] font-bold leading-none tracking-[-0.68px] ${row.pctColor}`}
              >
                {row.pct}
              </p>
              <p className="mt-2 text-sm text-[#6B6B6B]">{row.label}</p>
              <div className="mt-4 h-[6px] w-full overflow-hidden rounded-full bg-[#E2DDD7]">
                <div className={`h-full rounded-full ${row.barClass}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CqcEvidenceChecklist() {
  return (
    <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-2.5">
      {cqcEvidenceChecklist.map((label) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-xl border border-transparent bg-[#eef7f2] px-[18px] py-[14px]"
        >
          <span className="shrink-0 text-sm font-bold text-[#1a6e45]">✓</span>
          <p className="text-base font-medium text-[#1a1a1a] md:text-[20px]">{label}</p>
        </div>
      ))}
    </div>
  );
}

function HubRelatedLinksGrid({ related }: { related: HubEntry[] }) {
  return (
    <section className="mb-16">
      <div className="mx-auto grid max-w-[1072px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((r) => (
          <Link
            key={`${r.segment}-${r.slug}`}
            href={`/business/${r.segment}/${r.slug}/`}
            className="flex min-h-[93px] items-center justify-center rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] px-5 py-[18px] text-center text-xl font-semibold text-[#111111] hover:border-neutral-400 hover:bg-white transition-colors"
          >
            {toDisplayTitle(r.title)}
          </Link>
        ))}
      </div>
    </section>
  );
}

export type HubPillar = "software" | "cqc";

export type HubPillarDetailTemplateProps = {
  entry: HubEntry;
  related: HubEntry[];
  pillar: HubPillar;
};

export function HubPillarDetailTemplate({
  entry,
  related,
  pillar,
}: HubPillarDetailTemplateProps) {
  const seg = entry.segment as HubSegment;
  const intro =
    entry.summary ||
    `${toDisplayTitle(entry.title)}: guidance for clinic operators evaluating software and workflows.`;
  const activePainPoints = pillar === "cqc" ? cqcPainPoints : softwarePainPoints;
  const problemSectionTitle =
    pillar === "cqc"
      ? "The Problem With Most CQC Evidence Workflows"
      : "The Problem With Most Clinic Software";

  const breadcrumb = (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/business/">Buyer Hub</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href={`/business/${seg}/`}>{segmentLabel(seg)}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="line-clamp-1">{toDisplayTitle(entry.title)}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )

  return (
    <>
      <HubDetailHeroShell
        breadcrumb={breadcrumb}
        title={<h1 className={HUB_HERO_TITLE_CLASS}>{toDisplayTitle(entry.title)}</h1>}
        intro={<p className={HUB_HERO_INTRO_CLASS}>{intro}</p>}
        actions={
          <>
            <a
              href={`${baseUrl}/book-demo`}
              className="inline-flex h-[52px] w-[208px] shrink-0 items-center justify-center rounded-[7px] bg-[#1A1A1A] px-6 text-[20px] font-semibold text-white hover:bg-neutral-900 transition-colors"
            >
              Book A Demo
            </a>
            <a
              href={`${baseUrl}/book-demo`}
              className="inline-flex shrink-0 items-center justify-center rounded-[7px] border-[1.5px] border-[#E2DDD7] bg-white px-6 py-[13px] text-[20px] font-medium text-[#111111] hover:bg-neutral-50 transition-colors whitespace-nowrap"
            >
              Get CQC Readiness Audit
            </a>
            {pillar === "software" ? (
              <a
                href={`${baseUrl}/book-demo`}
                className="inline-flex shrink-0 items-center justify-center px-1 py-[13px] text-[20px] font-medium text-[#6B6B6B] hover:text-neutral-900 transition-colors whitespace-nowrap"
              >
                See How It Works →
              </a>
            ) : null}
          </>
        }
        visual={
          pillar === "cqc" ? (
            <CqcHeroVisual />
          ) : (
            <div className="relative h-full w-full min-h-[200px] max-w-[360px] lg:max-w-[400px]">
              <SoftwareHeroCollage />
            </div>
          )
        }
        visualAlign={pillar === "cqc" ? "wide" : "phone"}
      />

      <HubContentStart>
        {pillar === "cqc" ? (
          <section className="mb-16">
            <h2 className="text-center text-[30px] font-bold tracking-[-0.02em] text-[#111111] md:text-[36px] md:tracking-[-0.72px]">
              CQC Evidence Dashboard
            </h2>
            <div className="mx-auto mt-10 max-w-[920px]">
              <CqcDashboardBrowserMock />
            </div>
            <h2 className="mb-10 mt-16 text-center text-[30px] font-bold tracking-[-0.02em] text-[#111111] md:text-[36px] md:tracking-[-0.72px]">
              What the CQC dashboard covers
            </h2>
            <CqcEvidenceChecklist />
          </section>
        ) : null}
        <section className="mb-12">
          <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-[#111111] mb-3">
                Operational Reality
              </h2>
              <p className="text-base leading-relaxed text-[#1A1A1A]">
                Teams outgrow generic tools when consent, payments, and clinical evidence
                sit in different places. The result is slower bookings, weaker compliance
                confidence, and fragile patient communication.
              </p>
            </div>
            <div className="rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-[#111111] mb-3">
                What Changes With Consentz
              </h2>
              <p className="text-base leading-relaxed text-[#1A1A1A]">
                Consentz is built as an operating layer for clinics: structured consent,
                workflow automation, and reporting that maps to how regulated teams actually
                work day to day.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-[#111111] tracking-[-0.02em] mb-8 md:mb-10">
            {problemSectionTitle}
          </h2>
          <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-6 md:grid-cols-2">
            {activePainPoints.map(({ Icon, text }) => (
              <div
                key={text}
                className="flex min-h-[88px] items-center gap-6 rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] py-[15px] pl-6 pr-4"
              >
                <Icon
                  className="h-12 w-12 shrink-0 text-[#1A1A1A]"
                  strokeWidth={1.25}
                  aria-hidden
                />
                <p className="text-lg md:text-xl font-medium leading-[1.45] text-[#1A1A1A]">
                  {text}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <a
              href={`${baseUrl}/book-demo`}
              className="inline-flex h-[52px] w-[208px] items-center justify-center rounded-xl bg-[#1A1A1A] text-xl font-semibold text-white hover:bg-neutral-900 transition-colors"
            >
              Book Demo
            </a>
          </div>
        </section>

        <div className="text-center max-w-[900px] mx-auto mb-6">
          <h2 className="text-4xl font-bold text-[#111111] tracking-[-0.02em] mb-4">
            How Consentz Helps
          </h2>
          <p className="text-xl md:text-2xl text-[#1A1A1A] leading-[1.6] font-normal">
            No bolt-on integrations. No compliance gaps. No switching between tools.
          </p>
        </div>

        <HubComparisonTable variant="software" />

        {pillar === "software" ? (
          <section className="mb-16 w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 py-10 md:py-14">
            <div className="mx-auto max-w-[920px] px-4 sm:px-6">
              <div className="mx-auto flex w-full max-w-[781px] flex-col items-center">
                <Image
                  src={SOFTWARE_LAPTOP_MOCKUP_SRC}
                  alt=""
                  width={781}
                  height={415}
                  className="block h-auto w-full"
                  loading="lazy"
                  unoptimized
                />
                <div className="mt-6 flex w-full justify-center px-4">
                  <a
                    href={`${baseUrl}/book-demo`}
                    className="inline-flex items-center justify-center rounded-[12px] bg-[#1A1A1A] px-6 py-2.5 text-base font-semibold text-white shadow-md hover:bg-neutral-900 transition-colors sm:px-7 sm:py-3 sm:text-lg"
                  >
                    Book a Demo
                  </a>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {pillar === "cqc" ? (
          <section className="mb-16 w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 py-10 md:py-12">
            <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
              <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-5">
                <div className="relative w-full overflow-hidden rounded-[12px] border-4 border-[#1a1a1a] shadow-[0_2px_8px_rgba(105,71,71,0.25)] lg:min-w-0 lg:flex-[1.2]">
                  <Image
                    src={CQC_MID_DOMAINS}
                    alt=""
                    width={762}
                    height={402}
                    className="h-auto w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="relative w-full max-w-[400px] shrink-0 overflow-hidden rounded-[20px] border-4 border-[#1a1a1a] shadow-[0_2px_8px_rgba(0,0,0,0.25)] lg:max-w-[42%]">
                  <Image
                    src={CQC_MID_CARING}
                    alt=""
                    width={399}
                    height={350}
                    className="h-auto w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="mt-10 flex justify-center">
                <a
                  href={`${baseUrl}/book-demo`}
                  className="inline-flex h-[52px] w-[208px] shrink-0 items-center justify-center rounded-[12px] bg-[#1A1A1A] text-[20px] font-semibold text-white hover:bg-neutral-900 transition-colors"
                >
                  Book Demo
                </a>
              </div>
            </div>
          </section>
        ) : null}

        {pillar === "cqc" ? <HubRelatedLinksGrid related={related} /> : null}

        {pillar === "cqc" ? (
          <section className="mb-16 w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 py-10 md:py-12">
            <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
              <div className="mx-auto max-w-[920px] overflow-hidden rounded-xl border-4 border-[#1a1a1a] shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
                <Image
                  src={CQC_MID_HEATMAP}
                  alt=""
                  width={908}
                  height={388}
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="mt-10 flex justify-center">
                <a
                  href={`${baseUrl}/book-demo`}
                  className="inline-flex h-[52px] w-[208px] shrink-0 items-center justify-center rounded-[12px] bg-[#1A1A1A] text-[20px] font-semibold text-white hover:bg-neutral-900 transition-colors"
                >
                  Book Demo
                </a>
              </div>
            </div>
          </section>
        ) : null}

        {pillar === "software" ? <HubRelatedLinksGrid related={related} /> : null}

        <section className="mb-16">
          <div className="grid md:grid-cols-3 gap-5 max-w-[1224px] mx-auto">
            {testimonials.map((t) => (
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
                <p className="text-xl leading-snug text-[#2E2E2E] tracking-tight flex-1">
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

        <section className="mb-16 w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 bg-[#F2EEE6] lg:h-[302px] lg:overflow-hidden">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-10 sm:py-12 lg:h-full lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-0 lg:pl-20 lg:pr-6">
            <div className="flex min-w-0 max-w-[629px] flex-col gap-2 lg:max-h-[302px] lg:gap-3 lg:py-1">
              <h2 className="text-[26px] font-semibold leading-[1.1] text-[#1A1A1A] sm:text-[30px] lg:text-[36px] lg:leading-[1.08]">
                Are You A Service Provider?
              </h2>
              <p className="text-base font-medium leading-snug text-[#1A1A1A] sm:text-lg lg:text-[20px] lg:leading-normal">
                Join Consentz to streamline your clinic operations, enhance patient
                experience, and grow your business.
              </p>
              <div className="pt-3 lg:pt-2">
                <a
                  href={`${baseUrl}/book-demo`}
                  className="inline-flex h-[48px] w-[200px] shrink-0 items-center justify-center rounded-[12px] bg-[#1A1A1A] px-5 text-base font-semibold text-white hover:bg-neutral-900 transition-colors sm:h-[52px] sm:w-[208px] sm:px-6 sm:text-[20px]"
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

        <section className="mb-16 px-0 sm:px-4">
          <h2 className="text-center text-[30px] font-bold tracking-[-0.02em] text-[#111111] mb-3">
            Frequently Asked Questions
          </h2>
          <div className="h-3" />
          <div className="max-w-[1056px] mx-auto rounded-xl border border-[#E2DDD7] bg-white overflow-hidden">
            <details
              open
              className="group border-b border-[#EDE9E3] bg-white open:bg-white"
            >
              <summary className="cursor-pointer list-none px-6 py-5 font-semibold text-xl text-[#111111] flex justify-between gap-4 items-center">
                What is aesthetic clinic management software?
                <span className="text-neutral-400 group-open:rotate-180 transition-transform shrink-0 text-sm">
                  ▾
                </span>
              </summary>
              <div className="px-6 pb-5">
                <p className="text-base leading-[1.7] text-[#6B6B6B] max-w-[1000px]">
                  Aesthetic clinic management software handles the core operations of a
                  cosmetic or aesthetic clinic — including digital consent forms, patient
                  records, appointment scheduling, CQC compliance evidence, automated
                  messaging and clinic payments. Unlike generic booking tools,
                  purpose-built aesthetic software is designed for the specific compliance
                  requirements of UK aesthetic medicine.
                </p>
              </div>
            </details>
            <details className="group border-b border-[#EDE9E3] bg-white">
              <summary className="cursor-pointer list-none px-6 py-5 font-semibold text-xl text-[#111111] flex justify-between gap-4 items-center">
                Does Consentz include digital consent forms?
                <span className="text-neutral-400 group-open:rotate-180 transition-transform shrink-0 text-sm">
                  ▾
                </span>
              </summary>
              <div className="px-6 pb-5">
                <p className="text-base leading-[1.7] text-[#6B6B6B]">
                  Yes. Consentz supports structured digital consent tied to treatments and
                  visits so evidence stays consistent and retrievable.
                </p>
              </div>
            </details>
            <details className="group border-b border-[#EDE9E3] bg-white">
              <summary className="cursor-pointer list-none px-6 py-5 font-semibold text-xl text-[#111111] flex justify-between gap-4 items-center">
                Can Consentz help with CQC compliance?
                <span className="text-neutral-400 group-open:rotate-180 transition-transform shrink-0 text-sm">
                  ▾
                </span>
              </summary>
              <div className="px-6 pb-5">
                <p className="text-base leading-[1.7] text-[#6B6B6B]">
                  Consentz is designed to help teams collect and organise evidence that
                  maps to common inspection expectations, alongside operational workflows.
                </p>
              </div>
            </details>
            <details className="group bg-white">
              <summary className="cursor-pointer list-none px-6 py-5 font-semibold text-xl text-[#1A1A1A] flex justify-between gap-4 items-center">
                Can I migrate from Pabau or Fresha?
                <span className="text-neutral-400 group-open:rotate-180 transition-transform shrink-0 text-sm">
                  ▾
                </span>
              </summary>
              <div className="px-6 pb-5">
                <p className="text-base leading-[1.7] text-[#6B6B6B]">
                  Many clinics phase migration by workflow. Start with consent, booking, and
                  payments, then expand automation as data is structured.
                </p>
              </div>
            </details>
          </div>
        </section>

        <section className="mb-16 max-w-[1280px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#111111] mb-3">
            {pillar === "cqc" ? "CQC guidance on the Buyer Hub" : "Our Latest Blogs"}
          </h2>
          <p className="text-xl text-[#1A1A1A] leading-snug mb-10 max-w-[1280px]">
            {pillar === "cqc"
              ? "Deep dives on evidence, inspection readiness, and how to run compliance as part of day-to-day operations."
              : "Explore insights and tips to help you manage and grow your aesthetics clinic efficiently. Stay informed with our latest articles."}
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {(pillar === "cqc" ? HUB_CQC_GUIDE_LINKS : HUB_BLOG_LINKS.slice(0, 3)).map(
              (post) => {
                const cardClass =
                  "flex flex-col overflow-hidden rounded-2xl border border-[#DCDBD9] bg-[#FAFAFA] hover:shadow-md transition-shadow";
                const cardBody = (
                  <>
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
                        Read More →
                      </span>
                    </div>
                  </>
                );
                if (pillar === "cqc") {
                  return (
                    <Link key={post.id} href={post.href} className={cardClass}>
                      {cardBody}
                    </Link>
                  );
                }
                return (
                  <a
                    key={post.id}
                    href={post.href}
                    target="_blank"
                    rel="noreferrer"
                    className={cardClass}
                  >
                    {cardBody}
                  </a>
                );
              },
            )}
          </div>
          <div className="flex justify-center mt-10">
            {pillar === "cqc" ? (
              <Link
                href="/business/cqc/"
                className="inline-flex items-center justify-center rounded-[12px] bg-[#111111] px-11 py-4 text-xl font-semibold text-white hover:bg-neutral-900 transition-colors"
              >
                View all CQC guides
              </Link>
            ) : (
              <a
                href="https://www.consentz.com/blog/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-[12px] bg-[#111111] px-11 py-4 text-xl font-semibold text-white hover:bg-neutral-900 transition-colors"
              >
                View All Blogs
              </a>
            )}
          </div>
        </section>

      </HubContentStart>
      <HubSectionCta />
    </>
  );
}
