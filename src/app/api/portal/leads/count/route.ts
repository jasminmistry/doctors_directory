import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'

export async function GET() {
  const user = await getPortalUser()
  if (!user || !user.clinicId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const count = await prisma.consultationLead.count({
    where: { clinicId: user.clinicId, seenAt: null },
  })

  return NextResponse.json({ new: count })
}
