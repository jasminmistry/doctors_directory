import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HubEntry, HubSegment } from "@/lib/b2b-hub/registry";
import { segmentLabel } from "@/lib/b2b-hub/registry";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://staging.consentz.com";

type HubDetailTemplateProps = {
  entry: HubEntry;
  related: HubEntry[];
};

export function HubDetailTemplate({ entry, related }: HubDetailTemplateProps) {
  const seg = entry.segment as HubSegment;
  const intro =
    entry.summary ||
    `${entry.title}: guidance for clinic operators evaluating software and workflows.`;
  const showCompareRow = seg === "software";

  return (
    <article className="max-w-5xl mx-auto px-4 pb-16">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/business/">Buyer hub</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/business/${seg}/`}>
              {segmentLabel(seg)}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="line-clamp-1">{entry.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-2">
          {segmentLabel(seg)}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-4">
          {entry.title}
        </h1>
        <p className="text-lg text-neutral-600 leading-relaxed max-w-3xl">
          {intro}
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-6 mb-12">
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Operational reality</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Teams outgrow generic tools when consent, payments, and clinical
              evidence sit in different places. The result is slower bookings,
              weaker compliance confidence, and fragile patient communication.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">What changes with Consentz</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Consentz is built as an operating layer for clinics: structured
              consent, workflow automation, and reporting that maps to how
              regulated teams actually work day to day.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {showCompareRow ? (
        <section className="mb-12 overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-sm text-left min-w-[520px]">
            <thead className="bg-neutral-100 text-neutral-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Capability</th>
                <th className="px-4 py-3 font-semibold">Typical stack</th>
                <th className="px-4 py-3 font-semibold">Consentz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              <tr>
                <td className="px-4 py-3 font-medium text-neutral-900">
                  Consent &amp; clinical records
                </td>
                <td className="px-4 py-3 text-neutral-600">Paper / PDF chaos</td>
                <td className="px-4 py-3 text-neutral-900">Structured, versioned</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-neutral-900">
                  Booking &amp; payments
                </td>
                <td className="px-4 py-3 text-neutral-600">Disconnected tools</td>
                <td className="px-4 py-3 text-neutral-900">Linked to treatment context</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-neutral-900">
                  Compliance evidence
                </td>
                <td className="px-4 py-3 text-neutral-600">Retroactive folder hunts</td>
                <td className="px-4 py-3 text-neutral-900">Continuous capture</td>
              </tr>
            </tbody>
          </table>
        </section>
      ) : null}

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">
          Explore next
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {related.map((r) => (
            <Link
              key={`${r.segment}-${r.slug}`}
              href={`/business/${r.segment}/${r.slug}/`}
              className="group rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400 hover:shadow-sm transition-all"
            >
              <p className="text-xs font-semibold uppercase text-neutral-500 mb-1">
                {segmentLabel(r.segment)}
              </p>
              <p className="font-medium text-neutral-900 group-hover:underline">
                {r.title}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12 max-w-3xl">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">FAQ</h2>
        <div className="space-y-2">
          <details className="group rounded-lg border border-neutral-200 bg-white px-4 py-3 open:shadow-sm">
            <summary className="cursor-pointer font-medium text-neutral-900 list-none flex justify-between gap-2">
              Is Consentz only for aesthetic clinics?
              <span className="text-neutral-400 group-open:rotate-180 transition-transform">
                ▾
              </span>
            </summary>
            <p className="mt-3 text-neutral-600 leading-relaxed text-sm">
              Consentz supports clinics that need governed consent, structured
              workflows, and operational reporting—common across aesthetic,
              dermatology, and wellness operators.
            </p>
          </details>
          <details className="group rounded-lg border border-neutral-200 bg-white px-4 py-3 open:shadow-sm">
            <summary className="cursor-pointer font-medium text-neutral-900 list-none flex justify-between gap-2">
              How does migration work from another system?
              <span className="text-neutral-400 group-open:rotate-180 transition-transform">
                ▾
              </span>
            </summary>
            <p className="mt-3 text-neutral-600 leading-relaxed text-sm">
              Start with the workflows that cause the most leakage—consent,
              booking, and payments—then expand automation once data is
              structured.
            </p>
          </details>
          <details className="group rounded-lg border border-neutral-200 bg-white px-4 py-3 open:shadow-sm">
            <summary className="cursor-pointer font-medium text-neutral-900 list-none flex justify-between gap-2">
              Can we evaluate pricing without a long procurement cycle?
              <span className="text-neutral-400 group-open:rotate-180 transition-transform">
                ▾
              </span>
            </summary>
            <p className="mt-3 text-neutral-600 leading-relaxed text-sm">
              Use the pricing comparison pages for common alternatives, then
              book a demo to map packages to your locations and services.
            </p>
          </details>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button asChild className="font-semibold">
          <a href={`${baseUrl}/book-demo`}>Book demo</a>
        </Button>
        <Button asChild variant="outline" className="font-semibold">
          <Link href="/business/">Back to hub</Link>
        </Button>
      </div>
    </article>
  );
}
