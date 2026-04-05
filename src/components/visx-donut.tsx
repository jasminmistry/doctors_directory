"use client";
import type { BoxPlotDatum } from "@/lib/data";
import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
export interface VisxDonutChartProps {
  data: BoxPlotDatum[];
}

export function Stats({ data }: Readonly<VisxDonutChartProps>) {
  const scoreExplanationByLabel: Record<string, string> = {
    "Clinic Visibility":
      "Clinic Visibility: reflects how easy it is for patients to discover and verify this provider through presence, booking signals, and profile evidence.",
    "Pricing Transparency":
      "Pricing Transparency: reflects how clearly fees, treatment options, and consultation details are communicated to help patients make informed choices.",
    "Safety and Trust":
      "Safety and Trust: reflects accreditation, credibility signals, safety-related review evidence, and trust indicators in the profile.",
    "Overall Aggregation":
      "Overall Aggregation: combined summary of visibility, pricing transparency, and safety and trust for quick comparison.",
  };

  const categoryColorByLabel: Record<string, string> = {
    "Clinic Visibility": "#C7EAEF",
    Communication: "#F2B26E",
    "Pricing Transparency": "#C4DFA7",
    "Bedside Manner": "#D3A9CF",
    "Trust & Safety": "#F5D1CC",
    "Safety and Trust": "#E8D6F7",
    Personalization: "#F7E3A1",
    "Post-Care": "#C9F2E7",
    Professionalism: "#F8C8DC",
    "Overall Aggregation": "#D0E4F5",
    "Value & Transparency": "#F6E8C5",
    "Pain Management & Comfort": "#DFE8C9",
    "Anxiety & Nervousness Management": "#F4CBB7",
    "Booking & Accessibility": "#E6CBDC",
    "Honesty & Realistic Expectations": "#C8D7E1",
    "Long-term Relationship & Loyalty": "#FFE6F2",
  };
  

  const categoryColorFor = (label: string) =>
    categoryColorByLabel[label] ?? "#888888";
  const skip = [
    "Clinic Visibility",
    "Pricing Transparency",
    "Safety and Trust",
    "Overall Aggregation",
  ];

  const filtered = useMemo(
    () => data.filter((d) => skip.includes(d.label)),
    [data]
  );

  const rows = filtered.map((d) => {
    const max = d.stats?.max ?? 1;
    const percentage = Math.max(
      0,
      Math.min(100, (30 * d.item.weighted_score) / max + 70)
    );
    const roundedPercentage = Math.round(percentage);
    const scoreExplanation =
      scoreExplanationByLabel[d.label] ??
      `Consentz score component for ${d.label}.`;

    return {
      label: d.label,
      percentage,
      roundedPercentage,
      color: categoryColorFor(d.label),
      scoreExplanation,
    };
  });

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {rows.map((row) => (
          <Tooltip key={row.label}>
            <TooltipTrigger asChild>
              <div className="bg-white p-0 cursor-help">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-800">{row.label}</p>
                  <span className="text-sm font-semibold">{row.roundedPercentage}%</span>
                </div>

                {/* shadcn style progress bar */}
                <div className="w-full h-10 border border-gray-200 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all"
                    style={{ width: `${row.percentage}%`, background: row.color }}
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-[320px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs leading-relaxed text-gray-700 shadow-xl"
            >
              {row.scoreExplanation}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
