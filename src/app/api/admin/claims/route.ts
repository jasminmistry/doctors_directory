import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get('status') ?? undefined

    const claims = await prisma.claimRequest.findMany({
      where: status ? { status: status as never } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        clinic: { select: { name: true, slug: true, gmapsAddress: true, category: true } },
        practitioner: { select: { displayName: true, slug: true, specialty: true } },
      },
    })

    return NextResponse.json(claims)
  } catch (error) {
    console.error('Admin claims list error:', error)
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 })
  }
}
