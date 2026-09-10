import { prisma } from '@/lib/db'
import { gbpFetch } from '@/lib/gbp/client'
import { GBP_V4_BASE, GBP_MOCK } from '@/lib/gbp/config'

// Photo upload to GBP via the v4 Media API. Uses a bytes upload (startUpload -> PUT bytes
// -> media.create with dataRef) so our upload host does not need to be publicly reachable.
// Additive only — photos are never deleted from Google in v1.

const CATEGORY_MAP: Record<string, string> = {
  COVER: 'COVER',
  PROFILE: 'PROFILE',
  LOGO: 'LOGO',
  EXTERIOR: 'EXTERIOR',
  INTERIOR: 'INTERIOR',
  PRODUCT: 'PRODUCT',
  AT_WORK: 'AT_WORK',
  TEAMS: 'TEAMS',
  ADDITIONAL: 'ADDITIONAL',
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

function absoluteUrl(url: string): string {
  if (url.startsWith('http')) return url
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

export async function uploadPendingPhotos(
  connectionId: number,
  locationV4Name: string,
  clinicId: number,
): Promise<{ uploaded: number; failed: number }> {
  const pending = await prisma.clinicPhoto.findMany({
    where: { clinicId, gbpMediaName: null },
    orderBy: { sortOrder: 'asc' },
    take: 20,
  })

  let uploaded = 0
  let failed = 0

  for (const photo of pending) {
    try {
      if (GBP_MOCK) {
        await prisma.clinicPhoto.update({
          where: { id: photo.id },
          data: { gbpMediaName: `${locationV4Name}/media/mock-${photo.id}`, gbpState: 'PROCESSING', uploadError: null },
        })
        uploaded++
        continue
      }

      // 1. start a resumable upload
      const start = (await gbpFetch(
        connectionId,
        `${GBP_V4_BASE}/${locationV4Name}/media:startUpload`,
        { method: 'POST', body: JSON.stringify({}) },
      )) as { resourceName: string }

      // 2. PUT the bytes
      const imgRes = await fetch(absoluteUrl(photo.url))
      if (!imgRes.ok) throw new Error(`source image fetch ${imgRes.status}`)
      const bytes = Buffer.from(await imgRes.arrayBuffer())
      const putRes = await fetch(
        `https://mybusiness.googleapis.com/upload/v1/media/${start.resourceName}?upload_type=media`,
        { method: 'POST', body: bytes },
      )
      if (!putRes.ok) throw new Error(`bytes upload ${putRes.status}`)

      // 3. create the media item referencing the upload
      const created = (await gbpFetch(connectionId, `${GBP_V4_BASE}/${locationV4Name}/media`, {
        method: 'POST',
        body: JSON.stringify({
          mediaFormat: 'PHOTO',
          locationAssociation: { category: CATEGORY_MAP[photo.category] ?? 'ADDITIONAL' },
          dataRef: { resourceName: start.resourceName },
        }),
      })) as { name: string; state?: string }

      await prisma.clinicPhoto.update({
        where: { id: photo.id },
        data: { gbpMediaName: created.name, gbpState: created.state ?? 'PROCESSING', uploadError: null },
      })
      uploaded++
    } catch (err) {
      failed++
      await prisma.clinicPhoto.update({
        where: { id: photo.id },
        data: { uploadError: (err as Error).message.slice(0, 500) },
      })
    }
  }

  return { uploaded, failed }
}
