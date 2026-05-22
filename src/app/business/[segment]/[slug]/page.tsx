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
import { HubCompareDetailTemplate } from "@/components/b2b-hub/hub-compare-detail-template";
import { HubPractitionersDetailTemplate } from "@/components/b2b-hub/hub-practitioners-detail-template";
import { HubConsentDetailTemplate } from "@/components/b2b-hub/hub-consent-detail-template";
import { isCoreConsentHubSlug } from "@/lib/b2b-hub/consent-hub-nav-links";
import { getAutomationToolOfficialUrl } from "@/lib/b2b-hub/automation-tool-entries";
import { hubDetailPageMetadata } from "@/lib/b2b-hub/hub-page-metadata";

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
  return hubDetailPageMetadata(seg, entry);
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
    return (
      <HubAutomationDetailTemplate
        entry={entry}
        officialToolUrl={getAutomationToolOfficialUrl(entry.slug)}
      />
    );
  }
  if (seg === "migrate" && isMigrateFromHubSlug(entry.slug)) {
    return <HubMigrateDetailTemplate entry={entry} />;
  }
  if (seg === "compare") {
    return <HubCompareDetailTemplate entry={entry} />;
  }
  if (seg === "practitioners") {
    return <HubPractitionersDetailTemplate entry={entry} />;
  }
  if (seg === "consent" && isCoreConsentHubSlug(entry.slug)) {
    return <HubConsentDetailTemplate entry={entry} />;
  }
  return <HubDetailTemplate entry={entry} related={related} />;
}
