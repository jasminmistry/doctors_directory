'use strict';

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');
const NodeCache = require('node-cache');

// ---------------------------------------------------------------------------
// Shared in-process JSON cache — must mirror the TTL / options used in
// src/lib/json-cache.ts and src/lib/admin/file-utils.ts so that the
// pre-warmed entries are picked up by those modules at runtime.
// ---------------------------------------------------------------------------
const DATA_DIR = path.join(__dirname, 'public');

// The module instances loaded by Next.js (via @/lib/json-cache and
// @/lib/admin/file-utils) live in the same Node process, so we can reach
// their caches through require() after app.prepare() resolves.
const JSON_FILES_TO_PREWARM = [
  'clinics_processed_new_data.json',
  'derms_processed_new_5403.json',
  'products_processed_new.json',
  'treatments.json',
  'city_data_processed.json',
];

async function prewarmJsonCache() {
  const results = await Promise.allSettled(
    JSON_FILES_TO_PREWARM.map(async (filename) => {
      const filePath = path.join(DATA_DIR, filename);
      const raw = await fs.promises.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(raw);

      // Populate both Next.js module caches so the first real request is a
      // cache-hit.  require() returns the already-loaded module instance
      // because Node caches modules after the first load.
      try {
        const { jsonCache } = require('./src/lib/json-cache');
        if (!jsonCache.has(filename)) jsonCache.set(filename, parsed);
      } catch (_) { /* module not yet resolvable — skip */ }

      try {
        // file-utils keeps its own private `fileCache`; expose it via a
        // prewarm helper exported from the module.
        const fileUtils = require('./src/lib/admin/file-utils');
        if (typeof fileUtils.prewarmFile === 'function') {
          fileUtils.prewarmFile(filename, parsed);
        }
      } catch (_) { /* module not yet resolvable — skip */ }

      return filename;
    })
  );

  const loaded = results.filter(r => r.status === 'fulfilled').map(r => r.value);
  const failed = results.filter(r => r.status === 'rejected');
  console.log(`[cache-prewarm] loaded ${loaded.length}/${JSON_FILES_TO_PREWARM.length} files`);
  if (failed.length) {
    failed.forEach((r, i) => console.warn(`[cache-prewarm] failed: ${r.reason}`));
  }
}

const port = parseInt(process.env.PORT || '3000', 10);

// Stagger startup so workers don't all hit disk simultaneously.
// PM2 cluster workers get sequential IDs via NODE_APP_INSTANCE (0, 1, 2...).
const instanceId = parseInt(process.env.NODE_APP_INSTANCE || '0', 10);
const startDelay = instanceId * 2000; // 2 s gap between each worker

// `dir: __dirname` ensures Next.js resolves .next/, public/, etc. relative to
// this file regardless of what PM2 sets as process.cwd().
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

setTimeout(() => {
  app.prepare().then(async () => {
    // Pre-warm JSON caches before accepting traffic so the first real
    // request is served from RAM rather than triggering a cold disk read.
    await prewarmJsonCache();

    createServer((req, res) => {
      handle(req, res, parse(req.url, true));
    }).listen(port, '0.0.0.0', () => {
      if (process.send) process.send('ready');
    });
  });
}, startDelay);
