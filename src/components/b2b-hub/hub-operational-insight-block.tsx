import type { OperationalInsight } from "@/lib/b2b-hub/operational-insight"
import { toDisplayTitle } from "@/lib/b2b-hub/text"

type Props = {
  insight: OperationalInsight
}

export function HubOperationalInsightBlock({ insight }: Props) {
  return (
    <section className="mb-16 px-6 py-8 md:px-10">
      <h2 className="mb-4 text-center text-[26px] font-medium tracking-[-0.02em] text-[#111111] md:text-[32px]">
        {toDisplayTitle(insight.title)}
      </h2>
      <ul className="mx-auto max-w-3xl space-y-3">
        {insight.points.map((point) => (
          <li
            key={point}
            className="flex gap-3 text-base leading-relaxed text-[#1A1A1A] md:text-md"
          >
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#111111]" aria-hidden />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
