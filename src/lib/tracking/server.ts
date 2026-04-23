import fs from "fs/promises"
import path from "path"
import { hasTrackingDatabaseConfig, prisma } from "@/lib/prisma"
import type { CtaClickPayload, LeadPayload } from "@/lib/tracking/types"

interface PersistContext {
  country: string
  deviceType: "mobile" | "desktop"
}

const LOCAL_TRACKING_DIR = path.join(process.cwd(), ".data", "tracking")

function toDate(value: string): Date {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return new Date()
  return date
}

async function appendLine(fileName: string, payload: unknown) {
  await fs.mkdir(LOCAL_TRACKING_DIR, { recursive: true })
  const filePath = path.join(LOCAL_TRACKING_DIR, fileName)
  await fs.appendFile(filePath, `${JSON.stringify(payload)}\n`, "utf-8")
}

export async function persistEvent(payload: CtaClickPayload, context: PersistContext): Promise<void> {
  const row = {
    timestamp: toDate(payload.timestamp),
    pageUrl: payload.pageUrl,
    pageType: payload.pageType,
    referrer: payload.referrer,
    country: context.country,
    deviceType: context.deviceType,
    ctaLabel: payload.ctaLabel,
    ctaTargetUrl: payload.ctaTargetUrl ?? null,
  }

  if (hasTrackingDatabaseConfig) {
    try {
      await prisma.directoryEvent.create({ data: row })
      return
    } catch (error) {
      console.warn("[tracking] failed to insert event via prisma:", error)
    }
  }

  await appendLine("events.ndjson", {
    ...row,
    timestamp: row.timestamp.toISOString(),
  })
}

export async function persistLead(payload: LeadPayload, context: PersistContext): Promise<void> {
  const row = {
    timestamp: toDate(payload.timestamp),
    pageUrl: payload.pageUrl,
    pageType: payload.pageType,
    referrer: payload.referrer,
    country: context.country,
    deviceType: context.deviceType,
    name: payload.name,
    contact: payload.contact,
    treatment: payload.treatment ?? null,
    location: payload.location ?? null,
    budget: payload.budget ?? null,
  }

  if (hasTrackingDatabaseConfig) {
    try {
      await prisma.directoryLead.create({ data: row })
      return
    } catch (error) {
      console.warn("[tracking] failed to insert lead via prisma:", error)
    }
  }

  await appendLine("leads.ndjson", {
    ...row,
    timestamp: row.timestamp.toISOString(),
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
