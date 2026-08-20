import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        oauthAccounts: { select: { provider: true } },
        _count: { select: { bookings: true, chatSessions: true, leads: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    })

    return NextResponse.json({ patients })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('admin patients error', msg)
    return NextResponse.json({ error: 'Failed to load patients', detail: msg }, { status: 500 })
  }
}
