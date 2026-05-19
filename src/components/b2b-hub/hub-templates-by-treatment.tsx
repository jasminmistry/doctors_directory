import Link from "next/link"
import {
  TEMPLATE_TREATMENT_GROUPS,
  templateTreatmentIndexHref,
} from "@/lib/b2b-hub/template-treatments"

export function HubTemplatesByTreatment() {
  const featured = TEMPLATE_TREATMENT_GROUPS.slice(0, 12)
  if (featured.length === 0) return null

  return (
    <section className="border-t border-[#E5E7EB] bg-[#FAFAFA] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-[960px]">
        <h2 className="mb-2 text-center text-xl font-bold text-[#111111] md:text-2xl">
          Browse Templates By Treatment
        </h2>
        <p className="mx-auto mb-8 max-w-[640px] text-center text-sm text-[#6B6B6B] md:text-base">
          Open a treatment index first, then choose the template to preview and download.
        </p>
        <ul className="flex flex-wrap justify-center gap-2">
          {featured.map((g) => (
            <li key={g.slug}>
              <Link
                href={templateTreatmentIndexHref(g.slug)}
                className="inline-flex rounded-lg border border-[#E2DDD7] bg-white px-4 py-2 text-sm font-semibold text-[#111111] transition-colors hover:border-neutral-400 hover:bg-neutral-50"
              >
                {g.label}
              </Link>
            </li>
          ))}
        </ul>
        {TEMPLATE_TREATMENT_GROUPS.length > featured.length ? (
          <p className="mt-6 text-center text-sm text-[#6B6B6B]">
            More treatments available in the library below.
          </p>
        ) : null}
      </div>
    </section>
  )
}
