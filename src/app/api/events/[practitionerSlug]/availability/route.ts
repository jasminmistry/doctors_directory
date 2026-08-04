import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function getCoreLiteBase() {
  const authUrl = process.env.CONSENTZ_AUTH_API_URL
  if (!authUrl) throw new Error('CONSENTZ_AUTH_API_URL is not configured')
  return `${new URL(authUrl).origin}/api/core-lite`
}

export async function GET(
  req: NextRequest,
  { params }: { params: { practitionerSlug: string } },
) {
  const eventId = req.nextUrl.searchParams.get('eventId')
  const date = req.nextUrl.searchParams.get('date')

  if (!eventId || !date) {
    return NextResponse.json({ error: 'eventId and date are required' }, { status: 400 })
  }

  try {
    const row = await prisma.practitioner.findUnique({
      where: { slug: params.practitionerSlug },
      select: {
        clinicAssociations: {
          orderBy: { clinicId: 'asc' },
          take: 1,
          select: { clinic: { select: { coreClinicId: true } } },
        },
      },
    })

    const coreClinicId = row?.clinicAssociations[0]?.clinic.coreClinicId ?? null

    if (!coreClinicId) {
      return NextResponse.json({ available: [], slot_duration: 30 })
    }

    const qs = new URLSearchParams({ eventId, date })
    const url = `${getCoreLiteBase()}/clinics/${coreClinicId}/availability?${qs}`
    const appId = process.env.CONSENTZ_APPLICATION_ID ?? 'admin'
    console.log(`[events/availability] GET ${url}  appId=${appId}`)
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-APPLICATION-ID': appId },
      signal: AbortSignal.timeout(5000),
    })
    console.log(`[events/availability] Core HTTP ${res.status}`)

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`[events/availability] Core error body: ${body}`)
      return NextResponse.json({ available: [], slot_duration: 30 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[events/availability] unexpected error:', err)
    return NextResponse.json({ available: [], slot_duration: 30 })
  }
}
