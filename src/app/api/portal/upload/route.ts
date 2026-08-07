import { NextRequest, NextResponse } from 'next/server'
import { mkdir, realpath, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { getPortalUser } from '@/lib/portal'
import {
  getPublicUploadsDir,
  getUploadImagesDir,
  normalizeImageExt,
  toPublicUploadUrl,
} from '@/lib/admin/upload-paths'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const MAX_BYTES = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    const user = await getPortalUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const form = await req.formData()
    const file = form.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP, GIF, and SVG files are allowed' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: 'File exceeds 5 MB limit' }, { status: 400 })
    }

    const ext = normalizeImageExt(file.name)
    const filename = `${randomUUID()}.${ext}`
    const uploadDir = getUploadImagesDir()
    const dest = path.join(uploadDir, filename)

    await mkdir(uploadDir, { recursive: true })
    await writeFile(dest, buffer)

    const publicDir = getPublicUploadsDir()
    try {
      const uploadReal = await realpath(uploadDir).catch(() => uploadDir)
      const publicReal = await realpath(publicDir).catch(() => publicDir)
      if (uploadReal !== publicReal) {
        await mkdir(publicDir, { recursive: true })
        await writeFile(path.join(publicDir, filename), buffer)
      }
    } catch (mirrorErr) {
      console.error('[portal/upload] public mirror failed:', mirrorErr)
    }

    return NextResponse.json({ url: toPublicUploadUrl(filename) })
  } catch (err) {
    console.error('[portal/upload] error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
