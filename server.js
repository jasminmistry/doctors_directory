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
let redisConnecting = null;
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
    // lazyConnect only opens the socket on first command, but sendCommand() checks
    // writability synchronously — so the very first command always fires before the
    // socket is ready and gets rejected outright (enableOfflineQueue is false).
    // Kick off + await the connect explicitly before issuing any get/set below.
    redisConnecting = redisClient.connect().catch((err) => {
      console.warn('[prewarm] Redis connect failed:', err.message);
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
  if (redisClient) await redisConnecting;

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

// Admin clinic/practitioner uploads live on the Docker volume at /app/uploads/images.
// Serve them directly here so preview URLs work without relying on Next.js public/
// symlinks (which can refuse files outside the public root).
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads', 'images');
const UPLOAD_URL_PREFIX = '/directory/images/uploads/';
const UPLOAD_NAME_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpe?g|png|webp|gif|svg)$/i;
const UPLOAD_CONTENT_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

function tryServeUploadedImage(req, res, pathname) {
  if (!pathname.startsWith(UPLOAD_URL_PREFIX)) return false;

  const filename = decodeURIComponent(pathname.slice(UPLOAD_URL_PREFIX.length)).replace(/\/$/, '');
  if (!UPLOAD_NAME_RE.test(filename)) {
    res.statusCode = 400;
    res.end('Invalid filename');
    return true;
  }

  const filePath = path.resolve(UPLOADS_DIR, filename);
  if (!filePath.startsWith(path.resolve(UPLOADS_DIR) + path.sep)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return true;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error('[uploads] failed to read', filePath, err.message);
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    const ext = filename.split('.').pop().toLowerCase();
    res.statusCode = 200;
    res.setHeader('Content-Type', UPLOAD_CONTENT_TYPES[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.end(data);
  });
  return true;
}

setTimeout(() => {
  app.prepare().then(async () => {
    // All workers prewarm their own NodeCache.
    // Primary reads from disk (and writes to Redis); workers read from Redis.
    prewarmJsonCache().catch(console.error);

    try {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    } catch (err) {
      console.error('[uploads] failed to ensure upload dir:', UPLOADS_DIR, err.message);
    }

    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      if (tryServeUploadedImage(req, res, parsedUrl.pathname || '')) {
        return;
      }
      handle(req, res, parsedUrl);
    }).listen(port, '0.0.0.0', () => {
      console.log(`[uploads] serving ${UPLOAD_URL_PREFIX}* from ${UPLOADS_DIR}`);
      if (process.send) process.send('ready');
    });
  });
}, startDelay);
