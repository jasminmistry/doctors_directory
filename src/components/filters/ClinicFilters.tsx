import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { modalities, locations } from "@/lib/data";
interface ClinicFilters {
  servicesOffered: string;
  location: string;
  rating: string;
  distance: string;
  query?: string;
}

interface ClinicFiltersProps {
  filters: ClinicFilters;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  setIsFilterActive: (val: boolean) => void;
}

export function ClinicFilters({ filters, onChange, onClear, setIsFilterActive }: Readonly<ClinicFiltersProps>) {
  return (
    <>
      <section className="font-semibold text-xl text-black mb-6">
        Filters
      </section>

      <div className="mb-6">
        <label htmlFor="clinics-search" className="sr-only">
          Search
        </label>
        <input
          id="clinics-search"
          type="text"
          value={filters.query || ""}
          onChange={(e) => onChange("query", e.target.value)}
          placeholder="Search clinics..."
          className="w-full px-3 py-2 text-base border rounded-md bg-white"
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="clinics-services"
          className="block text-base font-medium text-black mb-2"
        >
          Services Offered:
        </label>
        <Select
          value={filters.servicesOffered}
          onValueChange={(v) => onChange("servicesOffered", v)}
          onOpenChange={(open) => {
            if (open) setIsFilterActive(true);
          }}
        >
          <SelectTrigger className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-md">
            <SelectValue placeholder="All" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {modalities.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6">
        <label
          htmlFor="clinics-distance"
          className="block text-base font-medium text-black mb-2"
        >
          Location
        </label>
        <Select
          value={filters.location}
          onValueChange={(v) => onChange("location", v)}
          onOpenChange={(open) => {
            if (open) setIsFilterActive(true);
          }}
        >
          <SelectTrigger className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-md">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {locations.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6">
        <label
          htmlFor="clinics-rating"
          className="block text-base font-medium text-black mb-2"
        >
          Minimum Rating:
        </label>
        <Select
          value={filters.rating}
          onValueChange={(v) => onChange("rating", v)}
          onOpenChange={(open) => {
            if (open) setIsFilterActive(true);
          }}
        >
          <SelectTrigger className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-md">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all" value="all">
              All
            </SelectItem>
            <SelectItem key="4" value="4">
              4+ Stars
            </SelectItem>
            <SelectItem key="4.5" value="4.5">
              4.5+ Stars
            </SelectItem>
            <SelectItem key="5" value="5">
              5 Stars
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={onClear}
        className="w-full border border-black bg-transparent text-black hover:bg-white hover:text-black cursor-pointer"
      >
        Clear All
      </Button>
    </>
  );
}