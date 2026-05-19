import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCoreAvailability, isCoreConfigured } from '@/lib/core-api'
import { COOKIE_TOKEN } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const date = req.nextUrl.searchParams.get('date')
  console.log(`[book/availability] slug=${params.slug} date=${date}`)

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date query param required (YYYY-MM-DD)' }, { status: 400 })
  }

  const clinic = await prisma.clinic.findUnique({
    where: { slug: params.slug },
    select: { coreClinicId: true, claimedPlan: true },
  })

  console.log(`[book/availability] clinic=${JSON.stringify(clinic)}`)

  if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
  if (!clinic.coreClinicId) {
    console.log('[book/availability] no coreClinicId — returning empty')
    return NextResponse.json({ available: [], slot_duration: 30 })
  }
  if (!isCoreConfigured()) {
    console.log('[book/availability] Core not configured (CONSENTZ_AUTH_API_URL missing?) — returning empty')
    return NextResponse.json({ available: [], slot_duration: 30 })
  }

  try {
    const sessionToken = req.cookies.get(COOKIE_TOKEN)?.value
    console.log(`[book/availability] calling Core coreClinicId=${clinic.coreClinicId} hasToken=${!!sessionToken}`)
    const data = await getCoreAvailability(clinic.coreClinicId, date, sessionToken)
    console.log(`[book/availability] Core returned ${data.available?.length ?? 0} slots`)
    return NextResponse.json(data)
  } catch (err: unknown) {
    console.error('[book/availability] Core API error:', err)
    const status = (err as { status?: number }).status
    if (status === 404) return NextResponse.json({ available: [], slot_duration: 30 })
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 502 })
  }
}
