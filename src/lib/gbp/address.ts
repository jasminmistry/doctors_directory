// Helpers for the structured ClinicAddress <-> single-line gmapsAddress relationship.
// gmapsAddress is used in search predicates (`contains`) and the public profile, so it is
// regenerated from the structured parts on every save.

export interface StructuredAddress {
  addressLines?: string[] | null
  locality?: string | null
  administrativeArea?: string | null
  postalCode?: string | null
  regionCode?: string | null
}

/** "12 High Street, Mayfair, London, W1K 5AB" — omits empty parts, dedupes. */
export function formatSingleLineAddress(addr: StructuredAddress): string {
  const parts: string[] = []

  for (const line of addr.addressLines ?? []) {
    const t = line?.trim()
    if (t) parts.push(t)
  }
  for (const part of [addr.locality, addr.administrativeArea, addr.postalCode]) {
    const t = part?.trim()
    if (t && !parts.some((p) => p.toLowerCase() === t.toLowerCase())) parts.push(t)
  }

  return parts.join(', ')
}
