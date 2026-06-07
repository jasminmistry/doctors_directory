import { HubBuyerFaq } from '@/components/b2b-hub/hub-buyer-faq'
import { HUB_FAQ_SECTION_TITLE_CLASS } from '@/components/b2b-hub/hub-marketing-typography'

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

export function ServiceCityBelowFoldContent({ content }: Props) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-12">
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
        titleClassName={HUB_FAQ_SECTION_TITLE_CLASS}
        introClassName="hidden"
      />
    </div>
  )
}
