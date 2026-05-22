import { NextResponse } from 'next/server'
import { COOKIE_USERNAME, COOKIE_ROLE, COOKIE_OPTS } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const claims = await prisma.claimRequest.findMany({
    where: { status: 'approved', consentzUsername: { not: null } },
    select: {
      id: true,
      consentzUsername: true,
      entityType: true,
      claimerName: true,
      clinicSlug: true,
      practitionerSlug: true,
    },
    orderBy: { approvedAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(
    claims.map((c) => ({
      username: c.consentzUsername,
      entityType: c.entityType,
      name: c.claimerName,
      slug: c.entityType === 'clinic' ? c.clinicSlug : c.practitionerSlug,
    }))
  )
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { username } = await request.json().catch(() => ({}))

  let targetUsername = username as string | undefined

  if (!targetUsername) {
    const claim = await prisma.claimRequest.findFirst({
      where: { status: 'approved', consentzUsername: { not: null } },
      select: { consentzUsername: true },
      orderBy: { approvedAt: 'desc' },
    })
    if (!claim?.consentzUsername) {
      return NextResponse.json({ error: 'No approved claims found in database' }, { status: 404 })
    }
    targetUsername = claim.consentzUsername
  }

  const response = NextResponse.json({ success: true, username: targetUsername })
  response.cookies.set(COOKIE_USERNAME, targetUsername, COOKIE_OPTS)
  response.cookies.set(COOKIE_ROLE, 'portal', COOKIE_OPTS)
  return response
}
