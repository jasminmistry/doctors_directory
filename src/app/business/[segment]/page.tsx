import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
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
  const relatedCollections = HUB_SEGMENTS.filter((s) => s !== seg).slice(0, 6);
  const faq = buildFaq(seg);

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-3">
          {segmentLabel(seg)}
        </h1>
        <p className="text-lg text-neutral-600 max-w-3xl leading-relaxed">
          {entries.length} pages in this section. Open any guide to compare
          workflows, consent patterns, and migration considerations.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">
          Pages In This Collection
        </h2>
        <ul className="space-y-2">
          {entries.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/business/${e.segment}/${e.slug}/`}
                className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 rounded-lg border border-neutral-200 bg-white px-4 py-3 hover:border-neutral-400 hover:shadow-sm transition-all"
              >
                <span className="font-medium text-neutral-900">
                  {toDisplayTitle(e.title)}
                </span>
                {e.summary ? (
                  <span className="text-sm text-neutral-500 line-clamp-2 sm:max-w-xl sm:text-right">
                    {e.summary}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">
          Explore Related Collections
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {relatedCollections.map((s) => (
            <Link
              key={s}
              href={`/business/${s}/`}
              className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400 hover:shadow-sm transition-all"
            >
              <p className="font-medium text-neutral-900">{segmentLabel(s)}</p>
              <p className="text-sm text-neutral-500 mt-1">
                {HUB_ENTRIES_BY_SEGMENT[s]?.length ?? 0} pages
              </p>
            </Link>
          ))}
          <Link
            href="/business/uk/"
            className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400 hover:shadow-sm transition-all"
          >
            <p className="font-medium text-neutral-900">By City</p>
            <p className="text-sm text-neutral-500 mt-1">City Collection Index</p>
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {faq.map((item) => (
            <details
              key={item.q}
              className="group rounded-lg border border-neutral-200 bg-white px-4 py-3 open:shadow-sm"
            >
              <summary className="cursor-pointer font-medium text-neutral-900 list-none flex justify-between gap-2">
                {item.q}
                <span className="text-neutral-400 group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <p className="mt-3 text-neutral-600 leading-relaxed text-sm">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-neutral-50 px-6 py-6">
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
          Ready To Move Forward?
        </h3>
        <p className="text-neutral-600 mb-4">
          Book a Consentz demo to map these requirements to your clinic workflows,
          compliance priorities, and rollout plan.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={`${
              process.env.NEXT_PUBLIC_BASE_URL || "https://staging.consentz.com"
            }/book-demo`}
            className="inline-flex items-center rounded-md bg-black text-white px-4 py-2 text-sm font-semibold"
          >
            Book demo
          </a>
          <Link
            href="/business/"
            className="inline-flex items-center rounded-md border border-neutral-300 bg-white text-neutral-900 px-4 py-2 text-sm font-semibold"
          >
            Back to buyer hub
          </Link>
        </div>
      </section>
    </div>
  );
}
