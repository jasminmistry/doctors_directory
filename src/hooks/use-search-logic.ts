"use client";

import { useState, useEffect, startTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSearchStore } from "@/app/stores/datastore";
import { trackSearchUsage } from "@/lib/tracking/client";
import {
  resolveDirectorySearchHref,
  type TreatmentSearchOption,
} from "@/lib/uk-treatment-search";

export function useSearchLogic(treatmentSearchOptions: TreatmentSearchOption[] = []) {
  const pathname = usePathname();
  const isSearchPage = pathname.includes("/search");
  const { filters, setFilters } = useSearchStore();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'type' | 'category' | 'location' | null>(null);

  const [localFilters, setLocalFilters] = useState(() => {
    if (pathname.includes("/treatments") && filters.type !== "Treatments") {
      return { ...filters, type: "Treatments" };
    }
    return filters;
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [pathname, filters]);

  const options = ["Practitioner", "Clinic", "Product", "Treatments"];

  const getDynamicPlaceholderText = () => {
    let parts = [];

    if (localFilters.type && localFilters.type !== "Practitioner") {
      parts.push(localFilters.type.toLowerCase());
    } else {
      parts.push("doctor, practitioner");
    }

    if (localFilters.query && localFilters.query.trim()) {
      parts.push(localFilters.query.toLowerCase());
    } else {
      parts.push("treatment");
    }

    if (localFilters.location && localFilters.location.trim()) {
      return `Find ${parts.join(", ")} in ${localFilters.location}`;
    }

    return `Find ${parts.join(", ")}`;
  };

  const handleSearch = async () => {
    setIsLoading(true);
    const trimmedFilters = {
      ...localFilters,
      query: localFilters.query?.trim() ?? localFilters.query,
      location: localFilters.location?.trim() ?? localFilters.location,
    };
    void trackSearchUsage({
      query: trimmedFilters.query,
      type: trimmedFilters.type,
      category: trimmedFilters.category,
      location: trimmedFilters.location,
    });
    setShowResults(false);
    setIsExpanded(false);

    const categoryHref = resolveDirectorySearchHref(
      {
        type: trimmedFilters.type || "",
        query: trimmedFilters.query || "",
        location: trimmedFilters.location || "",
      },
      treatmentSearchOptions
    );

    if (categoryHref) {
      setFilters(trimmedFilters);
      setLocalFilters(trimmedFilters);
      router.push(categoryHref);
      setIsLoading(false);
      return;
    }

    setFilters(trimmedFilters);
    setLocalFilters(trimmedFilters);

    if (pathname.includes("/treatments") && trimmedFilters.type !== "Treatments") {
      router.push("/search");
      setIsLoading(false);
      return;
    }

    startTransition(() => {
      if (pathname.includes("/treatments")) {
        router.push("/treatments?" + new URLSearchParams({
          query: trimmedFilters.query || "",
          type: trimmedFilters.type || "",
          category: trimmedFilters.category || "",
          location: trimmedFilters.location || "",
        }).toString());
      } else {
        router.push("/search");
      }
    });
    setIsLoading(false);
  };

  useEffect(() => {
    if (router) {
      router.prefetch("/search");
    }
  }, [router]);

  return {
    pathname,
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
  };
}
