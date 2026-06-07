import type { HubFaqItem } from '@/components/b2b-hub/hub-buyer-faq'
import { regulatorLabel, type UkRegulator } from '@/lib/b2b-hub/city-regulator'

export const buildCityHubFaqs = (
  cityTitle: string,
  regulator: UkRegulator
): HubFaqItem[] => {
  const regulatorName = regulatorLabel(regulator)
  const complianceShort =
    regulator === 'HIS'
      ? 'HIS'
      : regulator === 'HIW'
        ? 'HIW'
        : regulator === 'RQIA'
          ? 'RQIA'
          : 'CQC'

  return [
    {
      question: 'What is aesthetic clinic management software?',
      answer: `Aesthetic clinic management software handles the core operations of a cosmetic or aesthetic clinic in ${cityTitle}, including digital consent forms, patient records, appointment scheduling, ${complianceShort} compliance evidence, automated messaging and clinic payments. Unlike generic booking tools, purpose-built aesthetic software is designed for the specific compliance requirements of UK aesthetic medicine.`,
      defaultOpen: true,
    },
    {
      question: 'Does Consentz include digital consent forms?',
      answer:
        'Yes. Consentz supports structured digital consent tied to treatments and visits so evidence stays consistent and retrievable.',
    },
    {
      question: `Can Consentz help with ${complianceShort} compliance?`,
      answer: `Consentz is designed to help ${cityTitle} clinics collect and organise evidence that maps to common ${regulatorName} inspection expectations, alongside operational workflows.`,
    },
    {
      question: 'Can I migrate from Pabau or Fresha?',
      answer:
        'Many clinics phase migration by workflow. Start with consent, booking, and payments, then expand automation as data is structured.',
    },
    {
      question: `What does a ${complianceShort} readiness audit cover?`,
      answer: `A ${complianceShort} readiness audit reviews how your ${cityTitle} clinic stores consent, aftercare, and inspection evidence against ${regulatorName} expectations before you go live on Consentz.`,
    },
  ]
}

export const buildCityHubFaqJsonLdAnswers = (
  cityTitle: string,
  regulator: UkRegulator
): Record<string, string> => {
  const items = buildCityHubFaqs(cityTitle, regulator)
  return Object.fromEntries(items.map((item) => [item.question, item.answer]))
}
