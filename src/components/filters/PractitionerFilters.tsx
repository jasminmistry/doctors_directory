import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {edu, spec, locations, accreditations} from "@/lib/data";

interface PractitionerFilters {
  practitioner_specialty: string;
  practitioner_qualifications: string;
  City: string;
  rating: string;
  query?: string;
}

interface PractitionerFiltersProps {
  filters: PractitionerFilters;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  setIsFilterActive: (val: boolean) => void;
}

export function PractitionerFilters({ filters, onChange, onClear, setIsFilterActive }: Readonly<PractitionerFiltersProps>) {
  return (
    <>
      <section className="font-semibold text-xl text-black mb-6">
        Filters
      </section>

      <div className="mb-6">
        <label htmlFor="practitioners-search" className="sr-only">
          Search
        </label>
        <input
          id="practitioners-search"
          type="text"
          value={filters.query || ""}
          onChange={(e) => onChange("query", e.target.value)}
          placeholder="Search practitioners..."
          className="w-full px-3 py-2 text-base border rounded-md bg-white"
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="practitioners-specialty"
          className="block text-base font-medium text-black mb-2"
        >
          Practitioner Specialty:
        </label>
        <Select
          value={filters.practitioner_specialty}
          onValueChange={(v) => onChange("practitioner_specialty", v)}
          onOpenChange={(open) => {
            if (open) setIsFilterActive(true);
          }}
        >
          <SelectTrigger className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-md">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {spec.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6">
        <label
          htmlFor="practitioners-qualifications"
          className="block text-base font-medium text-black mb-2"
        >
          Practitioner Qualifications:
        </label>
        <Select
          value={filters.practitioner_qualifications}
          onValueChange={(v) => onChange("practitioner_qualifications", v)}
          onOpenChange={(open) => {
            if (open) setIsFilterActive(true);
          }}
        >
          <SelectTrigger className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-md">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {edu.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6">
        <label
          htmlFor="practitioners-city"
          className="block text-base font-medium text-black mb-2"
        >
          City:
        </label>
        <Select
          value={filters.City}
          onValueChange={(v) => onChange("City", v)}
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
          htmlFor="practitioners-rating"
          className="block text-base font-medium text-black mb-2"
        >
          Accreditations:
        </label>
        <Select
          value={filters.query}
          onValueChange={(v) => onChange("query", v)}
          onOpenChange={(open) => {
            if (open) setIsFilterActive(true);
          }}
        >
          <SelectTrigger className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-md">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {accreditations.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

    </>
  );
}