"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSearchStore } from "@/app/stores/datastore";
import { trackSearchUsage } from "@/lib/tracking/client";
import {
  resolveUkTreatmentSearchHref,
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
    void trackSearchUsage({
      query: localFilters.query,
      type: localFilters.type,
      category: localFilters.category,
      location: localFilters.location,
    });
    setShowResults(false);
    setIsExpanded(false);

    if (localFilters.type === "Treatments") {
      const treatmentHref = resolveUkTreatmentSearchHref(
        localFilters.query || "",
        localFilters.location || "",
        treatmentSearchOptions
      );
      if (treatmentHref) {
        router.push(treatmentHref);
        setIsLoading(false);
        return;
      }
    }

    setFilters(localFilters);

    if (pathname.includes("/treatments") && localFilters.type !== "Treatments") {
      router.push("/search");
      setIsLoading(false);
      return;
    }

    if (pathname.includes("/treatments")) {
      router.push("/treatments?" + new URLSearchParams({
        query: localFilters.query || "",
        type: localFilters.type || "",
        category: localFilters.category || "",
        location: localFilters.location || "",
      }).toString());
    } else {
      router.push("/search");
    }
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