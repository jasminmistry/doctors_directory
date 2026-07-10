import { unstable_cache } from "next/cache";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getAllClinicsForSearch } from "@/lib/data-access/clinics";
import { cleanRouteSlug } from "@/lib/utils";
import { FallbackImage, DEFAULT_PERSON } from "@/components/ui/fallback-image";

export interface FeaturedClinic {
  slug: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  gmapsAddress: string;
  City: string;
  Treatments: string[];
}

const getFeaturedProfiles = unstable_cache(
  () => prisma.featuredProfile.findMany({ orderBy: { position: "asc" } }),
  ["featured-profiles"],
  { revalidate: 300 }
);

async function getFeaturedClinics(): Promise<FeaturedClinic[]> {
  const [allClinics, featuredRows] = await Promise.all([
    getAllClinicsForSearch(),
    getFeaturedProfiles(),
  ]);

  const toFeaturedClinic = (c: (typeof allClinics)[number]): FeaturedClinic => ({
    slug: c.slug!,
    name: c.name ?? "",
    image: c.image ?? "",
    rating: Number(c.rating ?? 0),
    reviewCount: c.reviewCount ?? 0,
    category: c.category ?? "",
    gmapsAddress: c.gmapsAddress ?? "",
    City: c.City ?? "",
    Treatments: c.Treatments ?? [],
  });

  if (featuredRows.length > 0) {
    const slugSet = new Map(featuredRows.map((f) => [f.clinicSlug, f.position]));
    return allClinics
      .filter((c) => c.slug && slugSet.has(c.slug))
      .sort((a, b) => (slugSet.get(a.slug!) ?? 999) - (slugSet.get(b.slug!) ?? 999))
      .map(toFeaturedClinic);
  }

  // Fall back to algorithmic top-4 when no featured profiles are set
  return allClinics
    .filter((c) => c.slug && c.image && (c.reviewCount ?? 0) > 0)
    .sort((a, b) => {
      const scoreA = Number(a.rating ?? 0) * Math.log((a.reviewCount ?? 0) + 1);
      const scoreB = Number(b.rating ?? 0) * Math.log((b.reviewCount ?? 0) + 1);
      return scoreB - scoreA;
    })
    .slice(0, 4)
    .map(toFeaturedClinic);
}

export default async function FeaturedClinicsSection() {
  const featuredClinics = await getFeaturedClinics();

  if (featuredClinics.length === 0) return null;

  return (
    <section className="py-15 md:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-xl md:text-2xl font-medium text-center mb-10">
          Featured Clinics
        </h2>
        <div className="md:bg--(--primary-bg-color) grid md:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featuredClinics.map((clinic) => {
            const citySlug = cleanRouteSlug(clinic.City);
            const href = `/clinics/${citySlug}/clinic/${clinic.slug}`;
            const filledStars = Math.round(clinic.rating);
            const visibleTreatments = clinic.Treatments.slice(0, 2);
            const extraCount = clinic.Treatments.length - visibleTreatments.length;
            return (
              <article
                key={clinic.slug}
                className="mb-4 bg-white border border-[#e0e0e0] rounded-lg p-6 w-full max-w-md"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden bg-gray-200">
                    <FallbackImage
                      src={clinic.image}
                      alt={clinic.name}
                      fallback={DEFAULT_PERSON}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h2 className="mt-4 text-xl font-semibold text-black">
                    {clinic.name}
                  </h2>

                  {clinic.category && (
                    <p className="text-black text-md font-medium">
                      {clinic.category}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-4 text-sm">
                    <div className="flex text-black">
                      {"★".repeat(filledStars)}
                      {"☆".repeat(5 - filledStars)}
                    </div>
                    <span className="border-l border-black pl-2 underline">
                      ({clinic.reviewCount} reviews)
                    </span>
                  </div>

                  {clinic.gmapsAddress && (
                    <div className="flex items-start gap-2 mt-4 text-gray-500 text-sm w-full">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 text-left line-clamp-2">
                        {clinic.gmapsAddress}
                      </span>
                    </div>
                  )}

                  <Link
                    href={href}
                    className="w-full mt-4 h-auto sm:w-full inline-flex items-center justify-center gap-2 rounded-lg px-2 py-2 bg-[#f4f4f4]  text-sm font-medium text-[#1f1f1f] border border-[#e0e0e0] hover:bg-[#eeeeee] hover:border-[#d2d2d2] transition-colors capitalize hover:cursor-pointer"
                  >
                    View clinic
                  </Link>

                  {visibleTreatments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-5 justify-center">
                      {visibleTreatments.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1 border border-[#e0e0e0] rounded-full text-xs"
                        >
                          {t}
                        </span>
                      ))}
                      {extraCount > 0 && (
                        <span className="px-3 py-1 border border-[#e0e0e0] rounded-full text-xs">
                          +{extraCount} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
