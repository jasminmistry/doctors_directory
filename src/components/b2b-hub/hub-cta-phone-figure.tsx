import Image from "next/image"
import { cn } from "@/lib/utils"

const CTA_CLINIC_PHONE_SRC = "/directory/images/cta-clinic-phone.png"

type Props = {
  className?: string
}

export function HubCtaPhoneFigure({ className }: Props) {
  return (
    <div
      className={cn(
        "pointer-events-none relative z-30 mx-auto mt-6 flex w-full max-w-[300px] items-end justify-center overflow-visible",
        "h-[min(78vw,380px)] sm:mt-8 sm:h-[340px] sm:max-w-[320px]",
        "max-lg:mb-0",
        "lg:z-0 lg:mt-0 lg:mb-0 lg:ml-auto lg:h-[469px] lg:w-full lg:max-w-[407px] lg:justify-self-end lg:overflow-hidden lg:pt-[41px]",
        className
      )}
      aria-hidden
    >
      <Image
        src={CTA_CLINIC_PHONE_SRC}
        alt=""
        width={586}
        height={731}
        className="relative h-full w-auto max-w-none select-none object-contain object-bottom lg:hidden"
        sizes="(max-width: 1024px) 280px, 407px"
      />
      <Image
        src={CTA_CLINIC_PHONE_SRC}
        alt=""
        width={586}
        height={731}
        className="absolute hidden max-w-none select-none lg:block"
        sizes="407px"
        style={{
          height: "156.09%",
          width: "144.06%",
          left: "-15.65%",
          top: "-7.82%",
        }}
      />
    </div>
  )
}
