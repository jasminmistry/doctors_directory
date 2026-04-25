import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { persistEvent, resolveCountry, resolveDeviceType } from "@/lib/tracking/server"

const bodySchema = z.object({
  timestamp: z.string().datetime(),
  pageUrl: z.string().url(),
  pageType: z.enum(["practitioner_page", "clinic_page", "collection_page", "other"]),
  referrer: z.string().min(1),
  ctaLabel: z.string().min(1),
  ctaTargetUrl: z.string().url().optional(),
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

    await persistEvent(parsed.data, { country, deviceType })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to store tracking event:", error)
    return NextResponse.json({ error: "Failed to store event" }, { status: 500 })
  }
}
