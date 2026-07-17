import path from 'path'

export function getUploadImagesDir(): string {
  if (process.env.UPLOADS_DIR) {
    return path.resolve(process.env.UPLOADS_DIR)
  }
  return path.resolve(process.cwd(), 'uploads', 'images')
}

export function getPublicUploadsDir(): string {
  return path.resolve(process.cwd(), 'public', 'images', 'uploads')
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
