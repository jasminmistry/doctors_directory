import type { Metadata } from "next";
import { HubIndexSearchCards } from "@/components/b2b-hub/hub-index-search-cards";
import { HubSectionCta } from "@/components/b2b-hub/hub-section-cta";
import {
  HUB_ENTRIES_BY_SEGMENT,
  HUB_SEGMENTS,
  segmentLabel,
  type HubSegment,
} from "@/lib/b2b-hub/registry";
import { getUniqueDirectoryCityNames } from "@/lib/b2b-hub/directory-cities";
import { b2bBaseUrl, b2bOgImageUrl, toCurrentSiteUrl } from "@/lib/b2b-hub/seo";

export const metadata: Metadata = {
  metadataBase: new URL(b2bBaseUrl()),
  title: "B2B Software Buyer Hub | Consentz",
  description:
    "Evaluate clinic software with structured guides across consent, CQC evidence, automation, and competitor comparisons.",
  alternates: { canonical: toCurrentSiteUrl("/business/") },
  openGraph: {
    title: "B2B Software Buyer Hub | Consentz",
    description:
      "Evaluate clinic software with structured guides across consent, CQC evidence, automation, and competitor comparisons.",
    type: "website",
    url: toCurrentSiteUrl("/business/"),
    images: [{ url: b2bOgImageUrl(["/images/Consentz Logo.webp"]) }],
  },
  twitter: {
    card: "summary_large_image",
    title: "B2B Software Buyer Hub | Consentz",
    description:
      "Evaluate clinic software with structured guides across consent, CQC evidence, automation, and competitor comparisons.",
    images: [b2bOgImageUrl(["/images/Consentz Logo.webp"])],
  },
};

export default function BusinessHubHomePage() {
  const cityCount = getUniqueDirectoryCityNames().length;
  const entries = [
    ...HUB_SEGMENTS.map((seg: HubSegment) => {
      const count = HUB_ENTRIES_BY_SEGMENT[seg]?.length ?? 0;
      return {
        key: seg,
        href: `/business/${seg}/`,
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
