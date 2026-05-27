import type { Metadata } from "next";
import { HubUkIndexClient } from "@/components/b2b-hub/hub-uk-index-client";
import { getUniqueDirectoryCityNames } from "@/lib/b2b-hub/directory-cities";
import { UK_PRIORITY_CITIES } from "@/lib/b2b-hub/uk-hub-index-data";
import {
  buildHubPageMetadata,
  hubUkIndexMetaDescription,
  hubUkIndexMetaTitle,
} from "@/lib/b2b-hub/hub-page-metadata";

export const metadata: Metadata = buildHubPageMetadata({
  title: hubUkIndexMetaTitle(),
  description: hubUkIndexMetaDescription(),
  canonicalPath: "/business/uk/",
  ogType: "website",
});

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
