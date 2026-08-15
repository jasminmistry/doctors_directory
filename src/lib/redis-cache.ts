// src/lib/redis-cache.ts
// Redis cache utility — gracefully disabled when REDIS_URL is not set.
import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL

let _redis: Redis | null = null
let _connecting: Promise<void> | null = null

function getRedis(): Redis | null {
  if (!redisUrl) return null
  if (!_redis) {
    _redis = new Redis(redisUrl, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
    })
    _redis.on('error', (err) => {
      console.warn('[redis-cache] error:', err.message)
    })
    // lazyConnect only opens the socket on first command, but sendCommand() checks
    // writability synchronously — so the command that triggers the connect always
    // fires before the socket is ready and gets rejected outright (enableOfflineQueue
    // is false). Kick off + await the connect explicitly before issuing any command.
    _connecting = _redis.connect().catch((err) => {
      console.warn('[redis-cache] connect failed:', err.message)
    })
  }
  return _redis
}

async function getReadyRedis(): Promise<Redis | null> {
  const client = getRedis()
  if (!client) return null
  await _connecting
  return client
}

export async function getCache<T = any>(key: string): Promise<T | null> {
  const client = await getReadyRedis()
  if (!client) return null
  try {
    const data = await client.get(key)
    if (!data) return null
    return JSON.parse(data) as T
  } catch {
    return null
  }
}

export async function setCache(key: string, value: any, ttlSeconds = 3600): Promise<void> {
  const client = await getReadyRedis()
  if (!client) return
  try {
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch (err: any) {
    console.warn('[redis-cache] setCache failed:', err.message)
  }
}

export async function delCache(key: string): Promise<void> {
  const client = await getReadyRedis()
  if (!client) return
  try {
    await client.del(key)
  } catch (err: any) {
    console.warn('[redis-cache] delCache failed:', err.message)
  }
}
