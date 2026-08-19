"use client";

import { useRef } from "react";
import { IconCurrentLocation, IconX } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { SearchDropdown } from "./search-dropdown";
import { SearchButton } from "./search-button";
import { useSearchStore } from "@/app/stores/datastore";
import type { TreatmentSearchOption } from "@/lib/uk-treatment-search";

interface DesktopSearchViewProps {
  localFilters: any;
  setLocalFilters: (updater: (prev: any) => any) => void;
  showResults: boolean;
  setShowResults: (show: boolean) => void;
  options: string[];
  isSearchPage: boolean;
  handleSearch: () => void;
  isLoading: boolean;
  handlePageChange?: (page: number) => void;
  treatmentSearchOptions: TreatmentSearchOption[];
}

export function DesktopSearchView({
  localFilters,
  setLocalFilters,
  showResults,
  setShowResults,
  options,
  isSearchPage,
  handleSearch,
  isLoading,
  handlePageChange,
  treatmentSearchOptions,
}: DesktopSearchViewProps) {
  const { filters } = useSearchStore();
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = () => {
    closeTimeoutRef.current = setTimeout(() => setShowResults(false), 200);
  };

  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const clearQuery = () => {
    setLocalFilters((prev) => ({ ...prev, query: "" }));
    setShowResults(false);
  };

  const clearLocation = () => {
    setLocalFilters((prev) => ({ ...prev, location: "" }));
    setShowResults(false);
  };

  return (
    <div className="relative hidden md:block">
      <div className="flex flex-row items-center mb-2">
        <div className="relative">
          <button
            className="flex-none bg-white border border-r-0 border-[#e0e0e0]  px-4 py-3 rounded-l-lg"
            onClick={() => { cancelClose(); setShowResults(!showResults); }}
            onBlur={scheduleClose}
          >
            <Input
              value={localFilters.type}
              readOnly
              className="border-0 p-0 h-auto w-23 sm:w-30 text-base text-black cursor-pointer focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0"
            />
            <div className="pointer-events-none absolute top-1/2 right-3 w-1.5 h-1.5 border-b-[1.5px] border-r-[1.5px] border-black transform rotate-45 -translate-y-1/2"></div>
          </button>
        </div>

        <div className="relative flex-1 bg-white border rounded-r-lg sm:rounded-r-none border-[#e0e0e0]  px-4 py-3">
          <Input
            placeholder="Treatment, clinic or practitioner"
            value={localFilters.query}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, query: e.target.value }))
            }
            maxLength={255}
            className="border-0 shadow-none py-0 px-2 pr-7 h-auto w-full text-base placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-0 active:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0 active:ring-0"
            onFocus={() => { cancelClose(); setShowResults(true); }}
            onClick={() => { cancelClose(); setShowResults(true); }}
            onBlur={scheduleClose}
          />
          {localFilters.query && (
            <button
              type="button"
              aria-label="Clear search query"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors hover:text-gray-900"
              onMouseDown={(e) => e.preventDefault()}
              onClick={clearQuery}
            >
              <IconX stroke={1.5} className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="hidden sm:flex relative bg-white rounded-r-lg border border-[#e0e0e0]  px-4 py-3 items-center gap-2 w-44 flex-none">
          <IconCurrentLocation stroke={1.5} className="w-5 h-5 text-gray-600" />
          <Input
            placeholder="Location"
            value={localFilters.location}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                location: e.target.value,
              }))
            }
            className="border-0 min-w-[80px] shadow-none p-0 pr-7 h-6 text-base placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-0 active:outline-none active:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0"
            onKeyDown={(e) => e.key === "Enter"}
            onFocus={() => { cancelClose(); setShowResults(true); }}
            onBlur={scheduleClose}
            onClick={() => { cancelClose(); setShowResults(true); }}
          />
          {localFilters.location && (
            <button
              type="button"
              aria-label="Clear location"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors hover:text-gray-900"
              onMouseDown={(e) => e.preventDefault()}
              onClick={clearLocation}
            >
              <IconX stroke={1.5} className="h-4 w-4" />
            </button>
          )}
        </div>

        <SearchButton isLoading={isLoading} onClick={() =>{handleSearch(); handlePageChange?.(1)}} />
      </div>

      {showResults && (
        <SearchDropdown
          isMobile={false}
          activeDropdown={null}
          showResults={showResults}
          localFilters={localFilters}
          options={options}
          isSearchPage={isSearchPage}
          setLocalFilters={setLocalFilters}
          setActiveDropdown={() => {}}
          setShowResults={setShowResults}
          treatmentSearchOptions={treatmentSearchOptions}
        />
      )}
    </div>
  );
}