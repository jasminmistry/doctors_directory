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
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { slug: params.clinicSlug },
      select: { coreClinicId: true },
    })

    const coreClinicId = clinic?.coreClinicId ?? null

    if (!coreClinicId) {
      return NextResponse.json({ events: [] })
    }

    const url = `${getCoreLiteBase()}/clinics/${coreClinicId}/events`
    const res = await fetch(url, { cache: 'no-store', headers: { 'Content-Type': 'application/json' } })

    if (!res.ok) {
      console.error(`[events/clinic] Core HTTP ${res.status} for coreClinicId=${coreClinicId}`)
      return NextResponse.json({ events: [] })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[events/clinic] unexpected error:', err)
    return NextResponse.json({ events: [] })
  }
}
