import Image from "next/image"
import { cn } from "@/lib/utils"

type Props = {
  name: string
  initials: string
  avatarSrc: string
  className?: string
}

export function HubTestimonialAvatar({ name, initials, avatarSrc, className }: Props) {
  return (
    <div
      className={cn(
        "relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#D8D4CE]",
        className
      )}
    >
      <Image
        src={avatarSrc}
        alt=""
        fill
        className="object-cover object-center"
        sizes="36px"
      />
      <span className="sr-only">
        {name} ({initials})
      </span>
    </div>
  )
}
