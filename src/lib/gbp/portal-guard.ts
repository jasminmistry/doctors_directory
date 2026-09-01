import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'

export type GbpPlan = 'free' | 'pay_per_lead' | 'subscription'

export const GBP_PAID_PLANS: GbpPlan[] = ['pay_per_lead', 'subscription']

interface GuardOk {
  ok: true
  clinicId: number
  claimId: number
  plan: GbpPlan
  idVerified: boolean
}
interface GuardFail {
  ok: false
  response: NextResponse
}

/**
 * Resolves the portal user to a claimed clinic and enforces a plan allow-list.
 * `requirePlans` defaults to the paid tiers (pay_per_lead + subscription).
 */
export async function guardGbpPortal(
  requirePlans: GbpPlan[] = GBP_PAID_PLANS,
): Promise<GuardOk | GuardFail> {
  const user = await getPortalUser()
  if (!user || user.entityType !== 'clinic' || !user.clinicId) {
    return { ok: false, response: NextResponse.json({ error: 'No claimed clinic found' }, { status: 403 }) }
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: user.clinicId },
    select: { claimedPlan: true, idVerified: true },
  })
  if (!clinic) {
    return { ok: false, response: NextResponse.json({ error: 'Clinic not found' }, { status: 404 }) }
  }

  const plan: GbpPlan = clinic.claimedPlan ?? 'free'
  if (!requirePlans.includes(plan)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Your plan does not include this feature', upgradeRequired: true },
        { status: 403 },
      ),
    }
  }

  return { ok: true, clinicId: user.clinicId, claimId: user.claimId, plan, idVerified: clinic.idVerified }
}
