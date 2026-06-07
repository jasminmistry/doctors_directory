import type { OperatorCitySection } from "@/lib/b2b-hub/operator-city-content"
import { toDisplayTitle } from "@/lib/b2b-hub/text"

type Props = {
  cityTitle: string
  sections: OperatorCitySection[]
}

export function HubCityOperatorWriteup({ cityTitle, sections }: Props) {
  if (sections.length === 0) {
    return null
  }

  return (
    <section className="mb-16">
      <h2 className="mb-3 text-center text-[30px] font-bold tracking-[-0.02em] text-[#111111] md:text-[36px]">
        {toDisplayTitle(`Local context for ${cityTitle} operators`)}
      </h2>
      <p className="mx-auto mb-10 max-w-3xl text-center text-base text-[#6B6B6B] md:text-lg">
        Adapted from our directory city research, reframed for clinic leaders, not
        patients. Use it to tune positioning, compliance, and growth plans in this area.
      </p>
      <div className="mx-auto max-w-4xl space-y-8">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-xl border border-[#E5E7EB] bg-white px-6 py-6 shadow-sm"
          >
            <h3 className="mb-2 text-xl font-semibold text-[#111111]">
              {toDisplayTitle(section.title)}
            </h3>
            {section.intro ? (
              <p className="mb-4 text-base leading-relaxed text-[#4B5563]">{section.intro}</p>
            ) : null}
            <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-[#374151]">
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
