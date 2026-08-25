import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { purgeClinicDeletion, purgePractitionerDeletion } from '@/lib/account-deletion'

export async function POST(req: NextRequest, { params }: { params: { type: string; slug: string } }) {
  if (params.type !== 'clinic' && params.type !== 'practitioner') {
    return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 })
  }

  if (params.type === 'clinic') {
    const clinic = await prisma.clinic.findUnique({ where: { slug: params.slug }, select: { id: true } })
    if (!clinic) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await purgeClinicDeletion(clinic.id)
  } else {
    const practitioner = await prisma.practitioner.findUnique({ where: { slug: params.slug }, select: { id: true } })
    if (!practitioner) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await purgePractitionerDeletion(practitioner.id)
  }

  return NextResponse.json({ ok: true })
}
