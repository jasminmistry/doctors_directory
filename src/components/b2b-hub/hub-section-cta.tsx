import Link from "next/link"
import type { ReactNode } from "react"

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com"

type Props = {
  heading?: string
  sub?: string
  primaryLabel?: string
  secondaryLabel?: string
  primaryHref?: string
  secondaryHref?: string
}

function CtaButton({
  href,
  className,
  children,
}: {
  href: string
  className: string
  children: ReactNode
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}

export function HubSectionCta({
  heading = "Ready To Run Your Clinic Properly?",
  sub = "Join aesthetic clinics across the UK using Consentz.",
  primaryLabel = "Book A Demo",
  secondaryLabel = "Get CQC Readiness Audit",
  primaryHref = `${baseUrl}/book-demo`,
  secondaryHref = `${baseUrl}/book-demo`,
}: Props) {
  return (
    <section className="bg-[var(--primary-bg-color)] px-4 py-14 md:py-20 mt-8">
      <div className="max-w-[1280px] mx-auto text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
            {heading}
          </h2>
          <p className="text-neutral-600 mt-3 leading-relaxed">{sub}</p>
          <div className="flex flex-wrap gap-3 mt-8 justify-center">
            <CtaButton
              href={primaryHref}
              className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-sm font-semibold text-white hover:bg-neutral-900 transition-colors"
            >
              {primaryLabel}
            </CtaButton>
            <CtaButton
              href={secondaryHref}
              className="inline-flex items-center justify-center rounded-full border-2 border-neutral-900 bg-white px-8 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
            >
              {secondaryLabel}
            </CtaButton>
          </div>
        </div>
      </div>
    </section>
  )
}
