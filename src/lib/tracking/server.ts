import fs from "fs/promises"
import path from "path"
import { createClient } from "@supabase/supabase-js"
import type { CtaClickPayload, LeadPayload } from "@/lib/tracking/types"

interface PersistContext {
  country: string
  deviceType: "mobile" | "desktop"
}

const LOCAL_TRACKING_DIR = path.join(process.cwd(), ".data", "tracking")

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) return null
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

async function appendLine(fileName: string, payload: unknown) {
  await fs.mkdir(LOCAL_TRACKING_DIR, { recursive: true })
  const filePath = path.join(LOCAL_TRACKING_DIR, fileName)
  await fs.appendFile(filePath, `${JSON.stringify(payload)}\n`, "utf-8")
}

export async function persistEvent(payload: CtaClickPayload, context: PersistContext): Promise<void> {
  const row = {
    timestamp: payload.timestamp,
    page_url: payload.pageUrl,
    page_type: payload.pageType,
    referrer: payload.referrer,
    country: context.country,
    device_type: context.deviceType,
    cta_label: payload.ctaLabel,
    cta_target_url: payload.ctaTargetUrl ?? null,
  }

  const supabase = getSupabaseClient()
  const tableName = process.env.SUPABASE_EVENTS_TABLE || "directory_events"

  if (supabase) {
    const { error } = await supabase.from(tableName).insert(row)
    if (!error) return
    console.warn("[tracking] failed to insert event into supabase:", error.message)
  }

  await appendLine("events.ndjson", row)
}

export async function persistLead(payload: LeadPayload, context: PersistContext): Promise<void> {
  const row = {
    timestamp: payload.timestamp,
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

  const supabase = getSupabaseClient()
  const tableName = process.env.SUPABASE_LEADS_TABLE || "directory_leads"

  if (supabase) {
    const { error } = await supabase.from(tableName).insert(row)
    if (!error) return
    console.warn("[tracking] failed to insert lead into supabase:", error.message)
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
