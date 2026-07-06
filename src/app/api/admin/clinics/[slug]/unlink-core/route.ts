import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { invalidateQueryCache } from '@/lib/query-cache'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const clinic = await prisma.clinic.findUnique({
    where: { slug: params.slug },
    select: { id: true, coreClinicId: true, city: { select: { slug: true } } },
  })

  if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
  if (!clinic.coreClinicId) return NextResponse.json({ error: 'No Core account linked' }, { status: 400 })

  await prisma.clinic.update({
    where: { id: clinic.id },
    data: { coreClinicId: null, coreUnlinkRequestedAt: null },
  })

  invalidateQueryCache(`clinic:slug:${params.slug}`)
  if (clinic.city?.slug) {
    revalidatePath(`/clinics/${clinic.city.slug}/clinic/${params.slug}`)
  }

  return NextResponse.json({ ok: true })
}
