import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { guardGbpPortal } from '@/lib/gbp/portal-guard'
import { GbpReauthError } from '@/lib/gbp/client'
import { pullFromGbp } from '@/lib/gbp/pull'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const guard = await guardGbpPortal()
  if (!guard.ok) return guard.response
  if (!guard.idVerified) {
    return NextResponse.json({ error: 'Profile editing requires ID verification' }, { status: 403 })
  }

  const apply = req.nextUrl.searchParams.get('apply') === '1'
  const overwrite = req.nextUrl.searchParams.get('overwrite') === '1'

  try {
    const result = await pullFromGbp(guard.clinicId, { apply, overwrite })
    if (result.applied) revalidatePath('/portal/clinic/google')
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof GbpReauthError) return NextResponse.json({ error: 'reauth_required' }, { status: 409 })
    console.error('[gbp/pull] failed:', err)
    return NextResponse.json({ error: 'Failed to import from Google' }, { status: 502 })
  }
}
