export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'
import { COOKIE_ACTIVE_CLINIC, COOKIE_USERNAME, COOKIE_PATH } from '@/lib/auth'

const schema = z.object({
  clinicId: z.number().int().positive(),
})

export async function POST(req: NextRequest) {
  try {
    const user = await getPortalUser()
    if (!user || user.entityType !== 'clinic') {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const { clinicId } = parsed.data

    const cookieStore = await cookies()
    const username = cookieStore.get(COOKIE_USERNAME)?.value
    if (!username) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const owned = await prisma.claimRequest.findFirst({
      where: {
        clinicId,
        entityType: 'clinic',
        status: 'approved',
        consentzUsername: username,
      },
      select: { id: true },
    })
    if (!owned) {
      return NextResponse.json({ error: 'Clinic not found for this account' }, { status: 403 })
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_ACTIVE_CLINIC, String(clinicId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: COOKIE_PATH,
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (err) {
    console.error('[portal/switch-clinic]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
