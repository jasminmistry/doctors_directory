import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { product_categories, distributors, brands } from "@/lib/data";
interface ProductFilters {
  product_category: string;
  brand: string;
  distributor_cleaned: string;
  category: string;
  query?: string;
}

interface ProductFiltersProps {
  filters: ProductFilters;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  setIsFilterActive: (value: boolean) => void;
}

export function ProductFilters({ filters, onChange, onClear, setIsFilterActive }: Readonly<ProductFiltersProps>) {
  return (
    <>
      <section className="font-semibold text-xl text-black mb-6">
        Filters
      </section>

      <div className="mb-6">
        <label htmlFor="products-search" className="sr-only">
          Search
        </label>
        <input
          id="products-search"
          type="text"
          value={filters.query || ""}
          onChange={(e) => onChange("query", e.target.value)}
          placeholder="Search products..."
          className="w-full px-3 py-2 text-base border rounded-md bg-white"
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="products-category"
          className="block text-base font-medium text-black mb-2"
        >
          Product Category:
        </label>
        <Select
          value={filters.product_category}
          onValueChange={(v) => onChange("product_category", v)}
          onOpenChange={(open) => {
            if (open) setIsFilterActive(true);
          }}
        >
          <SelectTrigger className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-md">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {product_categories.map((item) => (
              <SelectItem value={item}>{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6">
        <label
          htmlFor="products-brand"
          className="block text-base font-medium text-black mb-2"
        >
          Brand:
        </label>
        <Select
          value={filters.brand}
          onValueChange={(v) => onChange("brand", v)}
          onOpenChange={(open) => {
            if (open) setIsFilterActive(true);
          }}
        >
          <SelectTrigger className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-md">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {brands.map((item) => (
              <SelectItem value={item}>{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6">
        <label
          htmlFor="products-distributor"
          className="block text-base font-medium text-black mb-2"
        >
          Distributor:
        </label>
        <Select
          value={filters.distributor_cleaned}
          onValueChange={(v) => onChange("distributor_cleaned", v)}
          onOpenChange={(open) => {
            if (open) setIsFilterActive(true);
          }}
        >
          <SelectTrigger className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-md">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {distributors.map((item) => (
              <SelectItem value={item}>{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

    </>
  );
}