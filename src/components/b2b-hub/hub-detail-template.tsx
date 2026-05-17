import Link from "next/link";
import { HubBuyerFaq } from "@/components/b2b-hub/hub-buyer-faq";
import { HUB_CTA_PRIMARY_CLASS } from "@/components/b2b-hub/hub-cta-buttons";
import { HubComparisonTable } from "@/components/b2b-hub/hub-comparison-table";
import { HubContentStart } from "@/components/b2b-hub/hub-content-start";
import { HubDetailHero } from "@/components/b2b-hub/hub-detail-hero";
import { HubMainDifferenceSection } from "@/components/b2b-hub/hub-main-difference-section";
import { HubSectionCta } from "@/components/b2b-hub/hub-section-cta";
import { hubEntryCompetitorLabel } from "@/lib/b2b-hub/hub-competitor-from-entry";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HubEntry, HubSegment } from "@/lib/b2b-hub/registry";
import { toDisplayTitle } from "@/lib/b2b-hub/text";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com";

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
    seg === "migrate" ||
    seg === "pricing" ||
    (seg === "cqc" && entry.slug.includes("-cqc-compliance-alternative")) ||
    (seg === "consent" && entry.slug.includes("-consent-form-alternative")) ||
    (seg === "automation" && entry.slug.includes("-automation-alternative"));
  const competitorLabel = hubEntryCompetitorLabel(entry);

  return (
    <>
      <HubDetailHero seg={seg} title={entry.title} intro={intro} />

      <HubContentStart className="pb-16">
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

        {competitorLabel ? (
          <HubMainDifferenceSection competitorLabel={competitorLabel} />
        ) : null}

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

        <HubBuyerFaq
          className="max-w-3xl mx-auto"
          items={[
            {
              question: "Is Consentz only for aesthetic clinics?",
              answer:
                "Consentz supports clinics that need governed consent, structured workflows, and operational reporting—common across aesthetic, dermatology, and wellness operators.",
              defaultOpen: true,
            },
            {
              question: "How does migration work from another system?",
              answer:
                "Start with the workflows that cause the most leakage—consent, booking, and payments—then expand automation once data is structured.",
            },
            {
              question: "Can we evaluate pricing without a long procurement cycle?",
              answer:
                "Use the pricing comparison pages for common alternatives, then book a demo to map packages to your locations and services.",
            },
          ]}
        />


        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href={`${baseUrl}/book-demo`}
            className={HUB_CTA_PRIMARY_CLASS}
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
      </HubContentStart>
      <HubSectionCta />
    </>
  );
}
