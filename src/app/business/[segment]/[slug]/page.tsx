import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getHubEntry,
  HUB_ENTRIES,
  isHubSegment,
  relatedEntriesFor,
  type HubSegment,
} from "@/lib/b2b-hub/registry";
import { HubDetailTemplate } from "@/components/b2b-hub/hub-detail-template";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://staging.consentz.com";

type Props = { params: { segment: string; slug: string } };

export function generateStaticParams() {
  return HUB_ENTRIES.map((e) => ({
    segment: e.segment,
    slug: e.slug,
  }));
}

export function generateMetadata({ params }: Props): Metadata {
  if (!isHubSegment(params.segment)) {
    return { title: "Buyer hub" };
  }
  const seg = params.segment as HubSegment;
  const entry = getHubEntry(seg, params.slug);
  if (!entry) {
    return { title: "Not found" };
  }
  const canonical = `${baseUrl}/directory/business/${seg}/${entry.slug}/`;
  return {
    title: `${entry.title} | ConsenTZ buyer hub`,
    description: entry.summary ?? entry.title,
    alternates: { canonical },
  };
}

export default function BusinessDetailPage({ params }: Props) {
  if (!isHubSegment(params.segment)) {
    notFound();
  }
  const seg = params.segment as HubSegment;
  const entry = getHubEntry(seg, params.slug);
  if (!entry) {
    notFound();
  }
  const related = relatedEntriesFor(seg, params.slug, 9);
  return <HubDetailTemplate entry={entry} related={related} />;
}
