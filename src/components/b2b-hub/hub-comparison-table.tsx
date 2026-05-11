import { AlertTriangle, Check, X } from "lucide-react"

type Row = {
  feature: string
  consentz: "native" | string
  typical: { type: "not" | "warn" | "basic"; label: string }
  why: string
}

const rows: Row[] = [
  {
    feature: "Consent & clinical records",
    consentz: "native",
    typical: { type: "not", label: "Not included" },
    why: "Reduces consent gaps and version drift before treatment.",
  },
  {
    feature: "Booking & payments",
    consentz: "native",
    typical: { type: "warn", label: "Check provider" },
    why: "Keeps revenue and clinical context in one governed flow.",
  },
  {
    feature: "Compliance evidence",
    consentz: "native",
    typical: { type: "basic", label: "Basic only" },
    why: "Supports inspection-ready evidence without folder archaeology.",
  },
]

function TypicalCell({ typical }: { typical: Row["typical"] }) {
  if (typical.type === "not") {
    return (
      <span className="inline-flex items-center gap-2 text-neutral-700">
        <X className="h-4 w-4 shrink-0 text-red-600" strokeWidth={2.5} aria-hidden />
        <span>{typical.label}</span>
      </span>
    )
  }
  if (typical.type === "warn") {
    return (
      <span className="inline-flex items-center gap-2 text-neutral-700">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" strokeWidth={2.5} aria-hidden />
        <span>{typical.label}</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-2 text-neutral-700">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" strokeWidth={2.5} aria-hidden />
      <span>{typical.label}</span>
    </span>
  )
}

export function HubComparisonTable() {
  return (
    <section className="mb-12 overflow-x-auto">
      <div className="inline-block min-w-full align-middle p-2">
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white max-w-[1120px] mx-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="bg-[#111827] text-white">
                <th className="px-4 py-4 font-semibold">Feature</th>
                <th className="px-4 py-4 font-semibold">Consentz</th>
                <th className="px-4 py-4 font-semibold">Typical booking tool</th>
                <th className="px-4 py-4 font-semibold">Why it matters</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.feature}
                  className={i % 2 === 0 ? "bg-white" : "bg-neutral-50"}
                >
                  <td className="px-4 py-4 font-semibold text-neutral-900 border-b border-[#E5E7EB]">
                    {row.feature}
                  </td>
                  <td className="px-4 py-4 border-b border-[#E5E7EB]">
                    {row.consentz === "native" ? (
                      <span className="inline-flex items-center gap-2 text-emerald-700 font-medium">
                        <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                        Native
                      </span>
                    ) : (
                      row.consentz
                    )}
                  </td>
                  <td className="px-4 py-4 border-b border-[#E5E7EB]">
                    <TypicalCell typical={row.typical} />
                  </td>
                  <td className="px-4 py-4 text-neutral-600 border-b border-[#E5E7EB]">
                    {row.why}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
