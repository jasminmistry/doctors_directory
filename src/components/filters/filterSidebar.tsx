"use client";

import { useEffect, useState } from "react";
import { Sliders, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SearchFilters } from "@/lib/types";
import { TreatmentForm } from "@/components/filters/TreatmentForm";
import { ClinicFilters } from "@/components/filters/ClinicFilters";
import { PractitionerFilters } from "@/components/filters/PractitionerFilters";
import { ProductFilters } from "@/components/filters/ProductFilters";
import { useSearchStore } from "@/app/stores/datastore";
import {usePathname, useRouter } from "next/navigation";
import { trackSearchUsage } from "@/lib/tracking/client";
interface AdvancedFiltersProps {
  pageType?: string
}

const defaultTreatmentFilters = {
  concern: "all",
  treatmentType: "all",
  treatmentArea: "all",
  priceRange: "all",
};

const defaultClinicFilters = {
  servicesOffered: "all",
  location: "all",
  rating: "all",
  distance: "all",
  query: "",
};

const defaultClinicOnClearFilters = {
  ...defaultClinicFilters,
  location: "",
};

const defaultPractitionerFilters = {
  practitioner_specialty: "all",
  practitioner_qualifications: "all",
  City: "all",
  rating: "all",
  query: "",
};

const defaultProductFilters = {
  product_category: "all",
  brand: "all",
  distributor_cleaned: "all",
  category: "all",
  query: "",
};

const createClinicFiltersFromSearchFilters = (filters: SearchFilters) => ({
  ...defaultClinicFilters,
  servicesOffered: filters.services[0] || "all",
  location: filters.location || "all",
  rating: filters.rating > 0 ? String(filters.rating) : "all",
  query: filters.query || "",
});

const createPractitionerFiltersFromSearchFilters = (filters: SearchFilters) => ({
  ...defaultPractitionerFilters,
  practitioner_specialty: filters.services[0] || "all",
  practitioner_qualifications: filters.category || "all",
  City: filters.location || "all",
  rating: filters.rating > 0 ? String(filters.rating) : "all",
  query: filters.query || "",
});

const createProductFiltersFromSearchFilters = (filters: SearchFilters) => ({
  ...defaultProductFilters,
  product_category: filters.services[0] || "all",
  brand: filters.category || "all",
  distributor_cleaned: filters.location || "all",
  query: filters.query || "",
});

const createTreatmentFiltersFromSearchFilters = (filters: SearchFilters) => ({
  ...defaultTreatmentFilters,
  concern: filters.category || "all",
  treatmentType: filters.services[0] || "all",
  treatmentArea: filters.location || "all",
});

type LocalFilterTarget = "services" | "location" | "rating" | "category";

interface LocalFilterRule {
  readonly key: string;
  readonly target: LocalFilterTarget;
  readonly whenSet: (value: string) => SearchFilters[LocalFilterTarget];
  readonly whenAll: SearchFilters[LocalFilterTarget];
}

const clinicLocalFilterRules: readonly LocalFilterRule[] = [
  {
    key: "servicesOffered",
    target: "services",
    whenSet: (value) => [value],
    whenAll: [],
  },
  {
    key: "location",
    target: "location",
    whenSet: (value) => value,
    whenAll: "",
  },
  {
    key: "rating",
    target: "rating",
    whenSet: (value) => Number(value),
    whenAll: 0,
  },
];

const practitionerLocalFilterRules: readonly LocalFilterRule[] = [
  {
    key: "practitioner_specialty",
    target: "services",
    whenSet: (value) => [value],
    whenAll: [],
  },
  {
    key: "City",
    target: "location",
    whenSet: (value) => value,
    whenAll: "",
  },
  {
    key: "rating",
    target: "rating",
    whenSet: (value) => Number(value),
    whenAll: 0,
  },
  {
    key: "practitioner_qualifications",
    target: "category",
    whenSet: (value) => value,
    whenAll: "",
  },
];

const productLocalFilterRules: readonly LocalFilterRule[] = [
  {
    key: "product_category",
    target: "services",
    whenSet: (value) => [value],
    whenAll: [],
  },
  {
    key: "brand",
    target: "category",
    whenSet: (value) => value,
    whenAll: "",
  },
  {
    key: "distributor_cleaned",
    target: "location",
    whenSet: (value) => value,
    whenAll: "",
  },
];

