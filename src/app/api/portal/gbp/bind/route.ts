import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { guardGbpPortal } from '@/lib/gbp/portal-guard'
import { GbpReauthError } from '@/lib/gbp/client'
import { fetchGbpLocation, pullFromGbp } from '@/lib/gbp/pull'
import { invalidateSearchCache } from '@/lib/search-cache'

export const dynamic = 'force-dynamic'

const schema = z.object({
  accountName: z.string().regex(/^accounts\/[\w-]+$/),
  locationName: z.string().regex(/^locations\/[\w-]+$/),
})

export async function POST(request: Request) {
  const guard = await guardGbpPortal()
  if (!guard.ok) return guard.response

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  const { accountName, locationName } = parsed.data

  const conn = await prisma.gbpConnection.findUnique({ where: { clinicId: guard.clinicId } })
  if (!conn) return NextResponse.json({ error: 'Not connected' }, { status: 409 })

  try {
    const location = await fetchGbpLocation(conn.id, locationName)
    const placeId = location.metadata?.placeId ?? null

    await prisma.gbpConnection.update({
      where: { id: conn.id },
      data: {
        accountName,
        locationName,
        locationV4Name: `${accountName}/${locationName}`,
        placeId,
        newReviewUri: location.metadata?.newReviewUri ?? null,
        mapsUri: location.metadata?.mapsUri ?? null,
        status: 'connected',
      },
    })

    await prisma.clinic.update({
      where: { id: guard.clinicId },
      data: {
        gbpVerified: true,
        gbpMatch: true,
        ...(placeId ? { placeId } : {}),
      },
    })

    // Prefill empty directory fields from Google.
    const { diff } = await pullFromGbp(guard.clinicId, { apply: true, overwrite: false })

    await invalidateSearchCache()
    revalidatePath('/portal/clinic/google')
    return NextResponse.json({ ok: true, locationTitle: location.title ?? locationName, diff })
  } catch (err) {
    if (err instanceof GbpReauthError) return NextResponse.json({ error: 'reauth_required' }, { status: 409 })
    console.error('[gbp/bind] failed:', err)
    return NextResponse.json({ error: 'Failed to bind location' }, { status: 502 })
  }
}
