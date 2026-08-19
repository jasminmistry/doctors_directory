import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const leads = await prisma.consultationLead.findMany({
      include: { clinic: { select: { slug: true, name: true, claimedPlan: true } } },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    })

    return NextResponse.json({ leads })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('admin leads error', msg)
    return NextResponse.json({ error: 'Failed to load leads', detail: msg }, { status: 500 })
  }
}
