import { readJsonFileSync } from "@/lib/json-cache"
import type { City } from "@/lib/types"

function normCity(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ")
}

export function getCityDataByName(cityName: string): City | undefined {
  const key = normCity(cityName)
  const rows = readJsonFileSync<City[]>("city_data_processed.json")
  return rows.find((row) => normCity(row.City || "") === key)
}
