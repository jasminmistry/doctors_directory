import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const data = await request.json()
    const submittedData = JSON.stringify({ ...data, status: 'pending' })

    const allPending = await prisma.pendingPractitioner.findMany()
    const existing = allPending.find((r) => {
      try { return JSON.parse(r.submittedData).slug === params.slug } catch { return false }
    })

    if (existing) {
      await prisma.pendingPractitioner.update({
        where: { id: existing.id },
        data: { submittedData, status: 'pending' },
      })
    } else {
      await prisma.pendingPractitioner.create({
        data: { submittedData, status: 'pending' },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update practitioner:', error)
    return NextResponse.json({ error: 'Failed to update practitioner' }, { status: 500 })
  }
}