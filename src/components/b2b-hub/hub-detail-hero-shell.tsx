import type { ReactNode } from "react"
import { HubLogoStrip } from "@/components/b2b-hub/hub-logo-strip"
import { HUB_DETAIL_HERO_VIEWPORT_CLASS } from "@/lib/b2b-hub/hub-index-hero-layout"
import { cn } from "@/lib/utils"

type Props = {
  breadcrumb: ReactNode
  title: ReactNode
  intro?: ReactNode
  actions?: ReactNode
  visual: ReactNode
  visualAlign?: "phone" | "wide"
  showLogoStrip?: boolean
}

export function HubDetailHeroShell({
  breadcrumb,
  title,
  intro,
  actions,
  visual,
  visualAlign = "phone",
  showLogoStrip = true,
}: Props) {
  const visualWrap =
    visualAlign === "wide"
      ? "relative z-0 order-first mb-6 flex w-full min-w-0 justify-center lg:order-none lg:mb-0 lg:mt-0 lg:justify-end lg:pl-4"
      : "relative z-0 order-first mb-6 flex w-full min-w-0 justify-center lg:order-none lg:mb-0 lg:mt-0 lg:min-h-[300px] lg:justify-end lg:pl-2"

  return (
    <section
      className={cn(
        "w-full border-b border-[#e0e0e0] bg-[var(--primary-bg-color)]",
        HUB_DETAIL_HERO_VIEWPORT_CLASS
      )}
    >
      <div className="mx-auto flex h-full min-h-[inherit] w-full max-w-7xl flex-1 flex-col px-4 sm:px-6">
        <div className="grid flex-1 items-center gap-10 pt-8 pb-4 md:gap-12 md:pt-10 lg:grid-cols-2 lg:items-center lg:pb-6">
          <div className="relative z-10 flex min-w-0 flex-col items-start justify-center text-center md:text-left">
            <div className="mb-6 flex w-full justify-center md:justify-start">{breadcrumb}</div>
            <header className="w-full">
              {title}
              {intro}
              {actions ? (
                <div className="mx-auto mt-8 flex w-full max-w-[320px] flex-col gap-3 md:mx-0 md:max-w-none md:flex-row md:flex-wrap md:items-center md:justify-start [&_a]:flex [&_a]:w-full [&_a]:justify-center md:[&_a]:w-auto">
                  {actions}
                </div>
              ) : null}
            </header>
          </div>
          <div className={visualWrap} aria-hidden={visualAlign === "phone"}>
            {visual}
          </div>
        </div>
        {showLogoStrip ? <HubLogoStrip className="mt-auto shrink-0" /> : null}
      </div>
    </section>
  )
}
