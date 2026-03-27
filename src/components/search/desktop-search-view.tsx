"use client";

import { useRef } from "react";
import { Locate, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SearchDropdown } from "./search-dropdown";
import { SearchButton } from "./search-button";
import { useSearchStore } from "@/app/stores/datastore";

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
  handlePageChange
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
  };

  const clearLocation = () => {
    setLocalFilters((prev) => ({ ...prev, location: "" }));
  };

  return (
    <div className="hidden md:block">
      <div className="flex flex-row items-center mb-2">
        <div className="relative">
          <button
            className="flex-1 bg-white border border-r-0 border-gray-300 px-4 py-3 rounded-l-lg"
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

        <div className="relative flex-1 bg-white border rounded-r-lg sm:rounded-r-none border-gray-300 px-4 py-3">
          <Input
            placeholder="I'm searching for"
            value={localFilters.query}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, query: e.target.value }))
            }
            className="border-0 shadow-none p-0 pr-7 h-auto w-full text-base placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-0 active:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0 active:ring-0"
            onFocus={() => { cancelClose(); setShowResults(true); }}
            onClick={() => { cancelClose(); setShowResults(true); }}
            onBlur={scheduleClose}
          />
          {localFilters.query && (
            <button
              type="button"
              aria-label="Clear search query"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700"
              onMouseDown={(e) => e.preventDefault()}
              onClick={clearQuery}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="hidden sm:flex relative bg-white rounded-r-lg border border-gray-300 px-4 py-3 items-center gap-2">
          <Locate className="w-5 h-5 text-gray-600" />
          <Input
            placeholder="Location"
            value={localFilters.location}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                location: e.target.value,
              }))
            }
            className="border-0 min-w-[80px] shadow-none p-0 pr-7 h-6 text-base placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-0 active:outline-none active:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0"
            onKeyDown={(e) => e.key === "Enter"}
            onFocus={() => { cancelClose(); setShowResults(true); }}
            onBlur={scheduleClose}
            onClick={() => { cancelClose(); setShowResults(true); }}
          />
          {localFilters.location && (
            <button
              type="button"
              aria-label="Clear location"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700"
              onMouseDown={(e) => e.preventDefault()}
              onClick={clearLocation}
            >
              <X className="h-4 w-4" />
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
        />
      )}
    </div>
  );
}