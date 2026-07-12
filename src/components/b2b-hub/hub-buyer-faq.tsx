import { MinusCircle, PlusCircle } from "lucide-react"
import {
  HUB_FAQ_ANSWER_CLASS,
  HUB_FAQ_INTRO_CLASS,
  HUB_FAQ_QUESTION_CLASS,
  HUB_FAQ_TITLE_CLASS,
} from "@/components/b2b-hub/hub-marketing-typography"

export type HubFaqItem = {
  question: string
  answer: string
  defaultOpen?: boolean
}

export type LegacyHubFaqItem = {
  q: string
  a: string
  open?: boolean
}

export function mapLegacyHubFaqs(
  items: readonly LegacyHubFaqItem[]
): HubFaqItem[] {
  return items.map((item) => ({
    question: item.q,
    answer: item.a,
    defaultOpen: item.open,
  }))
}

type Props = {
  title?: string
  intro?: string
  items: HubFaqItem[]
  className?: string
  titleClassName?: string
  introClassName?: string
}

export function HubBuyerFaq({
  title = "Frequently Asked Questions",
  intro = "Find quick answers to common questions about using Consentz for your clinic management needs.",
  items,
  className = "",
  titleClassName = HUB_FAQ_TITLE_CLASS,
  introClassName = HUB_FAQ_INTRO_CLASS,
}: Props) {
  return (
    <section className={`mb-16 px-4 sm:px-0 ${className}`.trim()}>
      <h3 className={titleClassName}>{title}</h3>
      {intro ? (
        <p className={introClassName}>{intro}</p>
      ) : null}
      <div className="mx-auto mt-8 max-w-[1056px] overflow-hidden rounded-lg border border-[#e0e0e0] bg-white">
        <div className="w-full">
          {items.map((item, index) => (
            <details
              key={item.question}
              open={item.defaultOpen ?? index === 0}
              className={`group border-[#e0e0e0] bg-white ${index < items.length - 1 ? "border-b" : ""}`}
            >
              <summary className="flex cursor-pointer list-none items-start gap-[9px] px-6 py-5 [&::-webkit-details-marker]:hidden">
                <span className="mt-0.5 shrink-0 text-[#151C26]" aria-hidden>
                  <PlusCircle className="size-[22px] group-open:hidden" strokeWidth={1.75} />
                  <MinusCircle className="hidden size-[22px] group-open:block" strokeWidth={1.75} />
                </span>
                <span className={HUB_FAQ_QUESTION_CLASS}>{item.question}</span>
              </summary>
              <div className="px-6 pb-5 pl-[52px] pr-6">
                <p className={HUB_FAQ_ANSWER_CLASS}>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
