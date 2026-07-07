import fs from 'fs/promises'
import path from 'path'
import NodeCache from 'node-cache'
import { jsonCache } from '@/lib/json-cache'

const DATA_DIR = path.join(process.cwd(), 'public')

// Cache for async readJsonFile calls (admin API routes)
const fileCache = new NodeCache({ stdTTL: 3600, useClones: false })

export async function readJsonFile(filename: string): Promise<any> {
  const cached = fileCache.get(filename)
  if (cached !== undefined) return cached

  const filePath = path.join(DATA_DIR, filename)
  const content = await fs.readFile(filePath, 'utf-8')
  const parsed = JSON.parse(content)
  fileCache.set(filename, parsed)
  return parsed
}

/** Called by server.js at startup to populate the cache before first request. */
export function prewarmFile(filename: string, data: unknown): void {
  fileCache.set(filename, data)
  jsonCache.set(filename, data)
}

export async function writeJsonFile(filename: string, data: any): Promise<void> {
  const filePath = path.join(DATA_DIR, filename)
  const content = JSON.stringify(data, null, 2)
  await fs.writeFile(filePath, content, 'utf-8')
  // Invalidate both caches so next read picks up the new data
  fileCache.del(filename)
  jsonCache.del(filename)
}
