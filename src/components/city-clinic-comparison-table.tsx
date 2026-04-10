import Link from "next/link"

import type { ClinicComparisonEntry } from "@/lib/best-ranked"

interface CityClinicComparisonTableProps {
  city: string
  entries: ClinicComparisonEntry[]
}

const badgeClassByCategory: Record<ClinicComparisonEntry["category"], string> = {
  "Best value": "bg-emerald-50 text-emerald-800 border-emerald-200",
  Premium: "bg-slate-100 text-slate-900 border-slate-300",
  Budget: "bg-amber-50 text-amber-800 border-amber-200",
}

export function CityClinicComparisonTable({
  city,
  entries,
}: Readonly<CityClinicComparisonTableProps>) {
  if (entries.length < 3) {
    return null
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Compare clinics in {city}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These picks use Consentz score first, then city-relative pricing to surface one
          best-value, premium, and budget option.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
              <th className="border-b border-gray-200 px-3 py-3 font-medium">Category</th>
              <th className="border-b border-gray-200 px-3 py-3 font-medium">Clinic</th>
              <th className="border-b border-gray-200 px-3 py-3 font-medium">Consentz score</th>
              <th className="border-b border-gray-200 px-3 py-3 font-medium">Average fee</th>
              <th className="border-b border-gray-200 px-3 py-3 font-medium">City rank</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.category} className="align-middle">
                <td className="border-b border-gray-100 px-3 py-4">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClassByCategory[entry.category]}`}
                  >
                    {entry.category}
                  </span>
                </td>
                <td className="border-b border-gray-100 px-3 py-4 font-medium text-foreground">
                  <Link
                    href={entry.href}
                    prefetch={false}
                    className="hover:underline underline-offset-2"
                  >
                    {entry.name}
                  </Link>
                </td>
                <td className="border-b border-gray-100 px-3 py-4 font-semibold text-foreground">
                  {entry.scoreLabel}
                </td>
                <td className="border-b border-gray-100 px-3 py-4 text-gray-700">
                  {entry.displayPrice}
                </td>
                <td className="border-b border-gray-100 px-3 py-4 text-gray-700">
                  {entry.cityRank ? `#${entry.cityRank}` : "Unranked"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}