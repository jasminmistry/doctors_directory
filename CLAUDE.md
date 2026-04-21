# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Build production bundle
npm run start        # Start production server (4GB heap)
npm run lint         # Run ESLint

npm run test         # Run Jest unit tests (memory-optimised: 16GB heap, no cache)
npm run test:batches # Run Jest in 3 parallel batches (batch-1/2/3)
npm run test:e2e     # Run Playwright E2E tests
npm run test:e2e:ui  # Playwright interactive UI
npm run test:e2e:debug  # Playwright inspector
npm run test:sitemap # Validate sitemap integrity
```

Run a single Jest test file:
```bash
npm run test -- --testPathPattern=city-clinics-batch-1
```

Run a single Playwright test:
```bash
npm run test:e2e -- --project=chromium tests/e2e/my-spec.ts
```

## Architecture

**What it is:** Aesthetic medical directory (Next.js 14 App Router, TypeScript strict, Tailwind + shadcn/ui). Users search clinics, practitioners, products, and treatments. Admins manage all data via a CRUD dashboard.

**Backend is file-based JSON.** There is no database. Data lives in `/public/*.json` files (`clinics_processed_new_data.json`, `derms_processed_new_5403.json`, `products_processed_new.json`, `treatments.json`, `city_data_processed.json`). Redis is an optional shared-memory layer for PM2 cluster workers.

**Data flow:**
1. At startup, `server.js` prewarms the JSON files into NodeCache (1-hour TTL). The primary PM2 worker reads from disk and writes to Redis; secondary workers read from Redis, falling back to disk.
2. Pages call server actions in `src/actions/search.ts` (wrapped with React `cache()`) to load and filter data.
3. Admin mutations go through API routes at `src/app/api/admin/[entity]/` which call `writeJsonFile()` in `src/lib/admin/file-utils.ts` — this writes to disk and invalidates both NodeCache and Redis.

**Base path is `/directory`** — all routes and assets are prefixed with it (configured in `next.config.js`).

**URL slugs** follow kebab-case (`/^[a-z0-9-]+$/`). Use `cleanRouteSlug()` from `@/lib/utils` when constructing paths.

## Key directories

| Path | Purpose |
|------|---------|
| `src/actions/` | Server actions (data load + search, React `cache()`-wrapped) |
| `src/app/api/admin/` | CRUD REST API for clinics, practitioners, products, treatments, pending |
| `src/app/admin/` | Admin dashboard pages |
| `src/app/clinics/`, `practitioners/`, `treatments/`, `products/` | Public-facing entity pages |
| `src/components/ui/` | shadcn/ui components |
| `src/lib/types.ts` | All shared TypeScript interfaces (`Clinic`, `Practitioner`, `Product`, `City`, …) |
| `src/lib/schemas/` | Zod schemas per entity (used for API validation) |
| `src/lib/admin/file-utils.ts` | `readJsonFile`, `writeJsonFile`, `prewarmFile` |
| `src/lib/data.ts` | Static lookup tables: 1,650+ brands, 200+ accreditations, 73+ treatment modalities |
| `src/stores/datastore.ts` | Zustand store for search filter UI state |
| `tests/e2e/` | Playwright E2E tests (5 browser projects: Chrome, Firefox, Safari, Pixel 5, iPhone 12) |

## Patterns and conventions

**Imports** — group: external libs → internal `@/` → relative; use `import type` for type-only imports.

**Components** — `'use client'` at the top for client components; define props interface before the export; use `cn()` from `@/lib/utils` for conditional Tailwind classes; use `next/image` for all images (domains are allowlisted in `next.config.js`).

**API routes** — export named `GET`/`POST`/`PUT`/`DELETE` functions; validate with Zod before processing; always `try/catch` with `console.error`; return `NextResponse.json()` with proper status codes.

**Validation** — Zod schemas in `src/lib/schemas/`; additional validators in `src/lib/admin/validators.ts`. Return 400 with the validation errors on invalid input.

**Type guards** follow the pattern: `function isPractitioner(obj: unknown): obj is Practitioner`.

**File naming:** components → PascalCase; files → kebab-case; functions/variables → camelCase.

## Deployment

- Docker multi-stage build (Alpine 3.23) + PM2 cluster (`ecosystem.config.js`)
- Blue-green deployment via GitHub Actions (`.github/workflows/deploy-staging.yml`, `deploy.yml`)
- Health check endpoint: `GET /directory/api/healthz/`
- Memory restart threshold: 1,100 MB per PM2 instance
