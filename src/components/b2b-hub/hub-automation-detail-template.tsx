import Image from "next/image";
import Link from "next/link";
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
import { automationHubNavLinks } from "@/lib/b2b-hub/automation-hub-nav-links";
import type { HubEntry, HubSegment } from "@/lib/b2b-hub/registry";
import { segmentLabel } from "@/lib/b2b-hub/registry";
import { toDisplayTitle } from "@/lib/b2b-hub/text";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com";

const SOFTWARE_LAPTOP_MOCKUP_SRC = "/directory/images/software-laptop-mockup.svg";
const CTA_CLINIC_PHONE_SRC = "/directory/images/cta-clinic-phone.png";

const reactivationWorkflowSteps = [
  {
    step: 1,
    title: "Patient identified",
    body: "Consentz identifies patients who haven't booked within your chosen timeframe (e.g. 90 days).",
    circleVariant: "filled" as const,
  },
  {
    step: 2,
    title: "Message sent automatically",
    body: "A personalised SMS or WhatsApp is sent referencing their last treatment and suggesting their next visit.",
    circleVariant: "outlined" as const,
  },
  {
    step: 3,
    title: "Booking link included",
    body: "The message includes a direct booking link. No manual follow-up needed from your team.",
    circleVariant: "outlined" as const,
  },
  {
    step: 4,
    title: "Booking confirmed",
    body: "Patient books. The appointment is logged and the automation closes the loop automatically.",
    circleVariant: "outlined" as const,
  },
] as const;

const spotlightTimeline = [
  {
    step: "01",
    title: "Rules Engine",
    body: "Triggers fire on dates, treatments, or risk flags — not manual list pulls.",
  },
  {
    step: "02",
    title: "Governed Channels",
    body: "SMS, email, and portal nudges respect marketing consent and clinical boundaries.",
  },
  {
    step: "03",
    title: "Front Desk Handoff",
    body: "Staff see suggested slots and context without digging through notes.",
  },
] as const;

