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
      console.log(`[events/clinic] no coreClinicId — returning empty`)
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
    })

    console.log(`[events/clinic] Core responded HTTP ${res.status}`)

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`[events/clinic] Core error body: ${body}`)
      return NextResponse.json({ events: [] })
    }

    const data = await res.json()
    const eventsArr = data.events ?? []
    console.log(`[events/clinic] Core returned ${eventsArr.length} events`)
    if (eventsArr.length > 0) {
      console.log(`[events/clinic] first event keys:`, Object.keys(eventsArr[0]))
      console.log(`[events/clinic] first event sample:`, JSON.stringify(eventsArr[0]))
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error('[events/clinic] unexpected error:', err)
    return NextResponse.json({ events: [] })
  }
}
