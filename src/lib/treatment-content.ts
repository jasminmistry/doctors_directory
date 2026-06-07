import treatmentContent from "../../public/treatments.json"

const contentByName = treatmentContent as Record<string, Record<string, unknown>>

const JSON_KEY_ALIASES: Record<string, string> = {
  Microneedling: "Micro-needling",
}

export const getTreatmentJsonRecord = (
  treatmentName: string
): Record<string, unknown> | null => {
  if (contentByName[treatmentName]) {
    return contentByName[treatmentName]
  }

  const aliasKey = JSON_KEY_ALIASES[treatmentName]
  if (aliasKey && contentByName[aliasKey]) {
    return contentByName[aliasKey]
  }

  const insensitiveMatch = Object.keys(contentByName).find(
    (key) => key.toLowerCase() === treatmentName.toLowerCase()
  )

  return insensitiveMatch ? contentByName[insensitiveMatch] : null
}

export const getTreatmentOverviewText = (
  record: Record<string, unknown> | null,
  fallback: string
): string => {
  if (!record) {
    return fallback
  }

  const whatIsKey = Object.keys(record).find((key) => key.startsWith("What_is_"))
  const value = whatIsKey ? record[whatIsKey] : null

  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim()
  }

  return fallback
}

export const getTreatmentConcernDescription = (treatmentName: string): string => {
  const record = getTreatmentJsonRecord(treatmentName)
  if (record) {
    const goalsKey = Object.keys(record).find((key) => key.startsWith("Goals_of_"))
    const goalsValue = goalsKey ? record[goalsKey] : null
    if (Array.isArray(goalsValue)) {
      const items = goalsValue
        .filter((item): item is string => typeof item === "string")
        .map((item) =>
          item
            .replace(/\.$/, "")
            .replace(
              /^(Heal|Stop|Prevent|Support|Tailor|Soften|Create|Reduce|Improve|Minimise|Minimize|Treat|Address|Manage|Remove|Clear|Smooth|Lift|Tighten|Enhance|Restore|Correct|Fade|Lighten|Strengthen|Hydrate|Exfoliate|Stimulate|Define|Contour|Refresh|Rejuvenate|Repair|Shrink|Eliminate|Control|Maintain|Boost|Increase|Decrease)\s+/i,
              ""
            )
            .trim()
        )
        .filter(Boolean)
        .slice(0, 3)
      if (items.length > 0) {
        if (items.length === 1) {
          const item = items[0]
          return item.charAt(0).toLowerCase() + item.slice(1)
        }
        const last = items[items.length - 1]
        const rest = items.slice(0, -1)
        return `${rest.join(", ")}, and ${last.charAt(0).toLowerCase()}${last.slice(1)}`
      }
    }
  }
  return `the concerns that ${treatmentName.toLowerCase()} treatments are commonly used to address`
}
