"use client"

import { useEffect, useMemo, useState } from "react"
import type { Clinic, Practitioner } from "@/lib/types"
import { PractitionerCard } from "@/components/practitioner-card"
import { PractitionerCardSkeleton } from "@/components/loading-skeleton"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { getClinicDisplayName } from "@/lib/clinic-display"
import { cn } from "@/lib/utils"

type ListingTab = "clinics" | "practitioners"
type SortOption = "alphabetical" | "top-rated" | "most-reviews"

const ITEMS_PER_PAGE = 9

interface CityHubListingsSectionProps {
  cityName: string
  clinics: Clinic[]
  practitioners: Practitioner[]
}

function toHeadingTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

function getSortLabel(item: Clinic | Practitioner): string {
  if ("practitioner_name" in item && item.practitioner_name) {
    return item.practitioner_name
  }
  return getClinicDisplayName(item as Clinic)
}

function sortListings<T extends Clinic | Practitioner>(items: T[], sortBy: SortOption): T[] {
  const sorted = [...items]
  if (sortBy === "top-rated") {
    return sorted.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
  }
  if (sortBy === "most-reviews") {
    return sorted.sort((a, b) => (Number(b.reviewCount) || 0) - (Number(a.reviewCount) || 0))
  }
  return sorted.sort((a, b) =>
    getSortLabel(a).localeCompare(getSortLabel(b), undefined, { sensitivity: "base" })
  )
}

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

export function CityHubListingsSection({
  cityName,
  clinics,
  practitioners,
}: CityHubListingsSectionProps) {
  const [activeTab, setActiveTab] = useState<ListingTab>("clinics")
  const [sortBy, setSortBy] = useState<SortOption>("alphabetical")
  const [clinicPage, setClinicPage] = useState(1)
  const [practitionerPage, setPractitionerPage] = useState(1)

  const headingCity = toHeadingTitleCase(cityName)

  const sortedClinics = useMemo(() => sortListings(clinics, sortBy), [clinics, sortBy])
  const sortedPractitioners = useMemo(
    () => sortListings(practitioners, sortBy),
    [practitioners, sortBy]
  )

  const clinicTotalPages = Math.max(1, Math.ceil(sortedClinics.length / ITEMS_PER_PAGE))
  const practitionerTotalPages = Math.max(
    1,
    Math.ceil(sortedPractitioners.length / ITEMS_PER_PAGE)
  )

  const paginatedClinics = sortedClinics.slice(
    (clinicPage - 1) * ITEMS_PER_PAGE,
    clinicPage * ITEMS_PER_PAGE
  )
  const paginatedPractitioners = sortedPractitioners.slice(
    (practitionerPage - 1) * ITEMS_PER_PAGE,
    practitionerPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setClinicPage(1)
    setPractitionerPage(1)
  }, [sortBy, activeTab])

  useEffect(() => {
    if (clinicPage > clinicTotalPages) setClinicPage(clinicTotalPages)
  }, [clinicPage, clinicTotalPages])

  useEffect(() => {
    if (practitionerPage > practitionerTotalPages) setPractitionerPage(practitionerTotalPages)
  }, [practitionerPage, practitionerTotalPages])

  const renderPagination = (
    totalPages: number,
    currentPage: number,
    onPageChange: (page: number) => void
  ) => {
    if (totalPages <= 1) return null
    return (
      <div className="mt-8">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )
  }

  const renderGrid = (items: Array<Clinic | Practitioner>, emptyLabel: string) => {
    if (items.length === 0) {
      return (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      )
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          if ("practitioner_name" in item) {
            return (
              <PractitionerCard
                key={`${item.practitioner_name}-${item.practitioner_title || ""}`}
                practitioner={item}
              />
            )
          }
          return <PractitionerCard key={item.slug} practitioner={item} />
        })}
      </div>
    )
  }

  return (
    <section className="border-t border-gray-200 bg-(--primary-bg-color) py-10">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8 space-y-2 text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            All Clinics & Practitioners in {headingCity}
          </h2>
          <p className="text-sm text-muted-foreground">
            Browse every provider in {cityName}, across all treatments.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ListingTab)}
          className="w-full"
        >
          <div className="mb-6 flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("clinics")}
                className={cn(
                  "rounded-lg border border-black px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer",
                  activeTab === "clinics"
                    ? "bg-black text-white hover:bg-black hover:text-white"
                    : "bg-white text-black hover:bg-gray-50"
                )}
              >
                Clinics ({sortedClinics.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("practitioners")}
                className={cn(
                  "rounded-lg border border-black px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer",
                  activeTab === "practitioners"
                    ? "bg-black text-white hover:bg-black hover:text-white"
                    : "bg-white text-black hover:bg-gray-50"
                )}
              >
                Practitioners ({sortedPractitioners.length})
              </button>
            </div>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="h-11 w-full min-w-[180px] border-black bg-white sm:w-[220px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="top-rated">Top Rated</SelectItem>
                <SelectItem value="most-reviews">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="clinics" className="mt-0">
            {renderGrid(paginatedClinics, "No clinics found.")}
            {renderPagination(clinicTotalPages, clinicPage, setClinicPage)}
          </TabsContent>

          <TabsContent value="practitioners" className="mt-0">
            {renderGrid(paginatedPractitioners, "No practitioners found.")}
            {renderPagination(practitionerTotalPages, practitionerPage, setPractitionerPage)}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

export function CityHubListingsSkeleton() {
  return (
    <section className="border-t border-gray-200 bg-(--primary-bg-color) py-10">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-6 flex justify-center">
          <div className="h-8 w-72 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <PractitionerCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