function HowReactivationRunsSection() {
  return (
    <section className="mb-16">
      <div className="mx-auto flex w-full max-w-[778px] flex-col items-center gap-6">
        <h2 className="text-center text-[30px] font-semibold leading-tight text-[#1a1a1a] md:text-[36px]">
          How the reactivation workflow runs
        </h2>
        <div className="flex w-full flex-col gap-6">
          {reactivationWorkflowSteps.map(({ step, title, body, circleVariant }) => (
            <div
              key={step}
              className="flex w-full items-start gap-4 rounded-[12px] border border-[#E5E7EB] bg-white p-5"
            >
              <div
                className={`relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[18px] text-center text-sm font-semibold text-[#1a1a1a] ${
                  circleVariant === "filled"
                    ? "bg-[#eef7f2]"
                    : "border border-solid border-[#2e2e2e] bg-white"
                }`}
              >
                <span className="leading-none">{step}</span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-left">
                <p className="text-xl font-semibold leading-snug text-[#1a1a1a] md:text-2xl">{title}</p>
                <p className="text-sm font-normal leading-[22px] text-[#1a1a1a]">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AutomationWorkflowSpotlight() {
  return (
    <section className="mb-16 w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 bg-[#F2EEE6] py-12 md:py-16">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#6B6B6B]">
          Live Workflows
        </p>
        <h2 className="mb-10 text-center text-[28px] font-bold leading-tight text-[#111111] md:text-[34px]">
          End-To-End Automation Your Clinic Can Rely On
        </h2>
        <div className="overflow-hidden rounded-2xl border border-[#E2DDD7] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-1 gap-10 p-8 md:grid-cols-2 md:gap-12 md:p-12 lg:items-center">
            <div className="min-w-0">
              <p className="mb-8 text-sm font-medium text-[#6B6B6B]">
                Orchestration, consent, and scheduling stay linked — so operators trust what went out and why.
              </p>
              <ol className="relative space-y-0">
                {spotlightTimeline.map(({ step, title, body }, i) => (
                  <li key={step} className="relative flex gap-4 pb-10 last:pb-0">
                    {i < spotlightTimeline.length - 1 ? (
                      <span
                        className="absolute left-[19px] top-10 bottom-0 w-px bg-[#E2DDD7]"
                        aria-hidden
                      />
                    ) : null}
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-xs font-bold text-white">
                      {step}
                    </span>
                    <div>
                      <p className="text-lg font-semibold text-[#111111]">{title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-[#6B6B6B]">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex items-center justify-center rounded-xl bg-[#F8F7F5] p-6 md:p-8">
              <Image
                src={SOFTWARE_LAPTOP_MOCKUP_SRC}
                alt=""
                width={640}
                height={340}
                className="h-auto w-full max-w-[480px] object-contain"
                loading="lazy"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const automationFaqs = [
  {
    open: true,
    q: "Does automation replace my reception team?",
    a: "No. It removes repetitive chasing so staff can focus on conversations that need a human. Rules and templates stay under your control.",
  },
  {
    open: false,
    q: "How do we stay compliant when messaging patients?",
    a: "Consent preferences and clinical context travel with each workflow. Outreach is tied to the record so you can evidence what was sent and why.",
  },
  {
    open: false,
    q: "Can we start with reactivation only?",
    a: "Yes. Many clinics begin with dormant cohorts and expand into journey automation once data and consent are structured.",
  },
] as const;

type Props = {
  entry: HubEntry;
};

export function HubAutomationDetailTemplate({ entry }: Props) {
  const seg = entry.segment as HubSegment;
  const intro =
    entry.summary ||
    `${toDisplayTitle(entry.title)}: automate clinic workflows without losing governance.`;
  const navLinks = automationHubNavLinks(entry.slug);

  return (
    <>
      <section className="w-full border-b border-[#E5E7EB] bg-[#F2EEE6]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-0">
          <div className="relative box-border overflow-hidden pt-8 pb-12 lg:grid lg:h-[562px] lg:min-h-[562px] lg:max-h-[562px] lg:grid-cols-[minmax(0,700px)_minmax(0,1fr)] lg:items-stretch lg:gap-x-6 lg:px-0 lg:py-0">
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
                    className="inline-flex h-[52px] w-[208px] shrink-0 items-center justify-center rounded-[7px] bg-[#1A1A1A] px-6 py-[13px] text-[20px] font-semibold text-white hover:bg-neutral-900 transition-colors"
                  >
                    Book a Demo
                  </a>
                  <a
                    href={`${baseUrl}/book-demo`}
                    className="inline-flex shrink-0 items-center justify-center rounded-[7px] border-[1.5px] border-[#E2DDD7] bg-white px-6 py-[13px] text-[20px] font-medium text-[#111111] hover:bg-neutral-50 transition-colors whitespace-nowrap"
                  >
                    Get CQC Readiness Audit
                  </a>
                  <a
                    href={`${baseUrl}/book-demo`}
                    className="inline-flex shrink-0 items-center justify-center px-1 py-[13px] text-[20px] font-medium text-[#6B6B6B] hover:text-neutral-900 transition-colors whitespace-nowrap"
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
        </div>
      </section>

      <article className="mx-auto max-w-[1280px] px-4 pb-0 pt-8 md:pt-10 [font-family:Inter,system-ui,sans-serif]">
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

        <HowReactivationRunsSection />

        <AutomationWorkflowSpotlight />

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
              className="inline-flex h-[52px] w-[208px] items-center justify-center rounded-xl bg-[#1A1A1A] text-xl font-semibold text-white hover:bg-neutral-900 transition-colors"
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

        <section className="mb-16 w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 bg-[#F2EEE6] lg:h-[302px] lg:overflow-hidden">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-10 sm:py-12 lg:h-full lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-0 lg:pl-20 lg:pr-6">
            <div className="flex min-w-0 max-w-[629px] flex-col gap-2 lg:max-h-[302px] lg:gap-3 lg:py-1">
              <h2 className="text-[26px] font-semibold leading-[1.1] text-[#1A1A1A] sm:text-[30px] lg:text-[36px] lg:leading-[1.08]">
                Are You A Service Provider?
              </h2>
              <p className="text-base font-medium leading-snug text-[#1A1A1A] sm:text-lg lg:text-[20px] lg:leading-normal">
                Join Consentz to streamline your clinic operations, enhance patient experience, and grow your
                business.
              </p>
              <div className="pt-3 lg:pt-2">
                <a
                  href={`${baseUrl}/book-demo`}
                  className="inline-flex h-[48px] w-[200px] shrink-0 items-center justify-center rounded-[12px] bg-[#1A1A1A] px-5 text-base font-semibold text-white transition-colors hover:bg-neutral-900 sm:h-[52px] sm:w-[208px] sm:px-6 sm:text-[20px]"
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
          <h2 className="mb-3 text-center text-[30px] font-bold tracking-[-0.02em] text-[#111111]">
            Frequently Asked Questions
          </h2>
          <div className="h-3" />
          <div className="mx-auto max-w-[1056px] overflow-hidden rounded-xl border border-[#E2DDD7] bg-white">
            {automationFaqs.map((item) => (
              <details
                key={item.q}
                open={item.open}
                className="group border-b border-[#EDE9E3] bg-white last:border-b-0 open:bg-white"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-xl font-semibold text-[#111111]">
                  {item.q}
                  <span className="shrink-0 text-sm text-neutral-400 transition-transform group-open:rotate-180">
                    ▾
                  </span>
                </summary>
                <div className="px-6 pb-5">
                  <p className="max-w-[1000px] text-base leading-[1.7] text-[#6B6B6B]">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="mb-16 mx-auto max-w-[1280px]">
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
              className="inline-flex items-center justify-center rounded-[12px] bg-[#111111] px-11 py-4 text-xl font-semibold text-white transition-colors hover:bg-neutral-900"
            >
              View all blogs
            </a>
          </div>
        </section>

        <section className="mb-0 w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 overflow-hidden bg-[#F2EEE6]">
          <div className="relative mx-auto max-w-[1440px] px-6 pb-12 pt-8 sm:pb-14 sm:pt-10 lg:h-[472px] lg:overflow-hidden lg:px-20 lg:pb-20 lg:pt-0">
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
                  className="inline-flex h-[52px] w-[208px] shrink-0 items-center justify-center rounded-[12px] bg-[#1A1A1A] text-[18px] font-semibold text-white transition-colors hover:bg-neutral-900 sm:text-[20px]"
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

export function isCoreAutomationHubSlug(slug: string) {
  return !slug.endsWith("-automation-alternative");
}
