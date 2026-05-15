import type { ReactNode } from "react"
import { HubLogoStrip } from "@/components/b2b-hub/hub-logo-strip"

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
    <section className="w-full border-b border-[#E5E7EB] bg-[var(--primary-bg-color)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-10 pt-8 pb-6 md:gap-12 md:pt-10 md:pb-8 lg:grid-cols-2 lg:items-center lg:gap-12 lg:pt-10 lg:pb-6 max-lg:max-h-[min(92vh,820px)] lg:max-h-[min(88vh,720px)]">
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
        {showLogoStrip ? <HubLogoStrip /> : null}
      </div>
    </section>
  )
}
