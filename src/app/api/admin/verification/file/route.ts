import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join, normalize, resolve } from 'path'

const UPLOAD_ROOT = resolve(process.cwd(), 'uploads', 'verification')

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get('path')
  if (!filePath) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 })
  }

  // Prevent path traversal — resolved path must stay inside UPLOAD_ROOT
  const resolved = resolve(UPLOAD_ROOT, normalize(filePath))
  if (!resolved.startsWith(UPLOAD_ROOT + '/') && resolved !== UPLOAD_ROOT) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const buffer = await readFile(resolved)
    const ext = resolved.split('.').pop()?.toLowerCase() ?? ''
    const contentType =
      ext === 'pdf' ? 'application/pdf' :
      ext === 'png' ? 'image/png' :
      ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
      ext === 'webp' ? 'image/webp' :
      'application/octet-stream'

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${resolved.split('/').pop()}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
