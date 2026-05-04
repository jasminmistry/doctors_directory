import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HUB_ENTRIES_BY_SEGMENT,
  HUB_SEGMENTS,
  segmentLabel,
  type HubSegment,
} from "@/lib/b2b-hub/registry";

export const metadata: Metadata = {
  title: "B2B software buyer hub | ConsenTZ",
  description:
    "Evaluate clinic software with structured guides across consent, CQC evidence, automation, and competitor comparisons.",
};

export default function BusinessHubHomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 pb-16">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-3">
          B2B software buyer hub
        </h1>
        <p className="text-lg text-neutral-600 max-w-3xl leading-relaxed">
          Practical pages for operators comparing clinic software, consent
          workflows, compliance evidence, and migration paths from common
          platforms.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {HUB_SEGMENTS.map((seg: HubSegment) => {
          const count = HUB_ENTRIES_BY_SEGMENT[seg]?.length ?? 0;
          return (
            <Link key={seg} href={`/business/${seg}/`} className="block group">
              <Card className="h-full border-neutral-200 shadow-sm transition-all group-hover:border-neutral-400 group-hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl group-hover:underline">
                    {segmentLabel(seg)}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {count} pages — guides and comparisons for{" "}
                    {segmentLabel(seg).toLowerCase()}.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
