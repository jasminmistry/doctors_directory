import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cancelScheduledDeletion } from '@/lib/account-deletion'

export async function POST(req: NextRequest, { params }: { params: { type: string; slug: string } }) {
  if (params.type !== 'clinic' && params.type !== 'practitioner') {
    return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 })
  }

  const entity =
    params.type === 'clinic'
      ? await prisma.clinic.findUnique({ where: { slug: params.slug }, select: { id: true } })
      : await prisma.practitioner.findUnique({ where: { slug: params.slug }, select: { id: true } })

  if (!entity) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await cancelScheduledDeletion(params.type, entity.id)
  return NextResponse.json({ ok: true })
}
