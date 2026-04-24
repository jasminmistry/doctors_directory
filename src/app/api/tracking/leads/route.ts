import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { persistLead, resolveCountry, resolveDeviceType } from "@/lib/tracking/server"

const bodySchema = z.object({
  timestamp: z.string().datetime(),
  pageUrl: z.string().url(),
  pageType: z.enum(["practitioner_page", "clinic_page", "collection_page", "other"]),
  referrer: z.string().min(1),
  name: z.string().min(1),
  contact: z.string().min(1),
  treatment: z.string().optional(),
  location: z.string().optional(),
  budget: z.string().optional(),
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

    await persistLead(parsed.data, { country, deviceType })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to store lead:", error)
    return NextResponse.json({ error: "Failed to store lead" }, { status: 500 })
  }
}
