/**
 * Shared in-memory JSON file cache.
 *
 * Wraps fs.readFileSync with a NodeCache instance so large JSON files
 * (practitioners, products, etc. — some 40MB+) are read from disk only once
 * per worker and served from RAM on subsequent requests.
 *
 * No TTL: entries are invalidated explicitly by writeJsonFile in
 * @/lib/admin/file-utils when an admin write occurs. A time-based TTL would
 * cause these large files to be silently evicted and then re-read + re-parsed
 * *synchronously* on whichever request next happens to touch them — blocking
 * the whole worker's event loop for the duration. Explicit invalidation gives
 * us freshness without that recurring latency spike.
 */
import fs from 'fs'
import path from 'path'
import NodeCache from 'node-cache'

const DATA_DIR = path.join(process.cwd(), 'public')

// useClones: false — avoids deep-cloning on every get (safe for read-only data)
export const jsonCache = new NodeCache({ stdTTL: 0, useClones: false })

export function readJsonFileSync<T = any>(filename: string): T {
  const cached = jsonCache.get<T>(filename)
  if (cached !== undefined) return cached

  const filePath = path.join(DATA_DIR, filename)
  const parsed: T = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  jsonCache.set(filename, parsed)
  return parsed
}
