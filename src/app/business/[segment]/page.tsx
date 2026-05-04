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
import { toBusinessHubUrl } from "@/lib/sitemap";

type Props = { params: { segment: string } };

export function generateStaticParams() {
  return HUB_SEGMENTS.map((segment) => ({ segment }));
}

export function generateMetadata({ params }: Props): Metadata {
  if (!isHubSegment(params.segment)) {
    return { title: "Buyer hub" };
  }
  const label = segmentLabel(params.segment);
  return {
    title: `${label} | B2B buyer hub`,
    description: `Browse ${label} guides and comparisons for clinic software buyers.`,
    alternates: {
      canonical: toBusinessHubUrl(`/business/${params.segment}/`),
    },
  };
}

export default function BusinessSegmentIndexPage({ params }: Props) {
  if (!isHubSegment(params.segment)) {
    notFound();
  }
  const seg = params.segment as HubSegment;
  const entries = HUB_ENTRIES_BY_SEGMENT[seg] ?? [];

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

      <ul className="space-y-2">
        {entries.map((e) => (
          <li key={e.slug}>
            <Link
              href={`/business/${e.segment}/${e.slug}/`}
              className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 rounded-lg border border-neutral-200 bg-white px-4 py-3 hover:border-neutral-400 hover:shadow-sm transition-all"
            >
              <span className="font-medium text-neutral-900">{e.title}</span>
              {e.summary ? (
                <span className="text-sm text-neutral-500 line-clamp-2 sm:max-w-xl sm:text-right">
                  {e.summary}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
