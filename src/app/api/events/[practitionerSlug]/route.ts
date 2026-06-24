import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function getCoreLiteBase() {
  const authUrl = process.env.CONSENTZ_AUTH_API_URL
  if (!authUrl) throw new Error('CONSENTZ_AUTH_API_URL is not configured')
  return `${new URL(authUrl).origin}/api/core-lite`
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { practitionerSlug: string } },
) {
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
      return NextResponse.json({ events: [] })
    }

    const url = `${getCoreLiteBase()}/clinics/${coreClinicId}/events`
    const appId = process.env.CONSENTZ_APPLICATION_ID ?? 'admin'
    console.log(`[events] GET ${url}  appId=${appId}`)
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-APPLICATION-ID': appId },
    })
    console.log(`[events] Core HTTP ${res.status} for coreClinicId=${coreClinicId}`)

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`[events] Core error body: ${body}`)
      return NextResponse.json({ events: [] })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[events] unexpected error:', err)
    return NextResponse.json({ events: [] })
  }
}
