import type { Metadata } from "next";
import Link from "next/link";
import { getUniqueDirectoryCityNames } from "@/lib/b2b-hub/directory-cities";
import { toBusinessHubUrl } from "@/lib/sitemap";
import { toUrlSlug } from "@/lib/utils";

export const metadata: Metadata = {
  title: "By City | B2B Buyer Hub",
  description:
    "City index for the B2B buyer hub using the same city source as the clinic directory.",
  alternates: {
    canonical: toBusinessHubUrl("/business/uk/"),
  },
};

const PRIORITY_CITIES = [
  "Aberdeen",
  "Belfast",
  "Birmingham",
  "Brighton",
  "Bristol",
  "Cambridge",
  "Cardiff",
  "Chester",
  "Coventry",
  "Edinburgh",
  "Glasgow",
  "Leeds",
  "Leicester",
  "Liverpool",
  "London",
  "Manchester",
  "Newcastle",
  "Norwich",
  "Nottingham",
  "Oxford",
  "Plymouth",
  "Portsmouth",
  "Reading",
  "Sheffield",
  "Southampton",
];

const POPULAR_TREATMENTS = [
  {
    name: "Facial",
    image: "/directory/images/Facial Treatment.webp",
    href: "/treatments/facial-treatments/",
  },
  {
    name: "Massage",
    image: "/directory/treatments/massage.webp",
    href: "/treatments/massage/",
  },
  {
    name: "Lips",
    image: "/directory/treatments/lips.webp",
    href: "/treatments/lips/",
  },
  {
    name: "Skin",
    image: "/directory/images/Skin Treatment.webp",
    href: "/treatments/skin-booster/",
  },
  {
    name: "Hairline",
    image: "/directory/images/Hairline Treatment.webp",
    href: "/treatments/hair-treatments/",
  },
];

export default function BusinessCityIndexPage() {
  const allCities = getUniqueDirectoryCityNames();
  const featuredCities = PRIORITY_CITIES.slice(0, 8);
  const byLetter = allCities.reduce<Record<string, string[]>>((acc, city) => {
    const letter = city[0]?.toUpperCase() || "#";
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(city);
    return acc;
  }, {});
  const letters = Object.keys(byLetter).sort();

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-3">
          By City
        </h1>
        <p className="text-lg text-neutral-600 max-w-3xl leading-relaxed">
          City coverage for the B2B buyer hub follows the same city source as
          the directory. Use this index to review priority rollout locations and
          existing directory city coverage.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">
          Featured City Links
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {featuredCities.map((city) => {
            const slug = toUrlSlug(city);
            return (
              <div key={city} className="rounded-lg border border-neutral-200 bg-white p-4">
                <p className="font-medium text-neutral-900 mb-2">{city}</p>
                <div className="flex flex-col gap-1.5">
                  <a
                    href={`/directory/clinics/${slug}/`}
                    className="text-sm text-neutral-700 hover:underline"
                  >
                    Clinics In {city}
                  </a>
                  <a
                    href={`/directory/practitioners/${slug}/`}
                    className="text-sm text-neutral-700 hover:underline"
                  >
                    Practitioners In {city}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">
          Priority City Batch
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {PRIORITY_CITIES.map((city) => (
            <div
              key={city}
              className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800"
            >
              {city}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">
          Directory City Source ({allCities.length})
        </h2>
        <div className="space-y-4">
          {letters.map((letter) => (
            <div key={letter}>
              <h3 className="text-sm font-semibold text-neutral-600 mb-2">
                {letter}
              </h3>
              <div className="flex flex-wrap gap-2">
                {byLetter[letter].map((city) => (
                  <span
                    key={city}
                    className="rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-700"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center text-neutral-900 mb-10">
          Most Popular Treatments
        </h2>
        <div className="flex flex-wrap justify-center items-start gap-8 md:gap-12">
          {POPULAR_TREATMENTS.map((treatment) => (
            <Link
              key={treatment.name}
              href={treatment.href}
              className="flex flex-col items-center gap-2"
            >
              <img
                src={treatment.image}
                alt={treatment.name}
                className="h-24 w-24 rounded-full object-cover"
              />
              <p className="text-sm font-medium text-neutral-900">{treatment.name}</p>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            href="/treatments/"
            className="inline-flex items-center rounded-md bg-black text-white px-5 py-2.5 text-sm font-semibold"
          >
            See All Treatments
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-neutral-50 px-6 py-6">
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
          City Coverage Reference
        </h3>
        <p className="text-neutral-600 mb-4">
          This index lists the cities currently represented in directory data and
          links to corresponding clinic and practitioner pages.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/business/"
            className="inline-flex items-center rounded-md border border-neutral-300 bg-white text-neutral-900 px-4 py-2 text-sm font-semibold"
          >
            Back to Buyer Hub
          </Link>
        </div>
      </section>
    </div>
  );
}
