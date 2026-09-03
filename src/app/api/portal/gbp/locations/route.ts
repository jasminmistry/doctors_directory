import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { guardGbpPortal } from '@/lib/gbp/portal-guard'
import { gbpFetch, GbpReauthError } from '@/lib/gbp/client'
import { GBP_BUSINESS_INFO_BASE } from '@/lib/gbp/config'

export const dynamic = 'force-dynamic'

const READ_MASK = 'name,title,storefrontAddress,phoneNumbers,metadata'

export async function GET(req: NextRequest) {
  const guard = await guardGbpPortal()
  if (!guard.ok) return guard.response

  const account = req.nextUrl.searchParams.get('account')
  if (!account || !/^accounts\/[\w-]+$/.test(account)) {
    return NextResponse.json({ error: 'Invalid account' }, { status: 400 })
  }

  const conn = await prisma.gbpConnection.findUnique({ where: { clinicId: guard.clinicId } })
  if (!conn) return NextResponse.json({ error: 'Not connected' }, { status: 409 })

  try {
    const url = `${GBP_BUSINESS_INFO_BASE}/${account}/locations?readMask=${encodeURIComponent(READ_MASK)}&pageSize=100`
    const data = (await gbpFetch(conn.id, url)) as {
      locations?: Array<{
        name: string
        title?: string
        storefrontAddress?: { addressLines?: string[]; locality?: string }
        metadata?: { placeId?: string }
      }>
    }
    return NextResponse.json({ locations: data.locations ?? [] })
  } catch (err) {
    if (err instanceof GbpReauthError) return NextResponse.json({ error: 'reauth_required' }, { status: 409 })
    console.error('[gbp/locations] failed:', err)
    return NextResponse.json({ error: 'Failed to load locations' }, { status: 502 })
  }
}
