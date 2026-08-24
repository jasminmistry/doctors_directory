import { HUB_CTA_PRIMARY_CLASS } from "@/components/b2b-hub/hub-cta-buttons"
import { b2bBookDemoHref } from "@/lib/b2b-hub/seo"
import { HUB_BLEED_FROM_CONTAINER } from "@/components/b2b-hub/hub-hero-layout-classes"
import { cn } from "@/lib/utils"
import { ServiceProviderCollage } from "@/components/b2b-hub/hub-service-provider-collage"

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com"

export function HubServiceProviderSection() {
  return (
    <section
      className={cn(
        HUB_BLEED_FROM_CONTAINER,
        "mb-16 bg-white lg:overflow-hidden"
      )}
    >
      <div className="mx-auto bg-white border border-[#e0e0e0] overflow-hidden rounded-lg flex max-w-7xl flex-col gap-6 px-4 py-10 sm:gap-8 sm:px-6 sm:py-12 lg:h-full lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-0 lg:pl-20 lg:pr-6">
        <div className="flex min-w-0 max-w-[629px] flex-col items-center gap-3 text-center lg:max-h-[302px] lg:items-start lg:gap-3 lg:py-1 lg:text-left">
          <h2 className="text-[26px] font-semibold leading-[1.1] text-[#1A1A1A] sm:text-[30px] lg:text-[36px] lg:leading-[1.08]">
            Are You A Service Provider?
          </h2>
          <p className="text-base font-normal leading-snug text-[#1A1A1A] md:text-md">
            Join Consentz to streamline your clinic operations, enhance patient
            experience, and grow your business.
          </p>
          <div className="pt-1 lg:pt-2">
            <a href={b2bBookDemoHref()} className={HUB_CTA_PRIMARY_CLASS}>
              Learn More
            </a>
          </div>
        </div>
        <div className="relative mx-auto aspect-[915/846] w-full max-w-[min(100%,360px)] min-h-[200px] overflow-visible sm:max-w-[400px] lg:mx-0 lg:ml-auto lg:mr-0 lg:h-full lg:max-h-[302px] lg:w-[min(46vw,560px)] lg:max-w-[560px] lg:shrink-0 lg:overflow-hidden">
          <ServiceProviderCollage />
        </div>
      </div>
    </section>
  )
}
