import Link from "next/link"
import type { ReactNode } from "react"
import {
  HUB_CTA_PRIMARY_CLASS,
  HUB_CTA_SECONDARY_CLASS,
} from "@/components/b2b-hub/hub-cta-buttons"
import { HubCtaPhoneFigure } from "@/components/b2b-hub/hub-cta-phone-figure"
import { cn } from "@/lib/utils"

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com"

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
  heading = "Ready To Run Your Clinic Properly?",
  sub = "Join aesthetic clinics across the UK using Consentz.",
  primaryLabel = "Book A Demo",
  secondaryLabel = "Get CQC Readiness Audit",
  primaryHref = `${baseUrl}/book-demo`,
  secondaryHref = `${baseUrl}/book-demo`,
  className,
  tone = "default",
  withBorder = true,
}: Props) {
  return (
    <section
      className={cn(
        "relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-hidden",
        tone === "warm" ? "bg-[#F2EEE6]" : "bg-[var(--primary-bg-color)]",
        withBorder && "border-t border-[#E5E7EB]",
        className
      )}
    >
      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-20">
        <div className="relative pb-12 pt-8 sm:pb-14 sm:pt-10 lg:grid lg:h-[472px] lg:grid-cols-[minmax(0,1fr)_407px] lg:items-start lg:overflow-hidden lg:pb-0 lg:pt-0">
          <div className="relative z-10 flex flex-col items-center text-center lg:items-center lg:justify-center lg:py-[118px] lg:pr-6">
            <h2 className="max-w-[720px] text-[26px] font-bold leading-tight tracking-[-0.03em] text-[#111111] sm:text-[30px] lg:text-[36px] lg:leading-normal lg:tracking-[-1.08px]">
              {heading}
            </h2>
            <p className="mt-3 max-w-xl text-base leading-[1.6] text-[#1A1A1A] sm:text-lg lg:mt-[14px] lg:text-[20px]">
              {sub}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
