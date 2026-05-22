import type { Metadata } from "next";
import { HubIndexSearchCards } from "@/components/b2b-hub/hub-index-search-cards";
import { HubSectionCta } from "@/components/b2b-hub/hub-section-cta";
import {
  HUB_ENTRIES_BY_SEGMENT,
  HUB_SEGMENTS,
  segmentLabel,
  type HubSegment,
} from "@/lib/b2b-hub/registry";
import { TEMPLATE_ENTRIES } from "@/lib/b2b-hub/templates-registry";
import { getUniqueDirectoryCityNames } from "@/lib/b2b-hub/directory-cities";
import {
  buildHubPageMetadata,
  hubHomeMetaDescription,
  hubHomeMetaTitle,
} from "@/lib/b2b-hub/hub-page-metadata";

export const metadata: Metadata = buildHubPageMetadata({
  title: hubHomeMetaTitle(),
  description: hubHomeMetaDescription(),
  canonicalPath: "/business/",
  ogType: "website",
});

export default function BusinessHubHomePage() {
  const cityCount = getUniqueDirectoryCityNames().length;
  const entries = [
    ...HUB_SEGMENTS.map((seg: HubSegment) => {
      const count =
        seg === "templates"
          ? TEMPLATE_ENTRIES.length
          : HUB_ENTRIES_BY_SEGMENT[seg]?.length ?? 0;
      return {
        key: seg,
        href: seg === "templates" ? "/business/templates/" : `/business/${seg}/`,
        title: segmentLabel(seg),
        subtitle: `${count} pages — guides and comparisons for ${segmentLabel(seg).toLowerCase()}.`,
      };
    }),
    {
      key: "by-city",
      href: "/business/uk/",
      title: "By City",
      subtitle: `${cityCount} cities — city index for the buyer hub.`,
    },
    {
      key: "by-treatment",
      href: "/business/treatments/",
      title: "By Treatment",
      subtitle: "Treatment-based workflow and software pages.",
    },
  ];

  return (
    <>
      <HubIndexSearchCards
        heroTitle="B2B Software Buyer Hub"
        heroSubtitle={`Practical pages for operators comparing clinic software, consent workflows, compliance evidence, and migration paths from common platforms. City-level hub pages use the same city set as the clinic directory (${cityCount} cities).`}
        entries={entries}
      />
      <HubSectionCta />
    </>
  );
}
