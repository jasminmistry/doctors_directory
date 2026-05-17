import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import {
  HUB_CTA_PRIMARY_CLASS,
  HUB_CTA_SECONDARY_CLASS,
} from "@/components/b2b-hub/hub-cta-buttons"

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com"

const CTA_CLINIC_PHONE_SRC = "/directory/images/cta-clinic-phone.png"

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
    <section className="relative w-full overflow-hidden border-t border-[#E5E7EB] bg-[var(--primary-bg-color)]">
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <div className="relative z-10 flex w-full flex-col items-center text-center">
          <h2 className="max-w-2xl text-[26px] font-bold leading-tight tracking-[-0.03em] text-[#111111] sm:text-[30px] lg:text-[36px]">
            {heading}
          </h2>
          <p className="mt-3 max-w-xl text-base leading-[1.6] text-[#1A1A1A] sm:text-lg">{sub}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <CtaButton href={primaryHref} className={HUB_CTA_PRIMARY_CLASS}>
              {primaryLabel}
            </CtaButton>
            <CtaButton href={secondaryHref} className={HUB_CTA_SECONDARY_CLASS}>
              {secondaryLabel}
            </CtaButton>
          </div>
        </div>
        <div
          className="pointer-events-none relative z-0 mx-auto mt-10 h-[200px] w-[174px] overflow-hidden sm:h-[220px] sm:w-[191px] lg:absolute lg:right-8 lg:top-1/2 lg:mt-0 lg:h-[400px] lg:w-[340px] lg:-translate-y-1/2 xl:right-16"
          aria-hidden
        >
          <Image
            src={CTA_CLINIC_PHONE_SRC}
            alt=""
            width={586}
            height={731}
            className="absolute max-w-none select-none"
            sizes="(max-width: 1024px) 191px, 340px"
            style={{
              height: "156.09%",
              width: "144.06%",
              left: "-15.65%",
              top: "-7.82%",
            }}
          />
        </div>
      </div>
    </section>
  )
}
