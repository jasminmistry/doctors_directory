import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HubCityScaledPage } from "@/components/b2b-hub/hub-city-scaled-page";
import { getUniqueDirectoryCityNames } from "@/lib/b2b-hub/directory-cities";
import { getCityMarketStats } from "@/lib/b2b-hub/city-page-stats";
import { toUrlSlug } from "@/lib/utils";
import { CITY_LOCAL_PAGE_SLUGS } from "@/lib/b2b-hub/scaled-pages";
import { toDisplayTitle } from "@/lib/b2b-hub/text";
import { b2bBaseUrl, b2bOgImageUrl, toCurrentSiteUrl } from "@/lib/b2b-hub/seo";

type Props = { params: { city: string; slug: string } };

export const dynamic = "force-dynamic";

function citySlugExists(citySlug: string) {
  const cities = getUniqueDirectoryCityNames();
  return cities.some((city) => toUrlSlug(city) === citySlug);
}

function slugToTitle(slug: string) {
  return toDisplayTitle(slug.replaceAll("-", " "));
}

export function generateMetadata({ params }: Props): Metadata {
  if (!CITY_LOCAL_PAGE_SLUGS.includes(params.slug as (typeof CITY_LOCAL_PAGE_SLUGS)[number])) {
    return { title: "By City" };
  }
  if (!citySlugExists(params.city)) {
    return { title: "By City" };
  }
  const cityTitle = toDisplayTitle(params.city.replaceAll("-", " "));
  const pageTitle = `${cityTitle} ${slugToTitle(params.slug)}`;
  const description = `${pageTitle} with links to local clinics, practitioners, and related B2B workflow pages.`;
  const url = toCurrentSiteUrl(`/business/uk/${params.city}/${params.slug}/`);
  return {
    metadataBase: new URL(b2bBaseUrl()),
    title: `${pageTitle} | B2B Buyer Hub`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${pageTitle} | B2B Buyer Hub`,
      description,
      type: "article",
      url,
      images: [{ url: b2bOgImageUrl(["/images/Consentz Logo.webp"]) }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} | B2B Buyer Hub`,
      description,
      images: [b2bOgImageUrl(["/images/Consentz Logo.webp"])],
    },
  };
}

export default function BusinessCityScaledPageRoute({ params }: Props) {
  if (!CITY_LOCAL_PAGE_SLUGS.includes(params.slug as (typeof CITY_LOCAL_PAGE_SLUGS)[number])) {
    notFound();
  }
  if (!citySlugExists(params.city)) {
    notFound();
  }
  const cityTitle = toDisplayTitle(params.city.replaceAll("-", " "));
  const pageTitle = `${cityTitle} ${slugToTitle(params.slug)}`;
  const stats = getCityMarketStats(cityTitle);

  return (
    <HubCityScaledPage
      citySlug={params.city}
      cityTitle={cityTitle}
      pageSlug={params.slug}
      pageTitle={pageTitle}
      stats={stats}
    />
  );
}
