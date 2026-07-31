import { create } from "zustand";
import { SearchFilters } from "@/lib/types";

// -----------------------------
// Types
// -----------------------------
interface SearchState {
  filters: SearchFilters
  setFilters: (
    filters: SearchFilters | ((prev: SearchFilters) => SearchFilters)
  ) => void
}

export const useSearchStore = create<SearchState>((set) => ({
  filters: {
    type: "Clinic",
    query: "",
    category: "",
    location: "",
    rating: 0,
    services: [],
    accreditation: "",
  },

  setFilters: (update) =>
    set((state) => ({
      filters: typeof update === "function" ? update(state.filters) : update,
    })),
}))