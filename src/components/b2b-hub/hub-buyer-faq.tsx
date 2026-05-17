import { MinusCircle, PlusCircle } from "lucide-react"

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
}

export function HubBuyerFaq({
  title = "Frequently Asked Questions",
  intro = "Find quick answers to common questions about using Consentz for your clinic management needs.",
  items,
  className = "",
}: Props) {
  return (
    <section className={`mb-16 px-4 sm:px-0 ${className}`.trim()}>
      <h2 className="text-center text-[28px] font-semibold leading-tight text-black sm:text-[38px] lg:text-[48px]">
        {title}
      </h2>
      {intro ? (
        <p className="mx-auto mt-3 max-w-3xl text-center text-base font-normal leading-7 text-[#374151] sm:text-lg">
          {intro}
        </p>
      ) : null}
      <div className="mx-auto mt-8 max-w-[1056px] overflow-hidden rounded-xl border border-[#E2DDD7] bg-white">
        {items.map((item, index) => (
          <details
            key={item.question}
            open={item.defaultOpen ?? index === 0}
            className={`group border-[#E2DDD7] bg-white ${index < items.length - 1 ? "border-b" : ""}`}
          >
            <summary className="flex cursor-pointer list-none items-start gap-[9px] px-6 py-5 [&::-webkit-details-marker]:hidden">
              <span className="mt-0.5 shrink-0 text-[#151C26]" aria-hidden>
                <PlusCircle className="size-[22px] group-open:hidden" strokeWidth={1.75} />
                <MinusCircle className="hidden size-[22px] group-open:block" strokeWidth={1.75} />
              </span>
              <span className="flex-1 text-left text-xl font-medium leading-7 text-[#151C26] sm:text-[22px]">
                {item.question}
              </span>
            </summary>
            <div className="px-6 pb-5 pl-[52px] pr-6">
              <p className="text-sm font-normal leading-relaxed text-[#5D636B]">{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
