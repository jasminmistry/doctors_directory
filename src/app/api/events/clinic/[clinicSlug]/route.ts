import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function getCoreLiteBase() {
  const authUrl = process.env.CONSENTZ_AUTH_API_URL
  if (!authUrl) throw new Error('CONSENTZ_AUTH_API_URL is not configured')
  return `${new URL(authUrl).origin}/api/core-lite`
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { clinicSlug: string } },
) {
  const { clinicSlug } = params
  console.log(`[events/clinic] GET slug=${clinicSlug}`)

  try {
    const clinic = await prisma.clinic.findUnique({
      where: { slug: clinicSlug },
      select: { coreClinicId: true },
    })

    const coreClinicId = clinic?.coreClinicId ?? null
    console.log(`[events/clinic] coreClinicId=${coreClinicId}`)

    if (!coreClinicId) {
      console.log(`[events/clinic] EMPTY REASON: clinic "${clinicSlug}" has no coreClinicId linked — returning empty`)
      return NextResponse.json({ events: [] })
    }

    const url = `${getCoreLiteBase()}/clinics/${coreClinicId}/events`
    const appId = process.env.CONSENTZ_APPLICATION_ID ?? 'admin'
    console.log(`[events/clinic] calling Core: GET ${url}  X-APPLICATION-ID=${appId}`)

    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'X-APPLICATION-ID': appId,
      },
      signal: AbortSignal.timeout(5000),
    })

    console.log(`[events/clinic] Core responded HTTP ${res.status}`)

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`[events/clinic] EMPTY REASON: Core returned HTTP ${res.status} for clinic ${coreClinicId} — returning empty. Body: ${body}`)
      return NextResponse.json({ events: [] })
    }

    const data = await res.json()
    const eventsArr = data.events ?? []
    if (eventsArr.length === 0) {
      console.log(`[events/clinic] EMPTY REASON: Core returned HTTP ${res.status} with 0 events for clinic ${coreClinicId} (likely all events are status=false/inactive, since the core-lite endpoint filters those out)`)
    } else {
      console.log(`[events/clinic] Core returned ${eventsArr.length} events for clinic ${coreClinicId}`)
      console.log(`[events/clinic] first event keys:`, Object.keys(eventsArr[0]))
      console.log(`[events/clinic] first event sample:`, JSON.stringify(eventsArr[0]))
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error(`[events/clinic] EMPTY REASON: unexpected error for slug "${clinicSlug}" — returning empty:`, err)
    return NextResponse.json({ events: [] })
  }
}
