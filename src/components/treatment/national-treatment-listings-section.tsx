"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
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

interface NationalTreatmentListingsSectionProps {
  treatmentName: string
  clinics: Clinic[]
  practitioners: Practitioner[]
}

interface SearchableCitySelectProps {
  value: string
  options: string[]
  onChange: (value: string) => void
}

function toHeadingTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

function SearchableCitySelect({ value, options, onChange }: SearchableCitySelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const containerRef = useRef<HTMLDivElement | null>(null)

  const displayValue = value === "all" ? "All Cities" : value
  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return options
    return options.filter((city) => city.toLowerCase().includes(normalized))
  }, [options, query])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full sm:w-[220px]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between rounded-md border border-black bg-white px-3 text-sm text-black"
      >
        <span className="truncate">{displayValue}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-30 rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-2">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search cities"
              className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-black"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            <button
              type="button"
              onClick={() => {
                onChange("all")
                setOpen(false)
                setQuery("")
              }}
              className={cn(
                "w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50",
                value === "all" && "bg-gray-100 font-medium"
              )}
            >
              All Cities
            </button>
            {filteredOptions.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  onChange(city)
                  setOpen(false)
                  setQuery("")
                }}
                className={cn(
                  "w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50",
                  value === city && "bg-gray-100 font-medium"
                )}
              >
                {city}
              </button>
            ))}
            {filteredOptions.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted-foreground">No cities found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function getCityLabel(item: Clinic | Practitioner): string {
  return (item.City || "").trim()
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

export function NationalTreatmentListingsSection({
  treatmentName,
  clinics,
  practitioners,
}: NationalTreatmentListingsSectionProps) {
  const [activeTab, setActiveTab] = useState<ListingTab>("clinics")
  const [cityFilter, setCityFilter] = useState("all")
  const [sortBy, setSortBy] = useState<SortOption>("alphabetical")
  const [clinicPage, setClinicPage] = useState(1)
  const [practitionerPage, setPractitionerPage] = useState(1)

  const headingTreatment = toHeadingTitleCase(treatmentName)

  const cityOptions = useMemo(() => {
    const cities = new Set<string>()
    for (const clinic of clinics) {
      const city = getCityLabel(clinic)
      if (city) cities.add(city)
    }
    for (const practitioner of practitioners) {
      const city = getCityLabel(practitioner)
      if (city) cities.add(city)
    }
    return [...cities].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
  }, [clinics, practitioners])

  const filteredClinics = useMemo(() => {
    const scoped =
      cityFilter === "all"
        ? clinics
        : clinics.filter((clinic) => getCityLabel(clinic) === cityFilter)
    return sortListings(scoped, sortBy)
  }, [cityFilter, clinics, sortBy])

  const filteredPractitioners = useMemo(() => {
    const scoped =
      cityFilter === "all"
        ? practitioners
        : practitioners.filter((practitioner) => getCityLabel(practitioner) === cityFilter)
    return sortListings(scoped, sortBy)
  }, [cityFilter, practitioners, sortBy])

  const clinicTotalPages = Math.max(1, Math.ceil(filteredClinics.length / ITEMS_PER_PAGE))
  const practitionerTotalPages = Math.max(
    1,
    Math.ceil(filteredPractitioners.length / ITEMS_PER_PAGE)
  )

  const paginatedClinics = filteredClinics.slice(
    (clinicPage - 1) * ITEMS_PER_PAGE,
    clinicPage * ITEMS_PER_PAGE
  )
  const paginatedPractitioners = filteredPractitioners.slice(
    (practitionerPage - 1) * ITEMS_PER_PAGE,
    practitionerPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setClinicPage(1)
    setPractitionerPage(1)
  }, [cityFilter, sortBy, activeTab])

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
    <section className="border-t border-gray-200 bg-white py-10">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8 space-y-2 text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            {headingTreatment} Providers Across The UK
          </h2>
          <p className="text-sm text-muted-foreground">
            Browse clinics and practitioners offering {treatmentName.toLowerCase()} nationwide.
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
                Clinics ({filteredClinics.length})
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
                Practitioners ({filteredPractitioners.length})
              </button>
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <SearchableCitySelect
                value={cityFilter}
                options={cityOptions}
                onChange={setCityFilter}
              />

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
          </div>

          <TabsContent value="clinics" className="mt-0">
            {renderGrid(paginatedClinics, "No clinics found for this treatment.")}
            {renderPagination(clinicTotalPages, clinicPage, setClinicPage)}
          </TabsContent>

          <TabsContent value="practitioners" className="mt-0">
            {renderGrid(paginatedPractitioners, "No practitioners found for this treatment.")}
            {renderPagination(practitionerTotalPages, practitionerPage, setPractitionerPage)}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

export function NationalTreatmentListingsSkeleton() {
  return (
    <section className="border-t border-gray-200 bg-white py-10">
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
