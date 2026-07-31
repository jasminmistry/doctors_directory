"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import type { TreatmentCityHubEntry } from "@/lib/treatment-city-hub"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface TreatmentCityPickerSectionProps {
  treatmentName: string
  treatmentSlug: string
  cities: TreatmentCityHubEntry[]
}

const CITIES_PER_PAGE = 24

function getPageNumbers(totalPages: number, currentPage: number): Array<number | "ellipsis"> {
  const pages: Array<number | "ellipsis"> = []
  const visible = 4
  if (totalPages <= visible + 2) {
    for (let page = 1; page <= totalPages; page += 1) pages.push(page)
    return pages
  }
  if (currentPage <= visible) {
    for (let page = 1; page <= visible; page += 1) pages.push(page)
    pages.push("ellipsis")
    pages.push(totalPages)
    return pages
  }
  if (currentPage >= totalPages - 1) {
    pages.push(1)
    pages.push("ellipsis")
    for (let page = totalPages - visible + 1; page <= totalPages; page += 1) pages.push(page)
    return pages
  }
  pages.push(1)
  pages.push("ellipsis")
  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) pages.push(page)
  pages.push("ellipsis")
  pages.push(totalPages)
  return pages
}

export function TreatmentCityPickerSection({
  treatmentName,
  treatmentSlug,
  cities,
}: TreatmentCityPickerSectionProps) {
  const [query, setQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredCities = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return cities
    }
    return cities.filter((city) => city.locationLabel.toLowerCase().includes(normalized))
  }, [cities, query])

  const totalPages = Math.max(1, Math.ceil(filteredCities.length / CITIES_PER_PAGE))
  const paginatedCities = filteredCities.slice(
    (currentPage - 1) * CITIES_PER_PAGE,
    currentPage * CITIES_PER_PAGE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [query])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  if (cities.length === 0) {
    return null
  }

  return (
    <section className="border-t border-gray-200 bg-white py-10">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8 space-y-2 text-center">
          <h2 className="text-2xl font-semibold text-foreground">{treatmentName} by City</h2>
          <p className="text-sm text-muted-foreground">
            Choose a city to compare {treatmentName.toLowerCase()} clinics and practitioners near you.
          </p>
        </div>

        <div className="mx-auto mb-6 max-w-md">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search cities"
            className="h-11 w-full rounded-md border border-black bg-white px-4 text-sm outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {filteredCities.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No cities match your search.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedCities.map((city) => (
                <Link
                  key={city.locationSlug}
                  href={`/${treatmentSlug}/${city.locationSlug}/`}
                  className="flex min-h-[78px] flex-col gap-1.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-4 text-left transition-all hover:border-neutral-400 hover:shadow-sm"
                >
                  <span className="font-semibold leading-snug text-neutral-900">
                    {city.locationLabel}
                  </span>
                  <span className="text-sm leading-snug text-neutral-600">
                    {city.clinicCount} clinic{city.clinicCount === 1 ? "" : "s"} ·{" "}
                    {city.practitionerCount} practitioner
                    {city.practitionerCount === 1 ? "" : "s"}
                  </span>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    {getPageNumbers(totalPages, currentPage).map((page, index) => (
                      <PaginationItem key={`${page}-${index}`}>
                        {page === "ellipsis" ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            isActive={page === currentPage}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
