"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  HubIndexHeroSearch,
  HUB_INDEX_HERO_TITLE_CLASS_SECTION,
} from "@/components/b2b-hub/hub-index-hero-search"
import {
  buildTreatmentPageSlug,
  TREATMENT_PAGE_TYPES,
  type TreatmentPageType,
} from "@/lib/b2b-hub/scaled-pages-shared"
import { toDisplayTitle } from "@/lib/b2b-hub/text"

const TYPE_LABEL: Record<TreatmentPageType, string> = {
  "consent-workflows": "Consent Workflows",
  "automation-workflows": "Automation Workflows",
  "clinic-management-software": "Clinic Management Software",
  workflows: "Workflows",
}

function matchesQuery(q: string, label: string) {
  const s = q.trim().toLowerCase()
  if (!s) return true
  return label.toLowerCase().includes(s)
}

export type TreatmentBaseRow = {
  slug: string
  label: string
  count: number
}

type Props = {
  treatments: TreatmentBaseRow[]
}

export function HubTreatmentsIndexClient({ treatments }: Props) {
  const [q, setQ] = useState("")

  const filteredTreatments = useMemo(
    () =>
      treatments.filter((t) =>
        matchesQuery(q, toDisplayTitle(t.label))
      ),
    [treatments, q]
  )

  const gridEntries = useMemo(
    () =>
      filteredTreatments.map((t) => ({
        key: t.slug,
        href: `/business/treatments/${buildTreatmentPageSlug(t.slug, "consent-workflows")}/`,
        title: toDisplayTitle(t.label),
        subtitle:
          "Consent workflows, automation, clinic management software, and workflows.",
      })),
    [filteredTreatments]
  )

  return (
    <>
      <HubIndexHeroSearch
        heroTitle="Treatments"
        heroSubtitle="Controlled treatment-based pages linking consent, automation, practitioner workflows, and software context."
        searchPlaceholder="Search treatments"
        query={q}
        onQueryChange={setQ}
        inputId="hub-treatments-search"
        heroTitleClassName={HUB_INDEX_HERO_TITLE_CLASS_SECTION}
      />
      <section className="bg-white px-4 pt-8 pb-12 md:pb-16">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center mb-14">
            {gridEntries.map((e) => (
              <Link
                key={e.key}
                href={e.href}
                className="w-full max-w-[404px] rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-4 flex flex-col gap-1.5 hover:border-neutral-400 hover:shadow-sm transition-all text-left min-h-[78px]"
              >
                <span className="font-semibold text-neutral-900 leading-snug">
                  {e.title}
                </span>
                <span className="text-sm text-neutral-600 leading-snug line-clamp-3">
                  {e.subtitle}
                </span>
              </Link>
            ))}
          </div>
          {gridEntries.length === 0 ? (
            <p className="text-center text-neutral-500 py-8">
              No treatments match &ldquo;{q}&rdquo;.
            </p>
          ) : null}

          <div className="space-y-6">
            {filteredTreatments.map((t) => (
              <section
                key={t.slug}
                className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-5 md:p-6"
              >
                <h2 className="text-lg font-semibold text-neutral-900 mb-3">
                  {toDisplayTitle(t.label)}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {TREATMENT_PAGE_TYPES.map((type) => {
                    const slug = buildTreatmentPageSlug(t.slug, type)
                    return (
                      <Link
                        key={type}
                        href={`/business/treatments/${slug}/`}
                        className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-neutral-800 hover:border-neutral-400 hover:bg-white transition-all"
                      >
                        {TYPE_LABEL[type]}
                      </Link>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
