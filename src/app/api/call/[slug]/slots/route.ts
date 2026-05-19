import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { COOKIE_TOKEN } from '@/lib/auth'

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

    console.log(`[call/slots] slug=${params.slug} coreClinicId=${clinic?.coreClinicId ?? 'null'}`)

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

    const sessionToken = req.cookies.get(COOKIE_TOKEN)?.value
    const url = `${getCoreLiteBase()}/clinics/${clinic.coreClinicId}/call-slots?${qs}`
    console.log(`[call/slots] GET ${url} hasToken=${!!sessionToken}`)

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(sessionToken ? { 'X-SESSION-TOKEN': sessionToken } : {}),
      },
    })

    const body = await res.text()
    console.log(`[call/slots] Core HTTP ${res.status} body=${body}`)

    if (!res.ok) {
      return NextResponse.json({ slots: [] })
    }

    let data: unknown
    try { data = JSON.parse(body) } catch {
      console.error('[call/slots] non-JSON response from Core')
      return NextResponse.json({ slots: [] })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[call/slots] unexpected error:', err)
    return NextResponse.json({ slots: [] })
  }
}
