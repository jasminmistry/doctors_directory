import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { guardGbpPortal } from '@/lib/gbp/portal-guard'
import { decryptToken } from '@/lib/gbp/crypto'
import { revokeToken } from '@/lib/gbp/oauth'
import { invalidateSearchCache } from '@/lib/search-cache'

export const dynamic = 'force-dynamic'

export async function POST() {
  const guard = await guardGbpPortal()
  if (!guard.ok) return guard.response

  const conn = await prisma.gbpConnection.findUnique({ where: { clinicId: guard.clinicId } })
  if (!conn) return NextResponse.json({ ok: true })

  if (conn.refreshTokenCipher && conn.refreshTokenIv && conn.refreshTokenTag) {
    try {
      await revokeToken(
        decryptToken({ cipher: conn.refreshTokenCipher, iv: conn.refreshTokenIv, tag: conn.refreshTokenTag }),
      )
    } catch (err) {
      console.error('[gbp/disconnect] revoke failed:', err)
    }
  }

  await prisma.$transaction([
    prisma.gbpConnection.delete({ where: { id: conn.id } }),
    prisma.clinic.update({ where: { id: guard.clinicId }, data: { gbpVerified: false } }),
  ])

  await invalidateSearchCache()
  revalidatePath('/portal/clinic/google')
  return NextResponse.json({ ok: true })
}
