import { gbpFetch } from '@/lib/gbp/client'
import { GBP_PLACE_ACTIONS_BASE } from '@/lib/gbp/config'

// Upserts the APPOINTMENT place action link (the "Book" button on the Maps listing).

export async function syncBookingLink(
  connectionId: number,
  locationName: string, // "locations/123"
  bookingUrl: string,
): Promise<void> {
  const existing = (await gbpFetch(
    connectionId,
    `${GBP_PLACE_ACTIONS_BASE}/${locationName}/placeActionLinks`,
  ).catch(() => ({}))) as {
    placeActionLinks?: Array<{ name: string; placeActionType?: string; uri?: string }>
  }

  const current = existing.placeActionLinks?.find((l) => l.placeActionType === 'APPOINTMENT')
  const body = {
    providerType: 'MERCHANT',
    placeActionType: 'APPOINTMENT',
    uri: bookingUrl,
    isPreferred: true,
  }

  if (current?.name) {
    await gbpFetch(connectionId, `${GBP_PLACE_ACTIONS_BASE}/${current.name}?updateMask=uri`, {
      method: 'PATCH',
      body: JSON.stringify({ uri: bookingUrl }),
    })
  } else {
    await gbpFetch(connectionId, `${GBP_PLACE_ACTIONS_BASE}/${locationName}/placeActionLinks`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
}