const applyLocalFilterRules = (
  prev: SearchFilters,
  key: string,
  value: string,
  rules: readonly LocalFilterRule[]
): SearchFilters => {
  const nextQuery = key === "query" ? value : prev.query;

  for (const rule of rules) {
    if (rule.key !== key) {
      continue;
    }

    const resolvedValue = value !== "all" ? rule.whenSet(value) : rule.whenAll;

    if (rule.target === "services") {
      return {
        ...prev,
        query: nextQuery,
        services: resolvedValue as SearchFilters["services"],
      };
    }

    if (rule.target === "location") {
      return {
        ...prev,
        query: nextQuery,
        location: resolvedValue as SearchFilters["location"],
      };
    }

    if (rule.target === "rating") {
      return {
        ...prev,
        query: nextQuery,
        rating: resolvedValue as SearchFilters["rating"],
      };
    }

    return {
      ...prev,
      query: nextQuery,
      category: resolvedValue as SearchFilters["category"],
    };
  }

  return {
    ...prev,
    query: nextQuery,
  };
};



export function AdvancedFilterSidebar({ pageType }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { filters, setFilters } = useSearchStore();
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const pathname = usePathname();
  const Router = useRouter();
  const onToggle = () => {
    
  setIsOpen(!isOpen);
  setIsFilterActive(true); // Reset active state when toggling
};
  const createEmptySearchFilters = (): SearchFilters => ({
    type: filters.type,
    query: "",
    category: "",
    location: "",
    rating: 0,
    services: [],
  });

  const [treatmentFilters, setTreatmentFilters] = useState(
    createTreatmentFiltersFromSearchFilters(filters)
  );

  const [clinicFilters, setClinicFilters] = useState(
    createClinicFiltersFromSearchFilters(filters)
  );

  const [practitionerFilters, setPractitionerFilters] = useState(
    createPractitionerFiltersFromSearchFilters(filters)
  );

  const [productFilters, setProductFilters] = useState(
    createProductFiltersFromSearchFilters(filters)
  );

  const createFilterChangeHandler = <T extends Record<string, string>>(
    setFilterState: React.Dispatch<React.SetStateAction<T>>,
    rules: readonly LocalFilterRule[]
  ) => {
    return (key: string, value: string) => {
      setFilterState((prev) => ({ ...prev, [key]: value }));
      setLocalFilters((prev) => applyLocalFilterRules(prev, key, value, rules));
    };
  };

  useEffect(() => {
    setLocalFilters(filters);

    if (filters.type === "Treatments") {
      setTreatmentFilters(createTreatmentFiltersFromSearchFilters(filters));
      return;
    }

    if (filters.type === "Clinic") {
      setClinicFilters(createClinicFiltersFromSearchFilters(filters));
      return;
    }

    if (filters.type === "Practitioner") {
      setPractitionerFilters(createPractitionerFiltersFromSearchFilters(filters));
      return;
    }

    if (filters.type === "Product") {
      setProductFilters(createProductFiltersFromSearchFilters(filters));
    }
  }, [filters]);

  const handleApplyFilters = () => {
    let updatedFilters: SearchFilters = createEmptySearchFilters();
    
    if (filters.type === "Treatments") {
      updatedFilters.category = treatmentFilters.concern !== "all" ? treatmentFilters.concern : "";
      updatedFilters.services =
        treatmentFilters.treatmentType !== "all" ? [treatmentFilters.treatmentType] : [];
      updatedFilters.location =
        treatmentFilters.treatmentArea !== "all" ? treatmentFilters.treatmentArea : "";
    } else if (filters.type === "Clinic") {
      updatedFilters.query = clinicFilters.query || "";
      updatedFilters.services = clinicFilters.servicesOffered !== "all" ? [clinicFilters.servicesOffered] : [];
      updatedFilters.location = clinicFilters.location !== "all" ? clinicFilters.location : "";
      updatedFilters.rating = clinicFilters.rating !== "all" ? Number(clinicFilters.rating) : 0;
    } else if (filters.type === "Practitioner") {
      updatedFilters.query = practitionerFilters.query || "";
      updatedFilters.services = practitionerFilters.practitioner_specialty !== "all" ? [practitionerFilters.practitioner_specialty] : [];
      updatedFilters.location = practitionerFilters.City !== "all" ? practitionerFilters.City : "";
      updatedFilters.rating = practitionerFilters.rating !== "all" ? Number(practitionerFilters.rating) : 0;
      updatedFilters.category = practitionerFilters.practitioner_qualifications !== "all" ? practitionerFilters.practitioner_qualifications : "";
    } else if (filters.type === "Product") {
      updatedFilters.query = productFilters.query || "";
      updatedFilters.services = productFilters.product_category !== "all" ? [productFilters.product_category] : [];
      updatedFilters.category = productFilters.brand !== "all" ? productFilters.brand : "";
      updatedFilters.location = productFilters.distributor_cleaned !== "all" ? productFilters.distributor_cleaned : "";
    }
    
    setFilters(updatedFilters);
    void trackSearchUsage({
      query: updatedFilters.query,
      type: updatedFilters.type,
      category: updatedFilters.category,
      location: updatedFilters.location,
    });

    if (pathname !== "/search") {
      Router.push("/search");
    }
   
    onToggle();
  };

  const handleClearFilters = () => {
    const clearedFilters: SearchFilters = createEmptySearchFilters();
    setLocalFilters(clearedFilters);
    setFilters(clearedFilters);
    
    setTreatmentFilters(defaultTreatmentFilters);
    setClinicFilters(defaultClinicFilters);
    setPractitionerFilters(defaultPractitionerFilters);
    setProductFilters(defaultProductFilters);
    
    onToggle();
  };

  const handleTreatmentFilterChange = (key: string, value: string) => {
    setTreatmentFilters(prev => ({ ...prev, [key]: value }));
    setLocalFilters(prev => ({
      ...prev,
      category: key === "concern" ? value : prev.category,
    }));
  };

  const handleClinicFilterChange = createFilterChangeHandler(
    setClinicFilters,
    clinicLocalFilterRules
  );

  const handlePractitionerFilterChange = createFilterChangeHandler(
    setPractitionerFilters,
    practitionerLocalFilterRules
  );

  const handleProductFilterChange = createFilterChangeHandler(
    setProductFilters,
    productLocalFilterRules
  );

  
  return (
    <>
      <aside aria-label="Filter sidebar">
        <div className="block md:hidden">
          <Button
            onClick={onToggle}
            variant={"ghost"}
            size="sm"
            className="w-full mt-4 bg-transparent rounded-full border-black border text-black hover:bg-transparent"
          >
            Filters
            <Sliders className="h-4 w-4 ml-2" />
          </Button>
        </div>
        <Card
          className={`
          bg-transparent h-dvh md:h-auto shadow-none border border-transparent rounded-0 px-4 md:px-0 md:py-0
          md:flex md:flex-col relative md:relative md:block w-full md:bg-transparent md:translate-x-0
          fixed top-0 left-0 bg-white z-[99999] transition-transform duration-300 ease-in-out
          ${isFilterActive ? "translate-x-0" : "-translate-x-full"} ${isOpen ? "block" : "hidden"}
        `}
        >
          <CardHeader className="p-0 flex justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="inline-flex md:hidden p-2"
              onClick={() => onToggle()}
            >
              <X className="w-4 h-4 text-medium" />
            </Button>
          </CardHeader>

          <CardContent className="p-0 w-full flex-1 min-h-0 flex flex-col">
            <div className="space-y-4 flex-1 overflow-y-auto md:overflow-visible min-h-0 pr-1 pb-4">
              {filters.type === "Treatments" && (
                <TreatmentForm
                  filters={treatmentFilters}
                  onChange={handleTreatmentFilterChange}
                  onClear={() => {
                    setTreatmentFilters(defaultTreatmentFilters);
                    setFilters(createEmptySearchFilters());
                  }}
                />
              )}

              {filters.type === "Clinic" && (
                <ClinicFilters
                  filters={clinicFilters}
                  onChange={handleClinicFilterChange}
                  onClear={() => {
                    setClinicFilters(defaultClinicOnClearFilters);
                    setFilters(createEmptySearchFilters());
                  }}
                  setIsFilterActive={setIsFilterActive}
                />
              )}

              {filters.type === "Practitioner" && (
                <PractitionerFilters
                  filters={practitionerFilters}
                  onChange={handlePractitionerFilterChange}
                  onClear={() => {
                    setPractitionerFilters(defaultPractitionerFilters);
                    setFilters(createEmptySearchFilters());
                  }}
                  setIsFilterActive={setIsFilterActive}
                />
              )}

              {filters.type === "Product" && (
                <ProductFilters
                  filters={productFilters}
                  onChange={handleProductFilterChange}
                  onClear={() => {
                    setProductFilters(defaultProductFilters);
                    setFilters(createEmptySearchFilters());
                  }}
                  setIsFilterActive={setIsFilterActive}
                />
              )}
            </div>

            <div className="shrink-0 space-y-2 pt-2 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full border border-black bg-transparent text-black hover:bg-white hover:text-black"
              >
                Clear All
              </Button>
              <Button
                variant="default"
                onClick={handleApplyFilters}
                className="w-full bg-black border border-black hover:bg-black text-white hover:cursor-pointer hover:bg-white hover:text-black"
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </aside>
    </>
  );
}
