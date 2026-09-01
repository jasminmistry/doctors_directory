// Resolves a Google Place ID for a clinic so the public "write a Google review" deep link
// works even before the clinic completes an OAuth connection.
//
// Priority:
//   1. An explicit Clinic.placeId (entered in the portal/admin, or filled by the GBP bind step)
//   2. A hex CID parsed out of the scraped Google Maps URL (Clinic.gmapsUrl)
//   3. null — caller omits the review prompt
//
// A hex CID (from a Maps place URL) is not itself a Place ID, but Google's
// writereview endpoint accepts either the modern ChIJ… Place ID or a decimal CID via
// `?cid=`. We therefore return a discriminated result so callers build the right URL.

export type ReviewLinkTarget =
  | { kind: 'placeId'; value: string }
  | { kind: 'cid'; value: string }
  | null

interface ClinicPlaceInfo {
  placeId?: string | null
  gmapsUrl?: string | null
}

/** Extracts the hex CID (`0x…:0x<hex>`) from a Google Maps place URL, as a decimal string. */
export function parseCidFromGmapsUrl(url: string | null | undefined): string | null {
  if (!url) return null

  // ...!1s0x487604c4d…:0x<hex>!... — the second hex group is the CID
  const bang = url.match(/!1s0x[0-9a-fA-F]+:0x([0-9a-fA-F]+)/)
  if (bang) return hexToDecimal(bang[1])

  // ...?cid=12345678901234567890
  const cidParam = url.match(/[?&]cid=(\d+)/)
  if (cidParam) return cidParam[1]

  // ...ftid=0x…:0x<hex>
  const ftid = url.match(/[?&]ftid=0x[0-9a-fA-F]+:0x([0-9a-fA-F]+)/)
  if (ftid) return hexToDecimal(ftid[1])

  return null
}

function hexToDecimal(hex: string): string | null {
  try {
    return BigInt(`0x${hex}`).toString(10)
  } catch {
    return null
  }
}

export function resolveReviewLinkTarget(clinic: ClinicPlaceInfo): ReviewLinkTarget {
  const explicit = clinic.placeId?.trim()
  if (explicit) return { kind: 'placeId', value: explicit }

  const cid = parseCidFromGmapsUrl(clinic.gmapsUrl)
  if (cid) return { kind: 'cid', value: cid }

  return null
}

/**
 * Builds the public Google "write a review" URL.
 * `newReviewUri` (from a bound GBP location) always wins when present.
 */
export function buildGoogleReviewUrl(opts: {
  newReviewUri?: string | null
  clinic: ClinicPlaceInfo
}): string | null {
  if (opts.newReviewUri) return opts.newReviewUri

  const target = resolveReviewLinkTarget(opts.clinic)
  if (!target) return null

  return target.kind === 'placeId'
    ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(target.value)}`
    : `https://www.google.com/maps?cid=${target.value}&reviews=1`
}
