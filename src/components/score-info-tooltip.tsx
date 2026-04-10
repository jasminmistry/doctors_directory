"use client"

import { useEffect, useRef, useState } from "react"
import { CircleHelp } from "lucide-react"

interface ScoreInfoTooltipProps {
  entityLabel: "clinic" | "practitioner"
}

const scoreTooltipByEntity: Record<ScoreInfoTooltipProps["entityLabel"], string> = {
  clinic:
    "Consentz Score: based on pricing transparency, patient reviews, clinic credibility, profile completeness, and safety signals.",
  practitioner:
    "Consentz Score: based on pricing transparency, patient reviews, practitioner credibility, profile completeness, and safety signals.",
}

const pillarLabels = [
  "Clinic Visibility",
  "Pricing Transparency",
  "Safety and Trust",
] as const

export function ScoreInfoTooltip({
  entityLabel,
}: Readonly<ScoreInfoTooltipProps>) {
  const tooltipText = scoreTooltipByEntity[entityLabel]
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const lastPointerType = useRef<string>("")

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutside)
    document.addEventListener("touchstart", handleOutside)
    return () => {
      document.removeEventListener("mousedown", handleOutside)
      document.removeEventListener("touchstart", handleOutside)
    }
  }, [open])

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      <button
        aria-label={`How the Consentz ${entityLabel} score is calculated`}
        className="inline-flex cursor-help items-center justify-center rounded-full border border-gray-300 bg-white p-1.5 text-gray-700 transition-colors hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50"
        type="button"
        onPointerEnter={(e) => { lastPointerType.current = e.pointerType; if (e.pointerType === "mouse") setOpen(true) }}
        onPointerLeave={(e) => { if (e.pointerType === "mouse") setOpen(false) }}
        onClick={() => { if (lastPointerType.current !== "mouse") setOpen((prev) => !prev) }}
      >
        <CircleHelp className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 z-50 mb-2 w-[320px] rounded-xl border border-gray-200 bg-white p-0 text-gray-900 shadow-xl">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold">How the Consentz Score is calculated</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-600">{tooltipText}</p>
          </div>
          <div className="px-4 py-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Core pillars
            </p>
            <div className="flex flex-wrap gap-2">
              {pillarLabels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-700"
                >
                  {label}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
              This is a criteria-based quality signal, not paid placement.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
