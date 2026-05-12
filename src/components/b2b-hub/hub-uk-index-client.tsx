"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  HubIndexHeroSearch,
  HUB_INDEX_HERO_TITLE_CLASS_SECTION,
} from "@/components/b2b-hub/hub-index-hero-search"
import {
  UK_CITY_HUB_ENTRY_SLUG,
  UK_POPULAR_TREATMENTS,
  UK_PRIORITY_CITIES,
} from "@/lib/b2b-hub/uk-hub-index-data"
import { toUrlSlug } from "@/lib/utils"

function matchesQuery(q: string, text: string) {
  const s = q.trim().toLowerCase()
  if (!s) return true
  return text.toLowerCase().includes(s)
}

type Props = {
  allCities: string[]
  featuredCityNames: string[]
}

export function HubUkIndexClient({ allCities, featuredCityNames }: Props) {
  const [q, setQ] = useState("")

  const gridEntries = useMemo(() => {
    const filtered = allCities.filter((city) => matchesQuery(q, city))
    return filtered.map((city) => {
      const slug = toUrlSlug(city)
      return {
        key: slug,
        href: `/business/uk/${slug}/${UK_CITY_HUB_ENTRY_SLUG}/`,
        title: city,
        subtitle: `Directory coverage — clinics and practitioners in ${city}.`,
      }
    })
  }, [allCities, q])

  const filteredFeatured = useMemo(
    () => featuredCityNames.filter((city) => matchesQuery(q, city)),
    [featuredCityNames, q]
  )

  const filteredPriority = useMemo(
    () => UK_PRIORITY_CITIES.filter((city) => matchesQuery(q, city)),
    [q]
  )

  const byLetter = useMemo(() => {
    const filtered = allCities.filter((city) => matchesQuery(q, city))
    return filtered.reduce<Record<string, string[]>>((acc, city) => {
      const letter = city[0]?.toUpperCase() || "#"
      if (!acc[letter]) acc[letter] = []
      acc[letter].push(city)
      return acc
    }, {})
  }, [allCities, q])

  const letters = Object.keys(byLetter).sort()

  const filteredPopular = useMemo(
    () =>
      UK_POPULAR_TREATMENTS.filter((t) => matchesQuery(q, t.name)),
    [q]
  )

  return (
    <>
      <HubIndexHeroSearch
        heroTitle="By City"
        heroSubtitle="City coverage for the B2B buyer hub follows the same city source as the directory. Use search or browse priority cities and the full directory list."
        searchPlaceholder="Search cities"
        query={q}
        onQueryChange={setQ}
        inputId="hub-uk-search"
        heroTitleClassName={HUB_INDEX_HERO_TITLE_CLASS_SECTION}
      />
      <section className="bg-white px-4 pt-8 pb-12 md:pb-16">
        <div className="max-w-[1280px] mx-auto">
          {q.trim() ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center mb-14">
                {gridEntries.map((e) => (
                  <Link
                    key={e.key}
                    href={e.href}
                    className="w-full max-w-[404px] rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-4 flex flex-col gap-1.5 hover:border-neutral-400 hover:shadow-sm transition-all text-left min-h-[78px]"
                  >
                    <span className="font-semibold text-neutral-900 leading-snug">
                      {e.title}
                    </span>
                    <span className="text-sm text-neutral-600 leading-snug line-clamp-3">
                      {e.subtitle}
                    </span>
                  </Link>
                ))}
              </div>
              {gridEntries.length === 0 ? (
                <p className="text-center text-neutral-500 py-8 mb-10">
                  No cities match &ldquo;{q}&rdquo;.
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-center text-neutral-500 text-base max-w-2xl mx-auto mb-14 leading-relaxed">
              Search to filter cities and open the local buyer hub. Below you can
              jump to featured links, the priority list (each city opens the same hub
              entry page), and the full A–Z directory.
            </p>
          )}

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Featured City Links
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredFeatured.map((city) => {
                const slug = toUrlSlug(city)
                return (
                  <div
                    key={city}
                    className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4"
                  >
                    <p className="font-medium text-neutral-900 mb-2">{city}</p>
                    <div className="flex flex-col gap-1.5">
                      <Link
                        href={`/business/uk/${slug}/${UK_CITY_HUB_ENTRY_SLUG}/`}
                        className="text-sm font-medium text-neutral-900 hover:underline"
                      >
                        Local buyer hub
                      </Link>
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
                )
              })}
            </div>
            {filteredFeatured.length === 0 ? (
              <p className="text-sm text-neutral-500 mt-2">
                No featured cities match your search.
              </p>
            ) : null}
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Priority City Batch
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {filteredPriority.map((city) => {
                const slug = toUrlSlug(city)
                return (
                  <Link
                    key={city}
                    href={`/business/uk/${slug}/${UK_CITY_HUB_ENTRY_SLUG}/`}
                    className="rounded-[12px] border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2 text-sm text-neutral-800 text-center transition-colors hover:border-neutral-400 hover:bg-white hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                  >
                    {city}
                  </Link>
                )
              })}
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
                    {byLetter[letter].map((city) => {
                      const slug = toUrlSlug(city)
                      return (
                        <Link
                          key={city}
                          href={`/business/uk/${slug}/${UK_CITY_HUB_ENTRY_SLUG}/`}
                          className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-1 text-xs text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-neutral-900"
                        >
                          {city}
                        </Link>
                      )
                    })}
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
              {filteredPopular.map((treatment) => (
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
                  <p className="text-sm font-medium text-neutral-900">
                    {treatment.name}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Link
                href="/treatments/"
                className="inline-flex items-center rounded-[12px] bg-black text-white px-8 py-3 text-sm font-semibold hover:bg-neutral-900 transition-colors"
              >
                See All Treatments
              </Link>
            </div>
          </section>

          <section className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-6 py-6">
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              City Coverage Reference
            </h3>
            <p className="text-neutral-600 mb-4">
              This index lists the cities currently represented in directory data
              and links to corresponding clinic and practitioner pages.
            </p>
            <Link
              href="/business/"
              className="inline-flex items-center justify-center rounded-[12px] border-2 border-neutral-900 bg-white px-8 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
            >
              Back To Buyer Hub
            </Link>
          </section>
        </div>
      </section>
    </>
  )
}
