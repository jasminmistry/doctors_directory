/**
 * Server-side GA4 events via the Measurement Protocol. Used for things that
 * happen off the browser or must be trustworthy — a completed Stripe purchase,
 * a lead unlock, a claim approval.
 *
 * Required env: `GA4_MP_API_SECRET` (GA4 Admin → Data Streams → Measurement
 * Protocol API secrets) and `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
 *
 * NOTE: MP events bypass the browser's consent signal. Only send them for
 * legitimate-interest operational conversions (purchase, sign_up), never for
 * behavioural tracking, and never include PII.
 */

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-QTXQ1H7HG2"

export interface MpEvent {
  name: string
  params?: Record<string, unknown>
}

export function isMpConfigured(): boolean {
  return Boolean(process.env.GA4_MP_API_SECRET)
}

/**
 * A stable synthetic client id for a server actor that has no browser session
 * (e.g. a clinic unlocking a lead from the portal, when we never captured their
 * `_ga`). Groups that actor's events together without colliding with real users.
 */
export function syntheticClientId(seed: string | number): string {
  return `srv.${seed}`
}

/**
 * Send one or more events for a single user. Fire-and-forget — failures are
 * logged, never thrown, so analytics can't break a payment or approval flow.
 */
export async function sendMpEvents(
  clientId: string | null | undefined,
  events: MpEvent[],
): Promise<void> {
  const apiSecret = process.env.GA4_MP_API_SECRET
  if (!apiSecret || events.length === 0) return

  const client_id = clientId && clientId.trim() ? clientId.trim() : syntheticClientId("unknown")

  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
        MEASUREMENT_ID,
      )}&api_secret=${encodeURIComponent(apiSecret)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // GA4 dedupes on (client_id, event name, timestamp) loosely; a unique
        // transaction_id in params is what actually prevents double-counting.
        body: JSON.stringify({
          client_id,
          non_personalized_ads: true,
          events: events.map((e) => ({
            name: e.name,
            params: Object.fromEntries(
              Object.entries(e.params ?? {}).filter(([, v]) => v !== null && v !== undefined && v !== ""),
            ),
          })),
        }),
        signal: AbortSignal.timeout(4000),
      },
    )
    if (!res.ok) {
      console.warn(`[mp] GA4 collect returned ${res.status}`)
    }
  } catch (err) {
    console.warn("[mp] failed to send GA4 event:", err)
  }
}

/** Convenience: a GA4 `purchase` event. */
export function purchaseEvent(input: {
  transactionId: string
  value: number
  currency?: string
  itemId: string
  itemName: string
  extra?: Record<string, unknown>
}): MpEvent {
  return {
    name: "purchase",
    params: {
      transaction_id: input.transactionId,
      value: input.value,
      currency: input.currency ?? "GBP",
      items: [{ item_id: input.itemId, item_name: input.itemName, price: input.value, quantity: 1 }],
      ...input.extra,
    },
  }
}
