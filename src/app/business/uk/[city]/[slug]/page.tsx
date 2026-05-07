import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { getUniqueDirectoryCityNames } from "@/lib/b2b-hub/directory-cities"
import { toBusinessHubUrl } from "@/lib/sitemap"
import { toUrlSlug } from "@/lib/utils"
import { CITY_LOCAL_PAGE_SLUGS } from "@/lib/b2b-hub/scaled-pages"
import { toDisplayTitle } from "@/lib/b2b-hub/text"
import { b2bBaseUrl, b2bOgImageUrl } from "@/lib/b2b-hub/seo"

type Props = { params: { city: string; slug: string } }

export const dynamic = "force-dynamic"

function citySlugExists(citySlug: string) {
  const cities = getUniqueDirectoryCityNames()
  return cities.some((city) => toUrlSlug(city) === citySlug)
}

function slugToTitle(slug: string) {
  return toDisplayTitle(slug.replaceAll("-", " "))
}

export function generateMetadata({ params }: Props): Metadata {
  if (!CITY_LOCAL_PAGE_SLUGS.includes(params.slug as (typeof CITY_LOCAL_PAGE_SLUGS)[number])) {
    return { title: "By City" }
  }
  if (!citySlugExists(params.city)) {
    return { title: "By City" }
  }
  const cityTitle = toDisplayTitle(params.city.replaceAll("-", " "))
  const pageTitle = `${cityTitle} ${slugToTitle(params.slug)}`
  const description = `${pageTitle} with links to local clinics, practitioners, and related B2B workflow pages.`
  const url = toBusinessHubUrl(`/business/uk/${params.city}/${params.slug}/`)
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
      images: [{ url: b2bOgImageUrl() }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} | B2B Buyer Hub`,
      description,
      images: [b2bOgImageUrl()],
    },
  }
}

export default function BusinessCityScaledPage({ params }: Props) {
  if (!CITY_LOCAL_PAGE_SLUGS.includes(params.slug as (typeof CITY_LOCAL_PAGE_SLUGS)[number])) {
    notFound()
  }
  if (!citySlugExists(params.city)) {
    notFound()
  }
  const cityTitle = toDisplayTitle(params.city.replaceAll("-", " "))
  const pageTitle = `${cityTitle} ${slugToTitle(params.slug)}`

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-2">
          By City
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-3">
          {pageTitle}
        </h1>
        <p className="text-lg text-neutral-600 max-w-3xl leading-relaxed">
          Localized B2B page based on approved scaling rules: city combined with
          software, practitioner, or consent workflows only.
        </p>
      </header>

      <section className="mb-12 grid sm:grid-cols-2 gap-3">
        <a
          href={`/directory/clinics/${params.city}/`}
          className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400 hover:shadow-sm transition-all"
        >
          <p className="font-medium text-neutral-900">Clinics In {cityTitle}</p>
          <p className="text-sm text-neutral-500 mt-1">Browse local clinic listings</p>
        </a>
        <a
          href={`/directory/practitioners/${params.city}/`}
          className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400 hover:shadow-sm transition-all"
        >
          <p className="font-medium text-neutral-900">Practitioners In {cityTitle}</p>
          <p className="text-sm text-neutral-500 mt-1">Browse local practitioner listings</p>
        </a>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-neutral-50 px-6 py-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Related Global Collections
        </h2>
        <div className="flex flex-wrap gap-3 mt-3">
          <Link href="/business/software/" className="inline-flex items-center rounded-md border border-neutral-300 bg-white text-neutral-900 px-4 py-2 text-sm font-semibold">
            Software
          </Link>
          <Link href="/business/practitioners/" className="inline-flex items-center rounded-md border border-neutral-300 bg-white text-neutral-900 px-4 py-2 text-sm font-semibold">
            Practitioners
          </Link>
          <Link href="/business/consent/" className="inline-flex items-center rounded-md border border-neutral-300 bg-white text-neutral-900 px-4 py-2 text-sm font-semibold">
            Consent
          </Link>
        </div>
      </section>
    </div>
  )
}
