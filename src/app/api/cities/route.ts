export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      select: { name: true, slug: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(cities)
  } catch (error) {
    console.error('Cities list error:', error)
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 })
  }
}
