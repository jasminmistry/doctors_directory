"use client";

import { IconChevronDown, IconCurrentLocation, IconX } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconLoader2, IconSearch } from "@tabler/icons-react";
import { SearchDropdown } from "./search-dropdown";
import { SearchButton } from "./search-button";

interface MobileSearchViewProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  getDynamicPlaceholderText: () => string;
  localFilters: any;
  setLocalFilters: (updater: (prev: any) => any) => void;
  activeDropdown: 'type' | 'category' | 'location' | null;
  setActiveDropdown: (dropdown: 'type' | 'category' | 'location' | null) => void;
  options: string[];
  isSearchPage: boolean;
  setShowResults: (show: boolean) => void;
  handleSearch: () => void;
  isLoading: boolean;
  handlePageChange?: (page: number) => void;
}

export function MobileSearchView({
  isExpanded,
  setIsExpanded,
  getDynamicPlaceholderText,
  localFilters,
  setLocalFilters,
  activeDropdown,
  setActiveDropdown,
  options,
  isSearchPage,
  setShowResults,
  handleSearch,
  isLoading,
  handlePageChange,
}: MobileSearchViewProps) {
  const clearQuery = () => {
    setLocalFilters((prev) => ({ ...prev, query: "" }));
    setActiveDropdown(null);
  };

  const clearLocation = () => {
    setLocalFilters((prev) => ({ ...prev, location: "" }));
    setActiveDropdown(null);
  };

  return (
    <div className="w-full block md:hidden">
      {!isExpanded ? (
        <button
          className="w-full flex items-center bg-white border border-[#e0e0e0]  rounded-lg px-4 py-3 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setIsExpanded(true)}
        >
          <IconSearch stroke={1.5} className="w-5 h-5 text-gray-600 mr-3" />
          <span className="text-gray-600 flex-1">{getDynamicPlaceholderText()}</span>
          <IconChevronDown stroke={1.5} className="w-5 h-5 text-gray-600" />
        </button>
      ) : (
        <div className="rounded-lg p-4 z-50">
          <div className="space-y-4">
            <div className="relative">
              <button
                className="w-full bg-white border border-[#e0e0e0]  px-4 py-3 rounded-lg text-left"
                onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
                onBlur={() => setTimeout(() => setActiveDropdown(null), 350)}
              >
                <Input
                  value={localFilters.type || "Select type"}
                  readOnly
                  className="border-0 p-0 h-auto w-full text-base text-black cursor-pointer focus-visible:ring-offset-0 focus-visible:ring-0"
                  placeholder="Select type"
                />
                <div className="pointer-events-none absolute top-1/2 right-3 w-1.5 h-1.5 border-b-[1.5px] border-r-[1.5px] border-black transform rotate-45 -translate-y-1/2"></div>
              </button>
              {activeDropdown === 'type' && (
                <SearchDropdown
                  isMobile={true}
                  activeDropdown={activeDropdown}
                  showResults={false}
                  localFilters={localFilters}
                  options={options}
                  isSearchPage={isSearchPage}
                  setLocalFilters={setLocalFilters}
                  setActiveDropdown={setActiveDropdown}
                  setShowResults={setShowResults}
                />
              )}
            </div>

            <div className="relative">
              <Input
                placeholder="I'm searching for"
                value={localFilters.query}
                onChange={(e) =>
                  setLocalFilters((prev) => ({ ...prev, query: e.target.value }))
                }
                maxLength={255}
                className="w-full bg-white border border-[#e0e0e0]  px-4 py-3 pr-10 rounded-lg h-12"
                onFocus={() => setActiveDropdown('category')}
                onClick={() => setActiveDropdown('category')}
                onBlur={() => setTimeout(() => setActiveDropdown(null), 350)}
              />
              {localFilters.query && (
                <button
                  type="button"
                  aria-label="Clear search query"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 transition-colors hover:text-gray-700"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={clearQuery}
                >
                  <IconX stroke={1.5} className="h-4 w-4" />
                </button>
              )}
              {activeDropdown === 'category' && (
                <SearchDropdown
                  isMobile={true}
                  activeDropdown={activeDropdown}
                  showResults={false}
                  localFilters={localFilters}
                  options={options}
                  isSearchPage={isSearchPage}
                  setLocalFilters={setLocalFilters}
                  setActiveDropdown={setActiveDropdown}
                  setShowResults={setShowResults}
                />
              )}
            </div>

            <div className="relative">
              <div className="relative">
                <IconCurrentLocation stroke={1.5} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                <Input
                  placeholder="Location"
                  value={localFilters.location}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="w-full bg-white border border-[#e0e0e0]  px-4 py-3 rounded-lg pl-10 pr-10 h-12"
                  onFocus={() => setActiveDropdown('location')}
                  onClick={() => setActiveDropdown('location')}
                  onBlur={() => setTimeout(() => setActiveDropdown(null), 350)}
                />
                {localFilters.location && (
                  <Button
                    type="button"
                    aria-label="Clear location"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={clearLocation}
                  >
                    <IconX stroke={1.5} className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {activeDropdown === 'location' && (
                <SearchDropdown
                  isMobile={true}
                  activeDropdown={activeDropdown}
                  showResults={false}
                  localFilters={localFilters}
                  options={options}
                  isSearchPage={isSearchPage}
                  setLocalFilters={setLocalFilters}
                  setActiveDropdown={setActiveDropdown}
                  setShowResults={setShowResults}
                />
              )}
            </div>
            <Button
              variant="default"
              size="lg"
              className="w-full"
              onClick={()=>{handleSearch(); handlePageChange?.(1)}}
              disabled={isLoading}
            >
              {isLoading ? (
                <IconLoader2 stroke={1.5} className="h-5 w-5 animate-spin" />
              ) : (
                <IconSearch stroke={1.5} className="h-5 w-5" />
              )}
            </Button>

           
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setIsExpanded(false)}
              className="mx-auto block"
            >
              Collapse
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}