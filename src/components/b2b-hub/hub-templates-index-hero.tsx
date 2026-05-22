"use client"

import { useState } from "react"
import { HubIndexHeroSearch } from "@/components/b2b-hub/hub-index-hero-search"

type Props = {
  templateCount: number
  categoryCount: number
}

export function HubTemplatesIndexHero({ templateCount, categoryCount }: Props) {
  const [q, setQ] = useState("")

  return (
    <HubIndexHeroSearch
      heroTitle="Free Clinic Templates"
      heroSubtitle={`Treatment-specific downloads for consent, intake, aftercare, CQC policies, and clinic operations. ${templateCount} templates across ${categoryCount} categories.`}
      query={q}
      onQueryChange={setQ}
      inputId="templates-hub-hero"
      showSearch={false}
      fillViewport
    />
  )
}
