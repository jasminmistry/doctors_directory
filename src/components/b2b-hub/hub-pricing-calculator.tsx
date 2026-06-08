"use client"

import { useMemo, useState } from "react"
import { toDisplayTitle } from "@/lib/b2b-hub/text"
import { cn } from "@/lib/utils"

const PRICE_PER_LOGIN = 49
const ANNUAL_DISCOUNT = 0.1

type BillingPeriod = "monthly" | "annual"

export function HubPricingCalculator() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly")
  const [practitioners, setPractitioners] = useState(5)
  const [admins, setAdmins] = useState(2)

  const totals = useMemo(() => {
    const logins = Math.max(0, practitioners) + Math.max(0, admins)
    const monthly = logins * PRICE_PER_LOGIN
    const annualBeforeDiscount = monthly * 12
    const annualSaved = annualBeforeDiscount * ANNUAL_DISCOUNT
    const annualTotal = annualBeforeDiscount - annualSaved
    const effectiveMonthly = annualTotal / 12
    return {
      logins,
      monthly,
      annualBeforeDiscount,
      annualSaved,
      annualTotal,
      effectiveMonthly,
    }
  }, [practitioners, admins])

  const displayMain =
    period === "monthly"
      ? `£${totals.monthly.toLocaleString("en-GB")}/month`
      : `£${totals.annualTotal.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/year`

  return (
    <section className="mb-12 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-6 md:p-8">
      <h2 className="mb-2 text-2xl font-semibold text-[#111111]">
        {toDisplayTitle("Estimate your Consentz cost")}
      </h2>
      <p className="mb-6 text-base text-[#6B6B6B]">
        £{PRICE_PER_LOGIN} per login per month. Annual billing includes a 10% discount.
      </p>

      <div className="mb-6 inline-flex rounded-lg border border-[#D1D5DB] bg-white p-1">
        {(["monthly", "annual"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setPeriod(value)}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium capitalize transition-colors",
              period === value
                ? "bg-[#111111] text-white"
                : "text-[#374151] hover:bg-[#F3F4F6]"
            )}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#111111]">
            {toDisplayTitle("Practitioner logins")}
          </span>
          <input
            type="number"
            min={0}
            max={500}
            value={practitioners}
            onChange={(e) => setPractitioners(Number(e.target.value) || 0)}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-4 py-3 text-[#111111]"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#111111]">
            {toDisplayTitle("Admin logins")}
          </span>
          <input
            type="number"
            min={0}
            max={500}
            value={admins}
            onChange={(e) => setAdmins(Number(e.target.value) || 0)}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-4 py-3 text-[#111111]"
          />
        </label>
      </div>

      <div className="rounded-lg border border-[#E5E7EB] bg-white p-6">
        <p className="text-sm text-[#6B6B6B]">
          {totals.logins} login{totals.logins === 1 ? "" : "s"} × £{PRICE_PER_LOGIN}/month
        </p>
        <p className="mt-2 text-3xl font-bold text-[#111111]">{displayMain}</p>
        {period === "annual" ? (
          <div className="mt-4 space-y-1 text-sm text-[#374151]">
            <p>
              Monthly equivalent: £
              {totals.effectiveMonthly.toLocaleString("en-GB", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              /month
            </p>
            <p>
              Annual before discount: £{totals.annualBeforeDiscount.toLocaleString("en-GB")}
            </p>
            <p className="text-emerald-700">
              10% annual discount saves £
              {totals.annualSaved.toLocaleString("en-GB", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#374151]">
            Annual: £{totals.annualTotal.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            /year (save £
            {totals.annualSaved.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
          </p>
        )}
      </div>
    </section>
  )
}
