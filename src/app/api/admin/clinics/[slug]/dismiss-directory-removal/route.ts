import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const clinic = await prisma.clinic.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  })

  if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })

  await prisma.clinic.update({
    where: { id: clinic.id },
    data: { directoryRemovalRequestedAt: null },
  })

  return NextResponse.json({ ok: true })
}
