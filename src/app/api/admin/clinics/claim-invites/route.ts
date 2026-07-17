import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { sendClaimInviteEmail } from '@/lib/email'
import { signUnsubscribeToken } from '@/lib/campaign-unsubscribe'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

const ELIGIBLE_WHERE = {
  claimed: false,
  isHidden: false,
  campaignOptedOut: false,
  name: { not: null },
  email: { not: null },
} as const

export async function GET() {
  const clinics = await prisma.clinic.findMany({
    where: ELIGIBLE_WHERE,
    select: {
      id: true, slug: true, name: true, email: true, campaignEmailedAt: true,
      city: { select: { name: true } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({
    clinics: clinics.map(({ city, ...c }) => ({ ...c, cityName: city?.name ?? null })),
  })
}

const sendSchema = z.object({
  clinicIds: z.array(z.number().int()).min(1),
})

export async function POST(req: Request) {
  const parsed = sendSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // Re-verify eligibility server-side — never trust the client's selection blindly
  // (a clinic may have been claimed/opted-out since the admin loaded the list).
  const clinics = await prisma.clinic.findMany({
    where: { ...ELIGIBLE_WHERE, id: { in: parsed.data.clinicIds } },
    select: { id: true, slug: true, name: true, email: true },
  })
  const skipped = parsed.data.clinicIds.length - clinics.length

  let sent = 0
  let failed = 0

  for (const clinic of clinics) {
    const claimUrl = `${BASE_URL}/directory/claim/${clinic.slug}`
    const manageUrl = `${BASE_URL}/directory/api/unsubscribe?token=${signUnsubscribeToken(clinic.id)}`

    try {
      await sendClaimInviteEmail({ to: clinic.email!, clinicName: clinic.name!, claimUrl, manageUrl })
      await prisma.clinic.update({ where: { id: clinic.id }, data: { campaignEmailedAt: new Date() } })
      sent++
    } catch (err) {
      failed++
      console.error(`[admin/clinics/claim-invites] send failed for clinic ${clinic.id}:`, err)
    }
  }

  return NextResponse.json({ sent, failed, skipped })
}
