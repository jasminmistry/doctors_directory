"use client";

import { search_categories, locations } from "@/lib/data";

interface SearchDropdownProps {
  isMobile: boolean;
  activeDropdown: 'type' | 'category' | 'location' | null;
  showResults: boolean;
  localFilters: {
    query: string;
    location: string;
    type: string;
  };
  options: string[];
  isSearchPage: boolean;
  setLocalFilters: (updater: (prev: any) => any) => void;
  setActiveDropdown: (dropdown: 'type' | 'category' | 'location' | null) => void;
  setShowResults: (show: boolean) => void;
}

export function SearchDropdown({
  isMobile,
  activeDropdown,
  showResults,
  localFilters,
  options,
  isSearchPage,
  setLocalFilters,
  setActiveDropdown,
  setShowResults
}: SearchDropdownProps) {
  if (isMobile && !activeDropdown) return null;
  if (!isMobile && !showResults && !activeDropdown) return null;

  const dropdownClasses = isMobile
    ? "absolute top-full left-0 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 mt-1"
    : "flex bg-white rounded-lg shadow-lg border border-gray-200 p-6";

  const clsgrd = "gap-4";
  const gridClasses = isMobile
    ? "w-full"
    : `grid grid-cols-1 sm:grid-cols-3 ${clsgrd}`;

  const filteredCategories = search_categories.filter((category: string) =>
    category.toLowerCase().includes(localFilters.query.toLowerCase())
  ).length > 0
    ? search_categories.filter((category: string) =>
        category.toLowerCase().includes(localFilters.query.toLowerCase())
      )
    : search_categories;

  const locationQuery = (localFilters.location || "").trim().toLowerCase();
  const filteredLocations = locations.filter(
    (loc): loc is string =>
      typeof loc === "string" &&
      (locationQuery.length === 0 || loc.toLowerCase().includes(locationQuery))
  );

  const handleTypeClick = (opt: string) => {
    setLocalFilters((prev) => ({ ...prev, type: opt }));
    setActiveDropdown(null);
    setShowResults(false);
  };

  const handleCategoryClick = (specialty: string) => {
    setLocalFilters((prev) => ({ ...prev, query: specialty }));
    setActiveDropdown(null);
    setShowResults(false);
  };

  const handleLocationClick = (loc: string) => {
    setLocalFilters((prev) => ({ ...prev, location: loc }));
    setActiveDropdown(null);
    setShowResults(false);
  };

  return (
    <div className={dropdownClasses}>
      <div className={gridClasses}>
        {(activeDropdown === 'type' || (!isMobile && showResults)) && (
          <div className="w-full">
            <h3 className="font-semibold text-left text-gray-900 mb-4">Type</h3>
            <div className="w-full space-y-2 overflow-auto max-h-50 md:max-h-100">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className="w-full text-left text-sm font-medium flex items-center gap-3 p-2 rounded hover:bg-gray-50 hover:text-black active:bg-gray-100"
                  onClick={() => handleTypeClick(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {(activeDropdown === 'category' || (!isMobile && showResults)) && (
          <div className="w-full">
            <h3 className="font-semibold text-left text-gray-900 mb-4">Service Categories</h3>
            <div className="w-full space-y-2 overflow-auto max-h-50 md:max-h-100">
              {filteredCategories.map((specialty: string) => (
                <button
                  key={specialty}
                  onClick={() => handleCategoryClick(specialty)}
                  className="hover:bg-gray-50 hover:text-black active:bg-gray-100 text-left text-sm font-medium w-full flex items-center gap-3 p-2 rounded"
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>
        )}

        {(activeDropdown === 'location' || (!isMobile && showResults)) && (
          <div className="w-full">
            <h3 className="font-semibold text-left text-gray-900 mb-4">Location</h3>
            <div className="w-full space-y-2 overflow-auto max-h-50 md:max-h-100">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc: string) => (
                  <button
                    key={loc}
                    onClick={() => handleLocationClick(loc)}
                    className="text-left text-sm font-medium w-full flex items-center gap-3 hover:bg-gray-50 hover:text-black active:bg-gray-100 p-2 rounded"
                  >
                    {loc}
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500 p-2">No results found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}