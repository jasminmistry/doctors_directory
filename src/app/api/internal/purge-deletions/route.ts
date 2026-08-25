import { NextRequest, NextResponse } from 'next/server'
import { purgeAllExpiredDeletions } from '@/lib/account-deletion'

export const dynamic = 'force-dynamic'

// Called once a day by server.js on the primary PM2 instance (loopback only) to hard-purge
// clinics/practitioners whose 7-day deletion grace period has elapsed. Also safe to trigger
// manually — it's idempotent, since a clinic/practitioner with no scheduledDeletionAt just
// won't match the query.
const SECRET = process.env.INTERNAL_CRON_SECRET ?? 'internal-cron-dev-secret-change-in-prod'

export async function POST(req: NextRequest) {
  if (req.headers.get('x-internal-secret') !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await purgeAllExpiredDeletions()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('Failed to purge expired account deletions:', error)
    return NextResponse.json({ error: 'Purge failed' }, { status: 500 })
  }
}
