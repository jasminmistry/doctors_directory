import HomePage from "@/components/home-page"
import { toDirectoryCanonical } from "@/lib/seo"
import { getAllClinicsForSearch } from "@/lib/data-access/clinics"

export const metadata = {
  alternates: {
    canonical: toDirectoryCanonical("/"),
  },
}

export default async function Home() {
  const allClinics = await getAllClinicsForSearch()
  const featuredClinics = allClinics
    .filter((c) => c.slug && c.image && (c.reviewCount ?? 0) > 0)
    .sort((a, b) => {
      const scoreA = Number(a.rating ?? 0) * Math.log((a.reviewCount ?? 0) + 1)
      const scoreB = Number(b.rating ?? 0) * Math.log((b.reviewCount ?? 0) + 1)
      return scoreB - scoreA
    })
    .slice(0, 4)
    .map((c) => ({
      slug: c.slug!,
      name: c.name ?? '',
      image: c.image ?? '',
      rating: Number(c.rating ?? 0),
      reviewCount: c.reviewCount ?? 0,
      category: c.category ?? '',
      gmapsAddress: c.gmapsAddress ?? '',
      City: c.City ?? '',
      Treatments: c.Treatments ?? [],
    }))

  return <HomePage featuredClinics={featuredClinics} />
}
