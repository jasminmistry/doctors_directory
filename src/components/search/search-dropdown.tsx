"use client";

import { useMemo, useRef } from "react";
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
    : "flex w-full bg-white rounded-lg shadow-lg border border-gray-200 p-6";

  const clsgrd = "gap-4";
  const gridClasses = isMobile
    ? "w-full"
    : `grid grid-cols-3 w-full ${clsgrd}`;

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
  const locationListRef = useRef<HTMLDivElement | null>(null);
  const locationItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const alphabet = useMemo(
    () => Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index)),
    []
  );
  const availableLocationLetters = useMemo(() => {
    const letters = new Set<string>();

    for (const loc of filteredLocations) {
      const firstLetter = loc.charAt(0).toUpperCase();
      if (/^[A-Z]$/.test(firstLetter)) {
        letters.add(firstLetter);
      }
    }

    return letters;
  }, [filteredLocations]);

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

  const handleLocationLetterJump = (letter: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const firstMatch = filteredLocations.find(
      (loc) => loc.charAt(0).toUpperCase() === letter
    );

    if (!firstMatch) return;

    const target = locationItemRefs.current[firstMatch];
    const container = locationListRef.current;
    if (!target || !container) return;

    const containerTop = container.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;
    const offset = targetTop - containerTop + container.scrollTop;

    container.scrollTo({ top: offset, behavior: "smooth" });
  };

  return (
    <div className={dropdownClasses}>
      <div className={gridClasses}>
        {(activeDropdown === 'type' || (!isMobile && showResults)) && (
          <div className="flex flex-col min-w-0 h-96">
            <h3 className="font-semibold text-left text-gray-900 mb-4">Type</h3>
            <div className="flex-1 space-y-2 overflow-y-auto">
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
          <div className="flex flex-col min-w-0 h-96">
            <h3 className="font-semibold text-left text-gray-900 mb-4">Service Categories</h3>
            <div className="flex-1 space-y-2 overflow-y-auto">
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
          <div className="flex flex-col min-w-0 h-96">
            <h3 className="font-semibold text-left text-gray-900 mb-4">Location</h3>
            <div className="flex gap-2 flex-1 min-h-0">
              <div
                ref={locationListRef}
                className="flex-1 space-y-2 overflow-y-auto pr-2"
              >
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((loc: string) => (
                    <button
                      key={loc}
                      ref={(element) => {
                        locationItemRefs.current[loc] = element;
                      }}
                      onClick={() => handleLocationClick(loc)}
                      className="text-left text-sm font-medium w-full flex items-center gap-3 hover:bg-gray-50 hover:text-black active:bg-gray-100 p-2 rounded overflow-x-hidden whitespace-nowrap"
                    >
                      {loc}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 p-2">No results found.</p>
                )}
              </div>
              <div className="flex flex-col justify-between h-full sticky top-0">
                {alphabet.map((letter) => {
                  const isAvailable = availableLocationLetters.has(letter);

                  return (
                    <button
                      key={letter}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => handleLocationLetterJump(letter, e)}
                      className="w-4 flex-1 rounded text-[10px] font-semibold leading-none transition-colors flex items-center justify-center border border-gray-200 text-gray-500 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:border-gray-200 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                      aria-label={`Jump to locations starting with ${letter}`}
                      disabled={!isAvailable}
                      title={`${letter}${!isAvailable ? ' (no results)' : ''}`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}