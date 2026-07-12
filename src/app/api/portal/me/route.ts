import { NextResponse } from 'next/server'
import { getPortalUser } from '@/lib/portal'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getPortalUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({
    entityType: user.entityType,
    entityName: user.entityName,
    entitySlug: user.entitySlug,
    claimerName: user.claimerName,
    claimerEmail: user.claimerEmail,
  })
}
