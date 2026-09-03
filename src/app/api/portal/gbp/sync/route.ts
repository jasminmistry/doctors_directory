import { NextResponse } from 'next/server'
import { z } from 'zod'
import { guardGbpPortal } from '@/lib/gbp/portal-guard'
import { GbpReauthError } from '@/lib/gbp/client'
import { syncClinicToGbp } from '@/lib/gbp/sync'

export const dynamic = 'force-dynamic'

const schema = z.object({ confirmNameAddress: z.boolean().optional() })

// Write to Google — Verified Subscription plan only.
export async function POST(request: Request) {
  const guard = await guardGbpPortal(['subscription'])
  if (!guard.ok) return guard.response

  const parsed = schema.safeParse(await request.json().catch(() => ({})))
  const confirmNameAddress = parsed.success ? !!parsed.data.confirmNameAddress : false

  try {
    const result = await syncClinicToGbp(guard.clinicId, { confirmNameAddress })
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof GbpReauthError) return NextResponse.json({ error: 'reauth_required' }, { status: 409 })
    console.error('[gbp/sync] failed:', err)
    return NextResponse.json({ error: (err as Error).message || 'Sync failed' }, { status: 502 })
  }
}
