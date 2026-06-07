import { BestRankedBlock } from "@/components/best-ranked-block"
import { buildClinicRankedEntries } from "@/lib/best-ranked"
import { toDisplayTitle } from "@/lib/b2b-hub/text"
import { getClinics } from "@/lib/sitemap-data"

type Props = {
  cityTitle: string
}

function normCity(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ")
}

export function HubTopClinicsSection({ cityTitle }: Props) {
  const key = normCity(cityTitle)
  const clinics = getClinics().filter(
    (c) => normCity(c.City || "") === key && c.slug
  )
  const entries = buildClinicRankedEntries(clinics, 4)
  if (entries.length === 0) {
    return null
  }

  return (
    <section className="mb-16">
      <BestRankedBlock
        title={toDisplayTitle(`Top Clinics in ${cityTitle}`)}
        entries={entries}
      />
    </section>
  )
}
