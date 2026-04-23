import fs from "fs/promises"
import path from "path"
import type { CtaClickPayload, LeadPayload } from "@/lib/tracking/types"
import { getTrackingMariaPool, toSafeTableName } from "@/lib/tracking/mariadb-pool"

interface PersistContext {
  country: string
  deviceType: "mobile" | "desktop"
}

const LOCAL_TRACKING_DIR = path.join(process.cwd(), ".data", "tracking")

function formatTimestampForMariaDb(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 23).replace("T", " ")
  }
  return date.toISOString().slice(0, 23).replace("T", " ")
}

async function appendLine(fileName: string, payload: unknown) {
  await fs.mkdir(LOCAL_TRACKING_DIR, { recursive: true })
  const filePath = path.join(LOCAL_TRACKING_DIR, fileName)
  await fs.appendFile(filePath, `${JSON.stringify(payload)}\n`, "utf-8")
}

export async function persistEvent(payload: CtaClickPayload, context: PersistContext): Promise<void> {
  const row = {
    timestamp: formatTimestampForMariaDb(payload.timestamp),
    page_url: payload.pageUrl,
    page_type: payload.pageType,
    referrer: payload.referrer,
    country: context.country,
    device_type: context.deviceType,
    cta_label: payload.ctaLabel,
    cta_target_url: payload.ctaTargetUrl ?? null,
  }

  const mariaDb = getTrackingMariaPool()
  const tableName = toSafeTableName(process.env.MARIADB_EVENTS_TABLE, "directory_events")

  if (mariaDb) {
    try {
      await mariaDb.execute(
        `INSERT INTO \`${tableName}\`
          (timestamp, page_url, page_type, referrer, country, device_type, cta_label, cta_target_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.timestamp,
          row.page_url,
          row.page_type,
          row.referrer,
          row.country,
          row.device_type,
          row.cta_label,
          row.cta_target_url,
        ]
      )
      return
    } catch (error) {
      console.warn("[tracking] failed to insert event into mariadb:", error)
    }
  }

  await appendLine("events.ndjson", row)
}

export async function persistLead(payload: LeadPayload, context: PersistContext): Promise<void> {
  const row = {
    timestamp: formatTimestampForMariaDb(payload.timestamp),
    page_url: payload.pageUrl,
    page_type: payload.pageType,
    referrer: payload.referrer,
    country: context.country,
    device_type: context.deviceType,
    name: payload.name,
    contact: payload.contact,
    treatment: payload.treatment ?? null,
    location: payload.location ?? null,
    budget: payload.budget ?? null,
  }

  const mariaDb = getTrackingMariaPool()
  const tableName = toSafeTableName(process.env.MARIADB_LEADS_TABLE, "directory_leads")

  if (mariaDb) {
    try {
      await mariaDb.execute(
        `INSERT INTO \`${tableName}\`
          (timestamp, page_url, page_type, referrer, country, device_type, name, contact, treatment, location, budget)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.timestamp,
          row.page_url,
          row.page_type,
          row.referrer,
          row.country,
          row.device_type,
          row.name,
          row.contact,
          row.treatment,
          row.location,
          row.budget,
        ]
      )
      return
    } catch (error) {
      console.warn("[tracking] failed to insert lead into mariadb:", error)
    }
  }

  await appendLine("leads.ndjson", row)
}

export function resolveCountry(headerValue: string | null): string {
  if (!headerValue) return "unknown"
  return headerValue.toUpperCase()
}

export function resolveDeviceType(userAgent: string | null): "mobile" | "desktop" {
  if (!userAgent) return "desktop"
  return /mobile|android|iphone|ipad|ipod/i.test(userAgent) ? "mobile" : "desktop"
}
