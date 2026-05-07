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
import { toBusinessHubUrl } from "@/lib/sitemap";
import { b2bBaseUrl, b2bOgImageUrl } from "@/lib/b2b-hub/seo";

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
  const title = `${entry.title} | Consentz Buyer Hub`;
  const description = entry.summary ?? entry.title;
  const url = toBusinessHubUrl(`/business/${seg}/${entry.slug}/`);
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
      type: "article",
      url,
      images: [{ url: b2bOgImageUrl() }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [b2bOgImageUrl()],
    },
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
