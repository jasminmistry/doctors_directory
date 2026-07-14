export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/claim/listing-preview?slug=...&type=clinic|practitioner
 *
 * Returns a minimal public summary of a clinic or practitioner so the
 * Consentz directory-link page can show the user what they're linking to.
 * No authentication required.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')?.trim()
  const type = searchParams.get('type')?.trim()

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  }

  try {
    if (type === 'practitioner') {
      const p = await prisma.practitioner.findUnique({
        where: { slug },
        select: {
          displayName: true,
          slug: true,
          claimed: true,
          specialty: true,
        },
      })

      if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      return NextResponse.json({
        name:     p.displayName ?? slug,
        address:  '',
        category: p.specialty ?? '',
        claimed:  p.claimed,
        type:     'practitioner',
      })
    }

    const c = await prisma.clinic.findUnique({
      where: { slug },
      select: {
        name: true,
        slug: true,
        claimed: true,
        category: true,
        gmapsAddress: true,
      },
    })

    if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      name:     c.name ?? slug,
      address:  c.gmapsAddress ?? '',
      category: c.category ?? '',
      claimed:  c.claimed,
      type:     'clinic',
    })
  } catch (error) {
    console.error('Listing preview error:', error)
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 })
  }
}
