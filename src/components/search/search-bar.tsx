"use client";

import { useSearchLogic } from "@/hooks/use-search-logic";
import { MobileSearchView } from "./mobile-search-view";
import { DesktopSearchView } from "./desktop-search-view";
type SearchBarProps = {
  handlePageChange?: (page: number) => void;
};
export function SearchBar({handlePageChange}: Readonly<SearchBarProps>) {
  const {
    isSearchPage,
    filters,
    isLoading,
    showResults,
    setShowResults,
    isExpanded,
    setIsExpanded,
    activeDropdown,
    setActiveDropdown,
    localFilters,
    setLocalFilters,
    options,
    getDynamicPlaceholderText,
    handleSearch,
  } = useSearchLogic();

  return (
    <div className='relative flex flex-col'>
      <div className="w-full max-w-7xl px-4 mx-auto space-y-6 sm:block pt-4">
        <MobileSearchView
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          getDynamicPlaceholderText={getDynamicPlaceholderText}
          localFilters={localFilters}
          setLocalFilters={setLocalFilters}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          options={options}
          isSearchPage={isSearchPage}
          setShowResults={setShowResults}
          handleSearch={handleSearch}
          isLoading={isLoading}
          handlePageChange={handlePageChange}
        />

        <DesktopSearchView
          localFilters={localFilters}
          setLocalFilters={setLocalFilters}
          showResults={showResults}
          setShowResults={setShowResults}
          options={options}
          isSearchPage={isSearchPage}
          handleSearch={handleSearch}
          isLoading={isLoading}
          handlePageChange={handlePageChange}
        />
      </div>
    </div>
  );
}