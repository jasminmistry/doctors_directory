"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { getSearchDiscoveryData, searchPractitioners } from "@/app/actions/search";
import { SearchBar } from "@/components/search/search-bar";
import { PractitionerCard } from "@/components/practitioner-card";
import { SearchResultsHeader } from "@/components/search/search-results-header";
import { AdvancedFilterSidebar } from "@/components/filters/filterSidebar";
import { PractitionerCardSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { useSearchStore } from "@/app/stores/datastore";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SearchEmptyState } from "@/components/search/search-empty-state";

// Set to false to revert to infinite scroll
const USE_PAGINATION = true;

const ITEMS_PER_PAGE = 9;
type SearchType = "Clinic" | "Practitioner" | "Product" | "Treatments";

interface SearchPageProps {
  forcedType?: SearchType;
}

export default function SearchPage({ forcedType }: Readonly<SearchPageProps>) {
  const { filters, setFilters } = useSearchStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [data, setData] = useState<(any|string)[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [discoveryData, setDiscoveryData] = useState<Awaited<
    ReturnType<typeof getSearchDiscoveryData>
  > | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isAppendingRef = useRef(false);
  const requestIdRef = useRef(0);
  const isTypeReady = !forcedType || filters.type === forcedType;

  useEffect(() => {
    if (!forcedType) {
      return;
    }

    setFilters((prev) => {
      if (prev.type === forcedType) {
        return prev;
      }

      return {
        ...prev,
        type: forcedType,
      };
    });
  }, [forcedType, setFilters]);

  const loadResults = useCallback(
    async (page: number, mode: "replace" | "append" = "replace") => {
      if (mode === "append" && isAppendingRef.current) return;
      if (!isTypeReady) return;
      if (mode === "append") isAppendingRef.current = true;

      const requestId = ++requestIdRef.current;
      if (mode === "replace") setIsInitialLoading(true);
      else setIsLoadingMore(true);

      try {
        const result = await searchPractitioners(filters, page, sortBy);

        if (requestId !== requestIdRef.current) return;

        setData((prev) => mode === "replace" ? result.data : [...prev, ...result.data]);
        setTotalCount(result.totalCount);
        setTotalPages(result.totalPages);

        // Only fetch discovery/suggestion data when results are empty
        if (result.data.length === 0) {
          getSearchDiscoveryData(filters).then((discoveryResult) => {
            if (requestId === requestIdRef.current) {
              setDiscoveryData(discoveryResult);
            }
          });
        }
      } finally {
        isAppendingRef.current = false;
        setIsInitialLoading(false);
        setIsLoadingMore(false);
      }
    },
    [filters, isTypeReady, sortBy]
  );

  useEffect(() => {
    if (!isTypeReady) {
      return;
    }

    setCurrentPage(1);
    setData([]);
    setTotalPages(0);
    setTotalCount(0);
    requestIdRef.current += 1;
    void loadResults(1, "replace");
  }, [filters, isTypeReady, loadResults, sortBy]);

  // Infinite scroll observer — active when USE_PAGINATION = false
  useEffect(() => {
    if (USE_PAGINATION || !isTypeReady) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || isAppendingRef.current || currentPage >= totalPages) return;
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        void loadResults(nextPage, "append");
      },
      { rootMargin: "200px 0px", threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [currentPage, isTypeReady, loadResults, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
    void loadResults(page, "replace");
  };

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const VISIBLE = 4;
    if (totalPages <= VISIBLE + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= VISIBLE) {
      // Near the start: show first VISIBLE pages, ellipsis, last
      for (let i = 1; i <= VISIBLE; i++) pages.push(i);
      pages.push("ellipsis");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 1) {
      // Near the end: show first, ellipsis, last VISIBLE pages
      pages.push(1);
      pages.push("ellipsis");
      for (let i = totalPages - VISIBLE + 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Middle: show first, ellipsis, window around current, ellipsis, last
      pages.push(1);
      pages.push("ellipsis");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };
  return (
    <main className="min-h-screen bg-(--primary-bg-color)">
      <div className="bg-(--primary-bg-color) backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto max-w-6xl px-0 py-2">
          <Link href="/" prefetch={false}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:cursor-pointer hover:bg-white hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Directory
            </Button>
          </Link>
        </div>
      </div>
      <div className="max-w-6xl mx-auto py-2 border-[#C4C4C4] px-2 md:px-0">
        <SearchBar handlePageChange={handlePageChange} />
        <div className="block md:hidden">
          <AdvancedFilterSidebar />
        </div>
      </div>

      <section className="pt-2 py-10 md:px-4 bg-white md:bg-(--primary-bg-color)">
        <div className="container mx-auto max-w-6xl space-y-8">
          <div className="m-0 md:mb-4">
            <SearchResultsHeader
              totalResults={totalCount}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onToggleFilters={() => {}}
              filters={filters}
            />
          </div>
          <div className="grid grid-cols-1 md:gap-8 md:grid-cols-12">
            <div className="col-span-1 md:col-span-3">
              <div className="hidden md:block">
                <AdvancedFilterSidebar />
              </div>
            </div>

            {isInitialLoading && data.length === 0 ? (
              <div className="col-span-1 md:col-span-9 flex w-full flex-col justify-items-center ">
                <div
                  className="grid md:gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                  {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                    <PractitionerCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="col-span-1 md:col-span-9 flex w-full flex-col justify-items-center ">
                {/* Render your data here */}
                <div
                  className={
                    viewMode === "grid"
                      ? "grid md:gap-6 md:grid-cols-2 lg:grid-cols-3"
                      : "space-y-4"
                  }
                >
                  {data.length === 0 ? (
                    <SearchEmptyState
                      query={filters.query}
                      resultType={filters.type}
                      discoveryData={discoveryData}
                    />
                  ) : data.map((item) => {
                    if (typeof item === "string") {
                      return (
                        <PractitionerCard key={item} practitioner={item} />
                      );
                    }

                    if ("product_name" in item) {
                      return (
                        <PractitionerCard
                          key={item.product_name}
                          practitioner={item}
                        />
                      );
                    }
                    if (!("practitioner_name" in item)) {
                      return (
                        <PractitionerCard key={item.slug} practitioner={item} />
                      );
                    }
                    if ("practitioner_name" in item) {
                      return (
                        <PractitionerCard
                          key={item.practitioner_name + item.practitioner_title}
                          practitioner={item}
                        />
                      );
                    }
                  })}
                </div>
                {USE_PAGINATION ? totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          />
                        </PaginationItem>
                        {getPageNumbers().map((page, idx) => (
                          <PaginationItem key={idx}>
                            {page === "ellipsis" ? (
                              <PaginationEllipsis />
                            ) : (
                              <PaginationLink
                                isActive={page === currentPage}
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                ) : (
                  currentPage < totalPages && (
                    <div ref={sentinelRef} className="py-6 text-center text-sm text-gray-600">
                      {isLoadingMore ? "Loading more results..." : ""}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
