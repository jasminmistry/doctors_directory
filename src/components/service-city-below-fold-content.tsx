import { HubBuyerFaq } from '@/components/b2b-hub/hub-buyer-faq'

type BelowFoldSection = {
  title: string
  paragraphs: string[]
}

type BelowFoldFaqItem = {
  question: string
  answer: string
}

type Props = {
  content: {
    sections: BelowFoldSection[]
    faqItems: BelowFoldFaqItem[]
  }
}

const FAQ_TITLE_CLASS =
  'text-left text-xl font-semibold leading-tight text-foreground md:text-2xl'

export function ServiceCityBelowFoldContent({ content }: Props) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-12">
      {content.sections.map((section) => (
        <section key={section.title} className="mb-10">
          <h2 className="text-xl font-semibold text-foreground md:text-2xl">{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className="mt-3 text-sm text-muted-foreground md:text-base"
            >
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      <HubBuyerFaq
        title="Frequently Asked Questions"
        intro=""
        items={content.faqItems}
        className="px-0 pb-0"
        titleClassName={FAQ_TITLE_CLASS}
        introClassName="hidden"
      />
    </div>
  )
}
