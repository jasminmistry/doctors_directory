"use client";

import { useEffect, useState } from "react";
import { useSearchLogic } from "@/hooks/use-search-logic";
import { MobileSearchView } from "./mobile-search-view";
import { DesktopSearchView } from "./desktop-search-view";
import { getTreatmentSearchOptions } from "@/app/actions/search";
import type { TreatmentSearchOption } from "@/lib/uk-treatment-search";

type SearchBarProps = {
  handlePageChange?: (page: number) => void;
};

export function SearchBar({handlePageChange}: Readonly<SearchBarProps>) {
  const [treatmentSearchOptions, setTreatmentSearchOptions] = useState<TreatmentSearchOption[]>([]);

  useEffect(() => {
    void getTreatmentSearchOptions().then(setTreatmentSearchOptions);
  }, []);

  const {
    isSearchPage,
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
  } = useSearchLogic(treatmentSearchOptions);

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
          treatmentSearchOptions={treatmentSearchOptions}
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
          treatmentSearchOptions={treatmentSearchOptions}
        />
      </div>
    </div>
  );
}