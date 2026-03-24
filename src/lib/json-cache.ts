/**
 * Shared in-memory JSON file cache.
 *
 * Wraps fs.readFileSync with a NodeCache instance so large JSON files
 * (practitioners, products, etc.) are read from disk only once per worker
 * and served from RAM on subsequent requests.
 *
 * TTL: 1 hour. Cache is automatically invalidated by writeJsonFile in
 * @/lib/admin/file-utils when an admin write occurs.
 */
import fs from 'fs'
import path from 'path'
import NodeCache from 'node-cache'

const DATA_DIR = path.join(process.cwd(), 'public')

// useClones: false — avoids deep-cloning on every get (safe for read-only data)
export const jsonCache = new NodeCache({ stdTTL: 3600, useClones: false })

export function readJsonFileSync<T = any>(filename: string): T {
  const cached = jsonCache.get<T>(filename)
  if (cached !== undefined) return cached

  const filePath = path.join(DATA_DIR, filename)
  const parsed: T = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  jsonCache.set(filename, parsed)
  return parsed
}
