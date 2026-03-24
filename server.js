'use strict';

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

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
  app.prepare().then(() => {
    createServer((req, res) => {
      handle(req, res, parse(req.url, true));
    }).listen(port, '0.0.0.0', () => {
      if (process.send) process.send('ready');
    });
  });
}, startDelay);
