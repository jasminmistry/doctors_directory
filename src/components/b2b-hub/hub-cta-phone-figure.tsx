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
        "pointer-events-none relative z-0 mx-auto mt-8 h-[200px] w-[174px] overflow-hidden sm:h-[220px] sm:w-[191px]",
        "lg:mt-0 lg:ml-auto lg:h-[469px] lg:w-full lg:max-w-[407px] lg:justify-self-end lg:pt-[41px]",
        className
      )}
      aria-hidden
    >
      <Image
        src={CTA_CLINIC_PHONE_SRC}
        alt=""
        width={586}
        height={731}
        className="absolute max-w-none select-none"
        sizes="(max-width: 1024px) 191px, 407px"
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
