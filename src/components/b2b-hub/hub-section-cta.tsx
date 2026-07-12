import Link from "next/link"
import type { ReactNode } from "react"
import {
  HUB_CTA_PRIMARY_CLASS,
  HUB_CTA_SECONDARY_CLASS,
} from "@/components/b2b-hub/hub-cta-buttons"
import { HubCtaPhoneFigure } from "@/components/b2b-hub/hub-cta-phone-figure"
import { b2bBookDemoHref } from "@/lib/b2b-hub/seo"
import { cn } from "@/lib/utils"

type Props = {
  heading?: string
  sub?: string
  primaryLabel?: string
  secondaryLabel?: string
  primaryHref?: string
  secondaryHref?: string
  className?: string
  tone?: "default" | "warm"
  withBorder?: boolean
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
  heading = "Ready To Run Your Clinic?",
  sub = "Join aesthetic clinics across the UK using Consentz.",
  primaryLabel = "Book A Demo",
  secondaryLabel = "Get CQC Readiness Audit",
  primaryHref = b2bBookDemoHref(),
  secondaryHref = b2bBookDemoHref(),
  className,
  tone = "default",
  withBorder = true,
}: Props) {
  return (
    <section
      className={cn(
        "relative z-10 w-full overflow-visible",
        tone === "warm" ? "bg-[#fff]" : "bg-white",
        withBorder && "border-t border-b border-[#e0e0e0]",
        className
      )}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-20">
        <div className="relative pt-8 pb-10 max-lg:pb-12 sm:pt-10 lg:grid lg:h-[472px] lg:grid-cols-[minmax(0,1fr)_407px] lg:overflow-hidden lg:pb-0 lg:pt-0 flex items-center">
          <div className="relative z-10 flex flex-col items-center text-center lg:items-center lg:justify-center lg:py-20 lg:pr-6">
            <h2 className="max-w-[720px] text-[26px] font-medium leading-tight tracking-[-0.03em] text-[#111111] sm:text-[30px] lg:text-[36px] lg:leading-normal lg:tracking-[-1.08px]">
              {heading}
            </h2>
            <p className="mt-3 max-w-xl text-base leading-[1.6] text-[#1A1A1A] sm:text-lg lg:mt-[14px] lg:text-[20px]">
              {sub}
            </p>
            <div className="mx-auto mt-8 flex w-full max-w-[320px] flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center [&_a]:flex [&_a]:w-full [&_a]:justify-center sm:[&_a]:w-auto">
              <CtaButton href={primaryHref} className={HUB_CTA_PRIMARY_CLASS}>
                {primaryLabel}
              </CtaButton>
              <CtaButton href={secondaryHref} className={HUB_CTA_SECONDARY_CLASS}>
                {secondaryLabel}
              </CtaButton>
            </div>
          </div>
          <HubCtaPhoneFigure />
        </div>
      </div>
    </section>
  )
}
