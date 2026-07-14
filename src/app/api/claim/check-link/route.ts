export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/claim/check-link?consentzClinicId=N
 *
 * Called by ConsentzLive to check whether a Consentz clinic is already linked
 * to a directory listing. No authentication required — consentzClinicId is not
 * sensitive (it's an internal numeric ID) and the response reveals no PII.
 *
 * Response:
 *   { linked: false, status: 'not_linked' }
 *   { linked: true,  status: 'pending_approval' }
 *   { linked: true,  status: 'approved' }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const raw = searchParams.get('consentzClinicId')
  const consentzClinicId = raw ? parseInt(raw, 10) : NaN

  if (!consentzClinicId || isNaN(consentzClinicId)) {
    return NextResponse.json({ error: 'consentzClinicId is required' }, { status: 400 })
  }

  try {
    const claim = await prisma.claimRequest.findFirst({
      where: {
        consentzClinicId,
        status: { in: ['pending_approval', 'approved'] },
      },
      orderBy: { createdAt: 'desc' },
      select: { status: true },
    })

    if (!claim) {
      return NextResponse.json({ linked: false, status: 'not_linked' })
    }

    return NextResponse.json({ linked: true, status: claim.status })
  } catch (error) {
    console.error('check-link error:', error)
    return NextResponse.json({ error: 'Failed to check link status' }, { status: 500 })
  }
}
