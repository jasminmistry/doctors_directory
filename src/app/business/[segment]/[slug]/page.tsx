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
import { HubSoftwareDetailTemplate } from "@/components/b2b-hub/hub-software-detail-template";
import { HubCqcDetailTemplate } from "@/components/b2b-hub/hub-cqc-detail-template";
import { HubAlternativesDetailTemplate } from "@/components/b2b-hub/hub-alternatives-detail-template";
import {
  HubMigrateDetailTemplate,
  isMigrateFromHubSlug,
} from "@/components/b2b-hub/hub-migrate-detail-template";
import {
  HubAutomationDetailTemplate,
  isCoreAutomationHubSlug,
} from "@/components/b2b-hub/hub-automation-detail-template";
import { HubTemplatesDetailTemplate } from "@/components/b2b-hub/hub-templates-detail-template";
import { HubCompareDetailTemplate } from "@/components/b2b-hub/hub-compare-detail-template";
import { b2bBaseUrl, b2bOgImageUrl, toCurrentSiteUrl } from "@/lib/b2b-hub/seo";

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
  const url = toCurrentSiteUrl(`/business/${seg}/${entry.slug}/`);
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
  if (seg === "software") {
    return <HubSoftwareDetailTemplate entry={entry} related={related} />;
  }
  if (seg === "cqc") {
    return <HubCqcDetailTemplate entry={entry} related={related} />;
  }
  if (seg === "alternatives") {
    return <HubAlternativesDetailTemplate entry={entry} />;
  }
  if (seg === "automation" && isCoreAutomationHubSlug(entry.slug)) {
    return <HubAutomationDetailTemplate entry={entry} />;
  }
  if (seg === "migrate" && isMigrateFromHubSlug(entry.slug)) {
    return <HubMigrateDetailTemplate entry={entry} />;
  }
  if (seg === "templates") {
    return <HubTemplatesDetailTemplate entry={entry} />;
  }
  if (seg === "compare") {
    return <HubCompareDetailTemplate entry={entry} />;
  }
  return <HubDetailTemplate entry={entry} related={related} />;
}
