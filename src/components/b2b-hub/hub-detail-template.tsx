import Link from "next/link";
import { HubComparisonTable } from "@/components/b2b-hub/hub-comparison-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HubEntry, HubSegment } from "@/lib/b2b-hub/registry";
import { segmentLabel } from "@/lib/b2b-hub/registry";
import { toDisplayTitle } from "@/lib/b2b-hub/text";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com";

const HUB_HERO_IMAGE_SRC =
  "/directory/images/Consentz Aesthetic Clinic Directory.webp";

type HubDetailTemplateProps = {
  entry: HubEntry;
  related: HubEntry[];
};

export function HubDetailTemplate({ entry, related }: HubDetailTemplateProps) {
  const seg = entry.segment as HubSegment;
  const intro =
    entry.summary ||
    `${toDisplayTitle(entry.title)}: guidance for clinic operators evaluating software and workflows.`;
  const showCompareRow =
    seg === "software" ||
    seg === "alternatives" ||
    seg === "compare" ||
    seg === "migrate" ||
    seg === "pricing" ||
    (seg === "cqc" && entry.slug.includes("-cqc-compliance-alternative")) ||
    (seg === "consent" && entry.slug.includes("-consent-form-alternative")) ||
    (seg === "automation" && entry.slug.includes("-automation-alternative"));

  return (
    <>
      <section className="w-full bg-[var(--primary-bg-color)] border-b border-[#E5E7EB]">
        <div className="max-w-[1280px] mx-auto px-4 pt-8 md:pt-12 pb-10 md:pb-14">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-start lg:items-center text-center md:text-left">
            <div className="min-w-0">
              <Breadcrumb className="mb-6 flex justify-center md:justify-start">
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
                <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                  {segmentLabel(seg)}
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-4 [font-family:var(--font-playfair),Georgia,serif]">
                  {toDisplayTitle(entry.title)}
                </h1>
                <p className="text-base md:text-lg text-neutral-600 leading-relaxed max-w-3xl mx-auto md:mx-0">
                  {intro}
                </p>
              </header>
            </div>
            <figure className="flex justify-center lg:justify-end order-first lg:order-none pt-2 lg:pt-0">
              <img
                src={HUB_HERO_IMAGE_SRC}
                alt=""
                className="max-w-[220px] sm:max-w-xs w-full h-auto object-contain"
              />
            </figure>
          </div>
        </div>
      </section>

      <article className="max-w-[1280px] mx-auto px-4 pt-10 md:pt-12 pb-16">
        <section className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-[#E5E7EB] bg-[#FAFAFA] shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Operational Reality</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Teams outgrow generic tools when consent, payments, and clinical
                evidence sit in different places. The result is slower bookings,
                weaker compliance confidence, and fragile patient communication.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-[#E5E7EB] bg-[#FAFAFA] shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">What Changes With Consentz</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Consentz is built as an operating layer for clinics: structured
                consent, workflow automation, and reporting that maps to how
                regulated teams actually work day to day.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {showCompareRow ? <HubComparisonTable /> : null}

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 text-center">
            Explore Next
          </h2>
          <div className="flex flex-wrap justify-center gap-2 max-w-[1120px] mx-auto">
            {related.map((r) => (
              <Link
                key={`${r.segment}-${r.slug}`}
                href={`/business/${r.segment}/${r.slug}/`}
                className="inline-flex rounded-[12px] border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-2.5 text-sm font-medium text-neutral-900 hover:border-neutral-400 hover:bg-white transition-all"
              >
                <span className="truncate max-w-[280px] sm:max-w-[320px]">
                  {toDisplayTitle(r.title)}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-900 mb-10 text-center">
            FAQ
          </h2>
          <div>
            <details className="group border-t border-neutral-200 bg-white px-6 py-5 open:bg-neutral-50/80">
              <summary className="cursor-pointer font-medium text-neutral-900 list-none flex justify-between gap-2">
                Is Consentz only for aesthetic clinics?
                <span className="text-neutral-400 group-open:rotate-180 transition-transform shrink-0">
                  ▾
                </span>
              </summary>
              <p className="mt-3 text-neutral-600 leading-relaxed text-sm">
                Consentz supports clinics that need governed consent, structured
                workflows, and operational reporting—common across aesthetic,
                dermatology, and wellness operators.
              </p>
            </details>
            <details className="group border-t border-neutral-200 bg-white px-6 py-5 open:bg-neutral-50/80">
              <summary className="cursor-pointer font-medium text-neutral-900 list-none flex justify-between gap-2">
                How does migration work from another system?
                <span className="text-neutral-400 group-open:rotate-180 transition-transform shrink-0">
                  ▾
                </span>
              </summary>
              <p className="mt-3 text-neutral-600 leading-relaxed text-sm">
                Start with the workflows that cause the most leakage—consent,
                booking, and payments—then expand automation once data is
                structured.
              </p>
            </details>
            <details className="group border-t border-b border-neutral-200 bg-white px-6 py-5 open:bg-neutral-50/80">
              <summary className="cursor-pointer font-medium text-neutral-900 list-none flex justify-between gap-2">
                Can we evaluate pricing without a long procurement cycle?
                <span className="text-neutral-400 group-open:rotate-180 transition-transform shrink-0">
                  ▾
                </span>
              </summary>
              <p className="mt-3 text-neutral-600 leading-relaxed text-sm">
                Use the pricing comparison pages for common alternatives, then
                book a demo to map packages to your locations and services.
              </p>
            </details>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href={`${baseUrl}/book-demo`}
            className="inline-flex items-center justify-center rounded-[12px] bg-black px-8 py-3 text-sm font-semibold text-white hover:bg-neutral-900 transition-colors"
          >
            Book A Demo
          </a>
          <Link
            href="/business/"
            className="inline-flex items-center justify-center rounded-[12px] border-2 border-neutral-900 bg-white px-8 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
          >
            Back To Buyer Hub
          </Link>
        </div>
      </article>
    </>
  );
}
