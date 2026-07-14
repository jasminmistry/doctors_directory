import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { consentzApi, COOKIE_TOKEN } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const daySchema = z.object({
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  enabled: z.boolean(),
})

async function resolvePractitionerConsentzId(slug: string) {
  const claim = await prisma.claimRequest.findFirst({
    where: {
      practitionerSlug: slug,
      status: 'approved',
      consentzUserId: { not: null },
    },
    select: { consentzUserId: true },
    orderBy: { approvedAt: 'desc' },
  })
  return claim?.consentzUserId ?? null
}

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const consentzId = await resolvePractitionerConsentzId(params.slug)
  if (!consentzId) return NextResponse.json({ schedule: [], noConsentzId: true })

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_TOKEN)?.value

  try {
    const res = await consentzApi(`/register/practitioner/${consentzId}/schedule`, { sessionToken: token })
    if (res.status === 404) return NextResponse.json({ schedule: [] })
    if (!res.ok) return NextResponse.json({ schedule: [] })
    const data = await res.json()
    return NextResponse.json({ schedule: data.schedule ?? data ?? [] })
  } catch {
    return NextResponse.json({ schedule: [] })
  }
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const body = await req.json()
  const parsed = z.array(daySchema).min(1).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const consentzId = await resolvePractitionerConsentzId(params.slug)
  if (!consentzId) return NextResponse.json({ error: 'No Consentz ID for this practitioner' }, { status: 404 })

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_TOKEN)?.value

  try {
    const res = await consentzApi(`/register/practitioner/${consentzId}/schedule`, {
      method: 'POST',
      body: parsed.data,
      sessionToken: token,
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('[admin/practitioners/schedule] Core error:', res.status, errText)
      return NextResponse.json({ error: 'Failed to update schedule' }, { status: 502 })
    }
    const result = await res.json()
    return NextResponse.json({ success: true, schedule: result.schedule ?? result })
  } catch (err) {
    console.error('[admin/practitioners/schedule] error:', err)
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 })
  }
}
