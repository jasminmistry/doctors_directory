import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const reactPath = require.resolve('react')
require.cache[reactPath] = {
  id: reactPath,
  filename: reactPath,
  loaded: true,
  exports: { cache: (fn) => fn, default: { cache: (fn) => fn } },
}

const { countB2cSitemapPages } = await import('../src/lib/b2c-sitemap-counts.ts')
console.log(JSON.stringify(countB2cSitemapPages(), null, 2))
