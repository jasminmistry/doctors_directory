import HomePage from "@/components/home-page"
import type { FeaturedClinic } from "@/components/home-page"
import { toDirectoryCanonical } from "@/lib/seo"
import { getAllClinicsForSearch } from "@/lib/data-access/clinics"
import { prisma } from "@/lib/db"

export const dynamic = 'force-dynamic'

export const metadata = {
  alternates: {
    canonical: toDirectoryCanonical("/"),
  },
}

export default async function Home() {
  const [allClinics, featuredRows] = await Promise.all([
    getAllClinicsForSearch(),
    prisma.featuredProfile.findMany({ orderBy: { position: 'asc' } }),
  ])

  let featuredClinics: FeaturedClinic[]

  if (featuredRows.length > 0) {
    const slugSet = new Map(featuredRows.map((f) => [f.clinicSlug, f.position]))
    featuredClinics = allClinics
      .filter((c) => c.slug && slugSet.has(c.slug))
      .sort((a, b) => (slugSet.get(a.slug!) ?? 999) - (slugSet.get(b.slug!) ?? 999))
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
  } else {
    // Fall back to algorithmic top-4 when no featured profiles are set
    featuredClinics = allClinics
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
  }

  return <HomePage featuredClinics={featuredClinics} />
}
