import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { guardGbpPortal } from '@/lib/gbp/portal-guard'
import { invalidateSearchCache } from '@/lib/search-cache'

export const dynamic = 'force-dynamic'

const PHOTO_CATEGORIES = [
  'COVER',
  'PROFILE',
  'LOGO',
  'EXTERIOR',
  'INTERIOR',
  'PRODUCT',
  'AT_WORK',
  'TEAMS',
  'ADDITIONAL',
] as const

const createSchema = z.object({
  url: z.string().url().max(2000),
  category: z.enum(PHOTO_CATEGORIES).default('ADDITIONAL'),
})

const patchSchema = z.object({
  photos: z.array(z.object({ id: z.number().int(), category: z.enum(PHOTO_CATEGORIES), sortOrder: z.number().int() })),
})

export async function GET() {
  const guard = await guardGbpPortal()
  if (!guard.ok) return guard.response
  const photos = await prisma.clinicPhoto.findMany({
    where: { clinicId: guard.clinicId },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  })
  return NextResponse.json({ photos })
}

export async function POST(request: Request) {
  const guard = await guardGbpPortal()
  if (!guard.ok) return guard.response

  const parsed = createSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const count = await prisma.clinicPhoto.count({ where: { clinicId: guard.clinicId } })
  if (count >= 50) return NextResponse.json({ error: 'Photo limit reached (50)' }, { status: 400 })

  const photo = await prisma.clinicPhoto.create({
    data: {
      clinicId: guard.clinicId,
      url: parsed.data.url,
      category: parsed.data.category,
      sortOrder: count,
      source: 'manual',
    },
  })

  await mirrorHeroPhoto(guard.clinicId, parsed.data.category, parsed.data.url)
  return NextResponse.json({ photo }, { status: 201 })
}

export async function PATCH(request: Request) {
  const guard = await guardGbpPortal()
  if (!guard.ok) return guard.response

  const parsed = patchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const owned = await prisma.clinicPhoto.findMany({
    where: { clinicId: guard.clinicId },
    select: { id: true },
  })
  const ownedIds = new Set(owned.map((p) => p.id))

  await prisma.$transaction(
    parsed.data.photos
      .filter((p) => ownedIds.has(p.id))
      .map((p) =>
        prisma.clinicPhoto.update({
          where: { id: p.id },
          data: { category: p.category, sortOrder: p.sortOrder },
        }),
      ),
  )

  for (const p of parsed.data.photos) {
    if (!ownedIds.has(p.id)) continue
    if (p.category === 'PROFILE' || p.category === 'COVER') {
      const row = await prisma.clinicPhoto.findUnique({ where: { id: p.id }, select: { url: true } })
      if (row) await mirrorHeroPhoto(guard.clinicId, p.category, row.url)
    }
  }

  await invalidateSearchCache()
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const guard = await guardGbpPortal()
  if (!guard.ok) return guard.response

  const id = Number(new URL(request.url).searchParams.get('id'))
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const result = await prisma.clinicPhoto.deleteMany({ where: { id, clinicId: guard.clinicId } })
  if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}

async function mirrorHeroPhoto(clinicId: number, category: string, url: string) {
  if (category === 'PROFILE') {
    await prisma.clinic.update({ where: { id: clinicId }, data: { image: url } })
  } else if (category === 'COVER') {
    await prisma.clinic.update({ where: { id: clinicId }, data: { coverImage: url } })
  }
}
