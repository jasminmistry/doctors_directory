import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const clinic = await prisma.clinic.findUnique({
    where: { slug: params.slug },
    select: { id: true, coreClinicId: true },
  })

  if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
  if (!clinic.coreClinicId) return NextResponse.json({ error: 'No Core account linked' }, { status: 400 })

  await prisma.clinic.update({
    where: { id: clinic.id },
    data: { coreClinicId: null, coreUnlinkRequestedAt: null },
  })

  return NextResponse.json({ ok: true })
}
