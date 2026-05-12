import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { HubIndexSearchCards } from "@/components/b2b-hub/hub-index-search-cards";
import { HubSectionCta } from "@/components/b2b-hub/hub-section-cta";
import {
  HUB_ENTRIES_BY_SEGMENT,
  HUB_SEGMENTS,
  isHubSegment,
  segmentLabel,
  type HubSegment,
} from "@/lib/b2b-hub/registry";
import { toDisplayTitle } from "@/lib/b2b-hub/text";
import { b2bBaseUrl, b2bOgImageUrl, toCurrentSiteUrl } from "@/lib/b2b-hub/seo";

type Props = { params: { segment: string } };

export function generateStaticParams() {
  return HUB_SEGMENTS.map((segment) => ({ segment }));
}

export function generateMetadata({ params }: Props): Metadata {
  if (!isHubSegment(params.segment)) {
    return { title: "Buyer hub" };
  }
  const label = segmentLabel(params.segment);
  const title = `${label} | B2B Buyer Hub`;
  const description = `Browse ${label} guides and comparisons for clinic software buyers.`;
  const url = toCurrentSiteUrl(`/business/${params.segment}/`);
  return {
    metadataBase: new URL(b2bBaseUrl()),
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      images: [{ url: b2bOgImageUrl(["/images/Consentz Logo.webp"]) }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [b2bOgImageUrl(["/images/Consentz Logo.webp"])],
    },
  };
}

function buildFaq(segment: HubSegment) {
  const title = segmentLabel(segment);
  return [
    {
      q: `What is included in the ${title.toLowerCase()} section?`,
      a: `This collection groups actionable pages for ${title.toLowerCase()} buyers, including practical workflows, migration considerations, and decision support content.`,
    },
    {
      q: "Can we use these pages during software evaluation?",
      a: "Yes. Each page is built to help teams compare options, align operational priorities, and move toward a production-ready rollout plan.",
    },
    {
      q: "Do these pages connect to other buyer-hub sections?",
      a: "Yes. Use the related collections below to navigate between alternatives, compliance, consent, automation, and practitioner-focused guides.",
    },
    {
      q: "How do we proceed after reviewing this section?",
      a: "Shortlist your top pages, review the linked alternatives, and book a demo to map requirements to your clinic model.",
    },
  ];
}

export default function BusinessSegmentIndexPage({ params }: Props) {
  if (!isHubSegment(params.segment)) {
    notFound();
  }
  const seg = params.segment as HubSegment;
  const entries = HUB_ENTRIES_BY_SEGMENT[seg] ?? [];
  const relatedCollections = HUB_SEGMENTS.filter((s) => s !== seg);
  const faq = buildFaq(seg);

  const cards = entries.map((e) => ({
    key: `${e.segment}-${e.slug}`,
    href: `/business/${e.segment}/${e.slug}/`,
    title: toDisplayTitle(e.title),
    subtitle: e.summary || "Open this guide.",
  }));

  return (
    <>
      <HubIndexSearchCards
        heroTitle={segmentLabel(seg)}
        heroSubtitle={`${entries.length} pages in this section. Open any guide to compare workflows, consent patterns, and migration considerations.`}
        entries={cards}
      />
      <section className="bg-white px-4 pb-12">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 text-center">
            Explore Related Collections
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {relatedCollections.map((s) => (
              <Link
                key={s}
                href={`/business/${s}/`}
                className="inline-flex rounded-[12px] border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-2.5 text-sm font-medium text-neutral-900 hover:border-neutral-400 hover:bg-white transition-all"
              >
                {segmentLabel(s)}
                <span className="text-neutral-500 font-normal ml-1.5">
                  ({HUB_ENTRIES_BY_SEGMENT[s]?.length ?? 0})
                </span>
              </Link>
            ))}
            <Link
              href="/business/uk/"
              className="inline-flex rounded-[12px] border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-2.5 text-sm font-medium text-neutral-900 hover:border-neutral-400 hover:bg-white transition-all"
            >
              By City
            </Link>
          </div>
        </div>
      </section>
      <section className="bg-white px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-900 mb-10 text-center">
            Frequently Asked Questions
          </h2>
          <div>
            {faq.map((item, i) => (
              <details
                key={item.q}
                className={`group border-t border-neutral-200 bg-white px-6 py-5 open:bg-neutral-50/80 ${
                  i === faq.length - 1 ? "border-b" : ""
                }`}
              >
                <summary className="cursor-pointer font-medium text-neutral-900 list-none flex justify-between gap-2">
                  {item.q}
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform shrink-0">
                    ▾
                  </span>
                </summary>
                <p className="mt-3 text-neutral-600 leading-relaxed text-sm">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <HubSectionCta
        heading="Ready To Move Forward?"
        sub="Book a Consentz demo to map these requirements to your clinic workflows, compliance priorities, and rollout plan."
        primaryLabel="Book A Demo"
        secondaryLabel="Back To Buyer Hub"
        secondaryHref="/business/"
      />
    </>
  );
}
