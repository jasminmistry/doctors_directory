import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function getCoreLiteBase() {
  const authUrl = process.env.CONSENTZ_AUTH_API_URL
  if (!authUrl) throw new Error('CONSENTZ_AUTH_API_URL is not configured')
  return `${new URL(authUrl).origin}/api/core-lite`
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { slug: params.slug },
      select: { coreClinicId: true },
    })

    if (!clinic?.coreClinicId) {
      return NextResponse.json({ slots: [] })
    }

    const date = req.nextUrl.searchParams.get('date')
    const practitionerId = req.nextUrl.searchParams.get('practitioner_id')

    if (!date) {
      return NextResponse.json({ error: 'date is required' }, { status: 400 })
    }

    const qs = new URLSearchParams({ date })
    if (practitionerId) qs.set('practitioner_id', practitionerId)

    const res = await fetch(
      `${getCoreLiteBase()}/clinics/${clinic.coreClinicId}/call-slots?${qs}`,
      { headers: { 'Content-Type': 'application/json' } },
    )

    if (!res.ok) {
      console.error('[call/slots]', res.status, await res.text().catch(() => ''))
      return NextResponse.json({ slots: [] })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[call/slots]', err)
    return NextResponse.json({ slots: [] })
  }
}
