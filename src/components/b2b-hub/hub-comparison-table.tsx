import { AlertTriangle, Check, X } from "lucide-react"

type Typical = { type: "not" | "warn" | "basic"; label: string }

type Row = {
  feature: string
  consentz: "native" | string
  typical: Typical
  why: string
}

const defaultRows: Row[] = [
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

const softwareRows: Row[] = [
  {
    feature: "Digital consent forms",
    consentz: "native",
    typical: { type: "not", label: "Not included" },
    why: "CQC requires signed evidence",
  },
  {
    feature: "CQC evidence dashboard",
    consentz: "native",
    typical: { type: "not", label: "Not included" },
    why: "Inspection readiness",
  },
  {
    feature: "Patient reactivation",
    consentz: "native",
    typical: { type: "warn", label: "Check provider" },
    why: "Revenue recovery",
  },
  {
    feature: "Automation workflows",
    consentz: "native",
    typical: { type: "warn", label: "May vary by plan" },
    why: "Reduces manual admin",
  },
  {
    feature: "Treatment records",
    consentz: "native",
    typical: { type: "basic", label: "Basic only" },
    why: "Full compliance trail",
  },
]

function TypicalCell({
  typical,
  large,
}: {
  typical: Typical
  large?: boolean
}) {
  const textCls = large ? "text-sm text-[#6B6B6B]" : "text-neutral-700"
  const iconCls = large ? "h-4 w-4 shrink-0" : "h-4 w-4 shrink-0"
  if (typical.type === "not") {
    return (
      <span className={`inline-flex items-center gap-2 ${textCls}`}>
        <X className={`${iconCls} text-[#CB3333]`} strokeWidth={2.5} aria-hidden />
        <span>{typical.label}</span>
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-2 ${textCls}`}>
      <AlertTriangle className={`${iconCls} text-[#CA7F18]`} strokeWidth={2.5} aria-hidden />
      <span>{typical.label}</span>
    </span>
  )
}

function NativePill({ large }: { large?: boolean }) {
  if (large) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DBFCE7] px-2.5 py-1 text-[#1E904C] font-semibold text-sm">
        <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
        Native
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-2 text-emerald-700 font-medium">
      <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
      Native
    </span>
  )
}

export function HubComparisonTable({
  variant = "default",
}: {
  variant?: "default" | "software"
}) {
  const rows = variant === "software" ? softwareRows : defaultRows
  const large = variant === "software"
  const theadCls =
    variant === "software"
      ? "bg-[#1A1A1A] text-white"
      : "bg-[#111827] text-white"
  const thCls = large ? "px-4 py-3 font-semibold text-sm" : "px-4 py-4 font-semibold"
  const tdBase = large
    ? "px-4 py-3 border-b border-[#E5E7EB] text-sm"
    : "px-4 py-4 border-b border-[#E5E7EB]"
  const featureTd = large
    ? `${tdBase} font-medium text-[#1A1A1A]`
    : `${tdBase} font-semibold text-neutral-900`
  const whyTd = large ? `${tdBase} text-[#1A1A1A] font-normal` : `${tdBase} text-neutral-600`

  const shellCls = large
    ? "w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 mb-12 overflow-x-auto"
    : "mb-12 overflow-x-auto"
  const innerCls = large
    ? "px-4 sm:px-6 lg:px-12 max-w-[1440px] mx-auto"
    : "inline-block min-w-full align-middle p-2"
  const cardCls = large
    ? "overflow-hidden rounded-xl border border-[#E5E7EB] bg-white w-full"
    : "overflow-hidden rounded-xl border border-[#E5E7EB] bg-white max-w-[1120px] mx-auto"

  return (
    <section className={shellCls}>
      <div className={innerCls}>
        <div className={cardCls}>
          <table
            className={`w-full text-left text-sm table-fixed ${large ? "min-w-[720px]" : "min-w-[640px]"}`}
          >
            {large ? (
              <colgroup>
                <col style={{ width: "28%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "30%" }} />
              </colgroup>
            ) : null}
            <thead>
              <tr className={theadCls}>
                <th className={thCls}>Feature</th>
                <th className={thCls}>Consentz</th>
                <th className={thCls}>
                  {variant === "software" ? "Typical Booking Tool" : "Typical booking tool"}
                </th>
                <th className={thCls}>
                  {variant === "software" ? "Why It Matters" : "Why it matters"}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature} className="bg-white">
                  <td className={featureTd}>{row.feature}</td>
                  <td className={tdBase}>
                    {row.consentz === "native" ? (
                      <NativePill large={large} />
                    ) : (
                      row.consentz
                    )}
                  </td>
                  <td className={tdBase}>
                    <TypicalCell typical={row.typical} large={large} />
                  </td>
                  <td className={whyTd}>{row.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
