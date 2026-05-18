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
      ? "relative z-0 mt-8 flex min-h-0 w-full min-w-0 justify-center lg:mt-0 lg:justify-end lg:pl-4"
      : "relative z-0 mt-8 flex w-full min-w-0 justify-center lg:mt-0 lg:justify-end lg:pl-2 order-first lg:order-none"

  return (
    <section
      className={cn(
        "w-full border-b border-[#E5E7EB] bg-[var(--primary-bg-color)]",
        HUB_DETAIL_HERO_VIEWPORT_CLASS
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6">
        <div className="grid flex-1 items-center gap-10 pt-8 pb-4 md:gap-12 md:pt-10 lg:grid-cols-2 lg:items-center lg:pb-6">
          <div className="relative z-10 flex min-w-0 flex-col items-start justify-center text-center md:text-left">
            <div className="mb-6 flex w-full justify-center md:justify-start">{breadcrumb}</div>
            <header className="w-full">
              {title}
              {intro}
              {actions ? (
                <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center md:justify-start">
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
