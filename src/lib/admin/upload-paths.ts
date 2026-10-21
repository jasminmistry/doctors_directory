import path from 'path'

// Runtime-only write targets (the Docker uploads volume), never build inputs. Keep
// Turbopack from file-tracing them; a dynamic path here otherwise pulls the whole
// project into the standalone output.
export function getUploadImagesDir(): string {
  if (process.env.UPLOADS_DIR) {
    return path.resolve(/* turbopackIgnore: true */ process.env.UPLOADS_DIR)
  }
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), 'uploads', 'images')
}

export function getPublicUploadsDir(): string {
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), 'public', 'images', 'uploads')
}

export function toPublicUploadUrl(filename: string): string {
  return `/directory/images/uploads/${filename}`
}

export function normalizeImageExt(filename: string): string {
  const raw = filename.split('.').pop()?.toLowerCase() ?? 'jpg'
  if (raw === 'jpeg') return 'jpg'
  if (['jpg', 'png', 'webp', 'gif', 'svg'].includes(raw)) return raw
  return 'jpg'
}

export const UPLOAD_URL_PREFIX = '/directory/images/uploads/'
