import { HubTestimonialAvatar } from "@/components/b2b-hub/hub-testimonial-avatar"
import { hubBuyerHubTestimonials } from "@/lib/b2b-hub/hub-testimonials"
import { cn } from "@/lib/utils"

type Props = {
  title?: string
  className?: string
}

export function HubTestimonialsSection({ title, className }: Props) {
  return (
    <section className={cn("mb-16", className)}>
      {title ? (
        <h2 className="mb-8 text-center text-2xl font-bold text-[#111111] md:text-3xl">
          {title}
        </h2>
      ) : null}
      <div className="mx-auto grid max-w-[1224px] grid-cols-1 gap-5 md:grid-cols-3">
        {hubBuyerHubTestimonials.map((t) => (
          <article
            key={t.name}
            className="flex flex-col gap-4 rounded-[19px] border border-[#E6E0D8] bg-[#FAF8F5] p-7 md:p-8"
          >
            <div className="flex gap-0.5 text-[#2E2E2E]" aria-hidden>
              {"★★★★★".split("").map((s, i) => (
                <span key={i} className="text-sm">
                  {s}
                </span>
              ))}
            </div>
            <p className="flex-1 text-xl leading-snug tracking-tight text-[#2E2E2E]">
              {t.quote}
            </p>
            <div className="h-px bg-[#E1DCD5]" />
            <div className="flex items-center gap-2.5">
              <HubTestimonialAvatar
                name={t.name}
                initials={t.initials}
                avatarSrc={t.avatarSrc}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#2E2E2E]">{t.name}</p>
                <p className="text-[11px] leading-snug text-[#928B82]">{t.role}</p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center rounded-md bg-[#EDE9E3] px-2 py-1 text-[9px] font-medium tracking-wide text-[#5C564E]">
              ↑ {t.tag}
            </span>
          </article>
        ))}
      </div>
    </section>
  )
}
