import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  persistMainSiteEvent,
  resolveCountry,
  resolveDeviceType,
  type MainSiteEventInput,
} from "@/lib/main-site-tracking/server"

const bodySchema = z.object({
  timestamp: z.string().datetime(),
  pageUrl: z.string().url(),
  referrer: z.string().min(1),
  eventType: z.enum(["click", "form_click", "form_complete", "login_click", "page_view"]),
  eventName: z.string().min(1),
  targetUrl: z.string().url().optional(),
  contentType: z.enum(["blog", "article", "other"]).optional(),
  contentSlug: z.string().optional(),
  contactName: z.string().optional(),
  contactValue: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const headers = request.headers
    const country = resolveCountry(
      headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry")
    )
    const deviceType = resolveDeviceType(headers.get("user-agent"))

    await persistMainSiteEvent(parsed.data as MainSiteEventInput, { country, deviceType })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[main-site tracking] failed to store event:", error)
    return NextResponse.json({ error: "Failed to store event" }, { status: 500 })
  }
}
