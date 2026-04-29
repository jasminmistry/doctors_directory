"use client";

import { useState, useEffect, startTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSearchStore } from "@/app/stores/datastore";
import { trackSearchUsage } from "@/lib/tracking/client";

export function useSearchLogic() {
  const pathname = usePathname();
  const isSearchPage = pathname.includes("/search");
  const { filters, setFilters } = useSearchStore();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'type' | 'category' | 'location' | null>(null);

  const [localFilters, setLocalFilters] = useState(() => {
    if (pathname.includes("/treatments")) {
      return { ...filters, type: "Treatments" };
    }
    return filters;
  });

  useEffect(() => {
    if (pathname.includes("/treatments")) {
      setLocalFilters({ ...filters, type: "Treatments" });
      return;
    }

    setLocalFilters(filters);
  }, [filters, pathname]);

  const options = pathname.includes("/treatments") ? ["Treatments"] : ["Practitioner", "Clinic", "Product", "Treatments"];

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
    setFilters(localFilters);
    setShowResults(false);
    setIsExpanded(false);
    startTransition(() => {
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