'use strict';

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);

// `dir: __dirname` ensures Next.js resolves .next/, public/, etc. relative to
// this file regardless of what PM2 sets as process.cwd().
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, '0.0.0.0', () => {
    console.log(`> Ready on http://0.0.0.0:${port}`);
    // Signal PM2 that the worker is ready (used with wait_ready: true)
    if (process.send) process.send('ready');
  });
});
