'use strict';

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'public');

const JSON_FILES_TO_PREWARM = [
  'clinics_processed_new_data.json',
  'derms_processed_new_5403.json',
  'products_processed_new.json',
  'treatments.json',
  'city_data_processed.json',
];

// ---------------------------------------------------------------------------
// Optional Redis client for cross-worker prewarm sharing.
// Primary worker reads from disk → writes to Redis.
// Non-primary workers read from Redis → skip disk I/O.
// Falls back silently to disk if REDIS_URL is unset or Redis is unavailable.
// ---------------------------------------------------------------------------
const REDIS_URL = process.env.REDIS_URL;
const REDIS_KEY_PREFIX = 'prewarm:json:';
const REDIS_TTL_SECONDS = 7200; // 2 h — well beyond the 1-h NodeCache TTL

let redisClient = null;
if (REDIS_URL) {
  try {
    const Redis = require('ioredis');
    redisClient = new Redis(REDIS_URL, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
    });
    redisClient.on('error', (err) => {
      console.warn('[prewarm] Redis error:', err.message);
    });
  } catch (err) {
    console.warn('[prewarm] ioredis not available:', err.message);
  }
}

const port = parseInt(process.env.PORT || '3000', 10);

// Stagger startup so workers don't all hit disk simultaneously.
const instanceId = parseInt(process.env.NODE_APP_INSTANCE || '0', 10);
const startDelay = instanceId * 2000; // 2 s gap between each worker
const isPrimary = instanceId === 0;

async function prewarmJsonCache() {
  const results = await Promise.allSettled(
    JSON_FILES_TO_PREWARM.map(async (filename) => {
      let parsed = null;
      let source = 'disk';

      // Non-primary workers try Redis first — primary has already written there.
      if (!isPrimary && redisClient) {
        try {
          const raw = await redisClient.get(REDIS_KEY_PREFIX + filename);
          if (raw) {
            parsed = JSON.parse(raw);
            source = 'redis';
          }
        } catch (err) {
          console.warn(`[prewarm] Redis get failed (${filename}):`, err.message);
        }
      }

      // Fall back to disk if Redis miss or this is the primary instance.
      if (!parsed) {
        const filePath = path.join(DATA_DIR, filename);
        const raw = await fs.promises.readFile(filePath, 'utf-8');
        parsed = JSON.parse(raw);
      }

      // Primary: write to Redis so other workers can read from there.
      if (isPrimary && redisClient) {
        try {
          await redisClient.set(
            REDIS_KEY_PREFIX + filename,
            JSON.stringify(parsed),
            'EX',
            REDIS_TTL_SECONDS
          );
        } catch (err) {
          console.warn(`[prewarm] Redis set failed (${filename}):`, err.message);
        }
      }

      // Populate in-process NodeCache instances used by Next.js module code.
      try {
        const { jsonCache } = require('./src/lib/json-cache');
        if (!jsonCache.has(filename)) jsonCache.set(filename, parsed);
      } catch (_) { /* module not yet resolvable — skip */ }

      try {
        const fileUtils = require('./src/lib/admin/file-utils');
        if (typeof fileUtils.prewarmFile === 'function') {
          fileUtils.prewarmFile(filename, parsed);
        }
      } catch (_) { /* module not yet resolvable — skip */ }

      return { filename, source };
    })
  );

  const loaded = results.filter(r => r.status === 'fulfilled');
  const failed = results.filter(r => r.status === 'rejected');
  const fromRedis = loaded.filter(r => r.value.source === 'redis').length;
  const fromDisk = loaded.filter(r => r.value.source === 'disk').length;
  console.log(
    `[prewarm] instance=${instanceId} loaded ${loaded.length}/${JSON_FILES_TO_PREWARM.length} files` +
    ` (disk=${fromDisk} redis=${fromRedis})`
  );
  if (failed.length) {
    failed.forEach(r => console.warn('[prewarm] failed:', r.reason));
  }
}

// `dir: __dirname` ensures Next.js resolves .next/, public/, etc. relative to
// this file regardless of what PM2 sets as process.cwd().
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

setTimeout(() => {
  app.prepare().then(async () => {
    // All workers prewarm their own NodeCache.
    // Primary reads from disk (and writes to Redis); workers read from Redis.
    prewarmJsonCache().catch(console.error);

    createServer((req, res) => {
      handle(req, res, parse(req.url, true));
    }).listen(port, '0.0.0.0', () => {
      if (process.send) process.send('ready');
    });
  });
}, startDelay);
