import { hasTrackingDatabaseConfig, prisma } from "@/lib/prisma"

export interface MainSiteEventInput {
  timestamp: string
  pageUrl: string
  referrer: string
  eventType: string
  eventName: string
  targetUrl?: string
  contentType?: string
  contentSlug?: string
  contactName?: string
  contactValue?: string
  meta?: Record<string, unknown>
}

interface PersistContext {
  country: string
  deviceType: "mobile" | "desktop"
}

function toDate(value: string): Date {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return new Date()
  return date
}

export async function persistMainSiteEvent(
  payload: MainSiteEventInput,
  context: PersistContext
): Promise<void> {
  if (!hasTrackingDatabaseConfig) return

  await prisma.mainSiteEvent.create({
    data: {
      timestamp: toDate(payload.timestamp),
      pageUrl: payload.pageUrl,
      referrer: payload.referrer,
      country: context.country,
      deviceType: context.deviceType,
      eventType: payload.eventType,
      eventName: payload.eventName,
      targetUrl: payload.targetUrl ?? null,
      contentType: payload.contentType ?? null,
      contentSlug: payload.contentSlug ?? null,
      contactName: payload.contactName ?? null,
      contactValue: payload.contactValue ?? null,
      metaJson: payload.meta ? JSON.stringify(payload.meta) : null,
    },
  })
}

export function resolveCountry(headerValue: string | null): string {
  if (!headerValue) return "unknown"
  return headerValue.toUpperCase()
}

export function resolveDeviceType(userAgent: string | null): "mobile" | "desktop" {
  if (!userAgent) return "desktop"
  return /mobile|android|iphone|ipad|ipod/i.test(userAgent) ? "mobile" : "desktop"
}
