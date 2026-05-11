import type { Metadata } from "next";
import { HubUkIndexClient } from "@/components/b2b-hub/hub-uk-index-client";
import { getUniqueDirectoryCityNames } from "@/lib/b2b-hub/directory-cities";
import { UK_PRIORITY_CITIES } from "@/lib/b2b-hub/uk-hub-index-data";
import { b2bBaseUrl, b2bOgImageUrl, toCurrentSiteUrl } from "@/lib/b2b-hub/seo";

export const metadata: Metadata = {
  metadataBase: new URL(b2bBaseUrl()),
  title: "By City | B2B Buyer Hub",
  description:
    "City index for the B2B buyer hub using the same city source as the clinic directory.",
  alternates: {
    canonical: toCurrentSiteUrl("/business/uk/"),
  },
  openGraph: {
    title: "By City | B2B Buyer Hub",
    description:
      "City index for the B2B buyer hub using the same city source as the clinic directory.",
    type: "website",
    url: toCurrentSiteUrl("/business/uk/"),
    images: [{ url: b2bOgImageUrl(["/images/Consentz Logo.webp"]) }],
  },
  twitter: {
    card: "summary_large_image",
    title: "By City | B2B Buyer Hub",
    description:
      "City index for the B2B buyer hub using the same city source as the clinic directory.",
    images: [b2bOgImageUrl(["/images/Consentz Logo.webp"])],
  },
};

export default function BusinessCityIndexPage() {
  const allCities = getUniqueDirectoryCityNames();
  const featuredCityNames = [...UK_PRIORITY_CITIES.slice(0, 8)];
  return (
    <HubUkIndexClient
      allCities={allCities}
      featuredCityNames={featuredCityNames}
    />
  );
}
