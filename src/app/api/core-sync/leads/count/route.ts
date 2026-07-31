export const dynamic = 'force-dynamic'

import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.DIRECTORY_LINK_SECRET
  if (!secret) return false

  const provided = req.headers.get('x-directory-link-secret') ?? ''
  const providedBuf = Buffer.from(provided)
  const secretBuf = Buffer.from(secret)
  if (providedBuf.length !== secretBuf.length) return false

  return crypto.timingSafeEqual(providedBuf, secretBuf)
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const consentzClinicId = Number(new URL(req.url).searchParams.get('consentzClinicId') ?? '')
  if (!consentzClinicId) {
    return NextResponse.json({ error: 'consentzClinicId is required' }, { status: 400 })
  }

  const clinic = await prisma.clinic.findUnique({
    where: { coreClinicId: consentzClinicId },
    select: { id: true },
  })

  // coreClinicId is only ever set once a claim is approved and linked, so finding a
  // clinic here doubles as the "is this Core clinic linked to the Directory?" check —
  // Core uses `linked` to decide whether to show the Directory Prospects entry at all.
  if (!clinic) {
    return NextResponse.json({ count: 0, linked: false })
  }

  const count = await prisma.consultationLead.count({
    where: { clinicId: clinic.id, coreSynced: false },
  })

  return NextResponse.json({ count, linked: true })
}
