import Link from "next/link"

import type { CityTreatmentPriceInsight } from "@/lib/city-pricing"
import { capitalize } from "@/lib/utils"

interface CityPricingContextProps {
  city: string
  insights: CityTreatmentPriceInsight[]
  variant?: "full" | "light"
}

export function CityPricingContext({
  city,
  insights,
  variant = "full",
}: Readonly<CityPricingContextProps>) {
  const cityName = capitalize(city)

  if (insights.length === 0) {
    return null
  }

  if (variant === "light") {
    return (
      <section className="rounded-lg border border-gray-200 bg-blue-50 p-4">
        <p className="text-sm leading-relaxed text-gray-800">
          <span className="font-semibold">Treatment costs in {cityName}:</span> {insights[0]?.sentence}
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Cosmetic treatment costs in {cityName}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Estimated treatment price ranges based on published clinic fees.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {insights.map((insight) => (
          <article
            key={insight.treatment}
            className="rounded-lg border border-gray-100 bg-gray-50 p-4"
          >
            <Link
              href={insight.href}
              prefetch={false}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {insight.treatment}
            </Link>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              {insight.sentence}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}