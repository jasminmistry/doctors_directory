import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface TreatmentFilters {
  concern: string;
  treatmentType: string;
  treatmentArea: string;
}

interface FilterFormProps {
  filters: TreatmentFilters;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

export function TreatmentForm({ filters, onChange, onClear }: FilterFormProps) {
  return (
    <>
      <section className="font-semibold text-xl text-black mb-6">
        Filters
      </section>

      <div className="mb-6">
        <label className="block text-base font-medium text-black mb-2">
          Concern:
        </label>
        <Select
          value={filters.concern || "all"}
          onValueChange={(v) => onChange("concern", v)}
        >
          <SelectTrigger className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-md">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="acne">Acne</SelectItem>
            <SelectItem value="anti-aging">Anti-Aging</SelectItem>
            <SelectItem value="pigmentation">Pigmentation</SelectItem>
            <SelectItem value="hair-loss">Hair Loss</SelectItem>
            <SelectItem value="body-contouring">Body Contouring</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6">
        <label className="block text-base font-medium text-black mb-2">
          Treatment Type:
        </label>
        <Select
          value={filters.treatmentType || "all"}
          onValueChange={(v) => onChange("treatmentType", v)}
        >
          <SelectTrigger className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-md">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="surgical">Surgical</SelectItem>
            <SelectItem value="non-surgical">Non-Surgical</SelectItem>
            <SelectItem value="laser">Laser</SelectItem>
            <SelectItem value="injectable">Injectable</SelectItem>
            <SelectItem value="skincare">Skincare</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6">
        <label className="block text-base font-medium text-black mb-2">
          Treatment Area:
        </label>
        <Select
          value={filters.treatmentArea || "all"}
          onValueChange={(v) => onChange("treatmentArea", v)}
        >
          <SelectTrigger className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-md">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="face">Face</SelectItem>
            <SelectItem value="body">Body</SelectItem>
            <SelectItem value="hair">Hair</SelectItem>
            <SelectItem value="skin">Skin</SelectItem>
            <SelectItem value="lips">Lips</SelectItem>
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