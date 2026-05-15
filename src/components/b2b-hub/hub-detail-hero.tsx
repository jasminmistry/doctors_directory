import Link from "next/link"
import type { ReactNode } from "react"
import { HubDetailHeroShell } from "@/components/b2b-hub/hub-detail-hero-shell"
import {
  HUB_HERO_INTRO_CLASS,
  HUB_HERO_PHONE_IMAGE_CLASS,
  HUB_HERO_PHONE_SRC,
  HUB_HERO_TITLE_CLASS,
} from "@/components/b2b-hub/hub-hero-typography"
import { SoftwareHeroCollage } from "@/components/b2b-hub/hub-pillar-detail-template"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { segmentLabel, type HubSegment } from "@/lib/b2b-hub/registry"
import { toDisplayTitle } from "@/lib/b2b-hub/text"

type Props = {
  seg: HubSegment
  title: string
  intro: string
  actions?: ReactNode
  visual?: ReactNode
  visualAlign?: "phone" | "wide"
  usePhoneCollage?: boolean
}

export function HubDetailHero({
  seg,
  title,
  intro,
  actions,
  visual,
  visualAlign = "phone",
  usePhoneCollage = false,
}: Props) {
  const breadcrumb = (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/business/">Buyer Hub</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href={seg === "templates" ? "/business/templates/" : `/business/${seg}/`}>
            {segmentLabel(seg)}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="line-clamp-1">{toDisplayTitle(title)}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )

  const visualNode =
    visual ??
    (usePhoneCollage ? (
      <div className="relative h-full w-full min-h-[200px] max-w-[360px] lg:max-w-[400px]">
        <SoftwareHeroCollage />
      </div>
    ) : (
      <figure className="flex justify-center lg:justify-end">
        <img src={HUB_HERO_PHONE_SRC} alt="" className={HUB_HERO_PHONE_IMAGE_CLASS} />
      </figure>
    ))

  return (
    <HubDetailHeroShell
      breadcrumb={breadcrumb}
      title={<h1 className={HUB_HERO_TITLE_CLASS}>{toDisplayTitle(title)}</h1>}
      intro={<p className={HUB_HERO_INTRO_CLASS}>{intro}</p>}
      actions={actions}
      visual={visualNode}
      visualAlign={visualAlign}
    />
  )
}
