"use client";

import { Badge } from "@/components/ui/badge";
import type { SearchFilters } from "@/lib/types";
interface SearchResultsHeaderProps {
  totalResults: number;
  currentPage: number;
  itemsPerPage: number;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onToggleFilters: () => void;
  filters: SearchFilters;
}

export function SearchResultsHeader({
  totalResults,
  currentPage,
  itemsPerPage,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onToggleFilters,
  filters,
}: Readonly<SearchResultsHeaderProps>) {
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalResults);

  const hasQuery = typeof filters.query === "string" && filters.query.trim().length > 0;
  const hasCategory =
    typeof filters.category === "string" &&
    filters.category.trim().length > 0 &&
    filters.category !== "All Categories";
  const hasLocation =
    typeof filters.location === "string" &&
    filters.location.trim().length > 0 &&
    filters.location.toLowerCase() !== "all";

  const activeFiltersCount =
    (hasQuery ? 1 : 0) +
    (hasCategory ? 1 : 0) +
    (hasLocation ? 1 : 0) +
    (filters.rating > 0 ? 1 : 0) +
    filters.services.length;

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
      <div className="flex flex-col pt-2 w-full pb-4 px-4 md:px-0 md:pt-0 md:pb-0 md:border-0 border-b border-[#C4C4C4]">
        <h2 className="text-sm md:text-2xl md:font-semibold mb-1 md:mb-2">
          {totalResults > 0 ? "Aesthetics Directory" : ""}
        </h2>
        <div className="flex items-center gap-4 text-sm">
          {totalResults > 0 ? (
            <span>
              Showing {startIndex}-{endIndex} of {totalResults} {filters.type === "treatments" ? "treatments" : (filters.type + 's')}
            </span>
          ) : (
            <div className="col-span-1 md:col-span-8">
              {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                            gap-4">
                                {Array.from({ length: 9 }).map((_, i) => (
                                  <PractitionerCardSkeleton key={i} />
                                ))}
                              </div> */}
            </div>
          )}

          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="gap-1">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? "s" : ""}{" "}
              active
            </Badge>
          )}
        </div>
      </div>

      {/* <div className="flex w-full md:w-auto justify-center items-center gap-2 bg-white p-2 rounded-sm"> */}
      {/* <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className="shadow-none gap-2 bg-transparent"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button> */}

      {/* Sort */}
      {/* <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-40 shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="reviews">Most Reviews</SelectItem>
            <SelectItem value="newest">Newest Members</SelectItem>
          </SelectContent>
        </Select> */}

      {/* View Mode */}
      {/* <div className="flex border border-border rounded-md">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className=""
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div> */}
    </div>
  );
}
