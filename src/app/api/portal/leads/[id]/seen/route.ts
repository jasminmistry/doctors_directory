export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getPortalUser()
  if (!user || !user.clinicId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const leadId = parseInt(params.id, 10)
  if (isNaN(leadId)) {
    return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 })
  }

  await prisma.consultationLead.updateMany({
    where: { id: leadId, clinicId: user.clinicId, seenAt: null },
    data: { seenAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
