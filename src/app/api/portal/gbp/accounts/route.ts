import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { guardGbpPortal } from '@/lib/gbp/portal-guard'
import { gbpFetch, GbpReauthError } from '@/lib/gbp/client'
import { GBP_ACCOUNT_MGMT_BASE } from '@/lib/gbp/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await guardGbpPortal()
  if (!guard.ok) return guard.response

  const conn = await prisma.gbpConnection.findUnique({ where: { clinicId: guard.clinicId } })
  if (!conn) return NextResponse.json({ error: 'Not connected' }, { status: 409 })

  try {
    const data = (await gbpFetch(conn.id, `${GBP_ACCOUNT_MGMT_BASE}/accounts`)) as {
      accounts?: Array<{ name: string; accountName?: string; type?: string }>
    }
    return NextResponse.json({ accounts: data.accounts ?? [] })
  } catch (err) {
    if (err instanceof GbpReauthError) {
      return NextResponse.json({ error: 'reauth_required' }, { status: 409 })
    }
    console.error('[gbp/accounts] failed:', err)
    return NextResponse.json({ error: 'Failed to load Google accounts' }, { status: 502 })
  }
}
