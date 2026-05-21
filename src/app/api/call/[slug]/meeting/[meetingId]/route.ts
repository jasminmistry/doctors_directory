import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function getCoreLiteBase() {
  const authUrl = process.env.CONSENTZ_AUTH_API_URL
  if (!authUrl) throw new Error('CONSENTZ_AUTH_API_URL is not configured')
  return `${new URL(authUrl).origin}/api/core-lite`
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string; meetingId: string } },
) {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { slug: params.slug },
      select: { coreClinicId: true },
    })

    if (!clinic?.coreClinicId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const meetingId = parseInt(params.meetingId, 10)
    if (isNaN(meetingId)) {
      return NextResponse.json({ error: 'Invalid meeting ID' }, { status: 400 })
    }

    const res = await fetch(`${getCoreLiteBase()}/call-booking/${meetingId}`)
    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data?.message ?? 'Failed to fetch meeting status' }, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[call/meeting GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
