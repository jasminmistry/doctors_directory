import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { guardGbpPortal, GBP_PAID_PLANS } from '@/lib/gbp/portal-guard'
import { GBP_ENABLED, isGbpOAuthConfigured } from '@/lib/gbp/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await guardGbpPortal(GBP_PAID_PLANS)
  if (!guard.ok) return guard.response

  const conn = await prisma.gbpConnection.findUnique({
    where: { clinicId: guard.clinicId },
    select: {
      status: true,
      googleEmail: true,
      accountName: true,
      locationName: true,
      placeId: true,
      newReviewUri: true,
      lastPulledAt: true,
      lastSyncedAt: true,
      lastSyncError: true,
      syncFieldState: true,
    },
  })

  return NextResponse.json({
    available: GBP_ENABLED && isGbpOAuthConfigured(),
    plan: guard.plan,
    canPush: guard.plan === 'subscription',
    connection: conn ?? null,
  })
}
