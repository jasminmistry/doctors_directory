# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Jest unit tests (batched, high memory)
npm run test:e2e     # Playwright E2E (5 browsers)
npm run test:e2e:ui  # Playwright interactive UI
```

Running a single Jest test file:
```bash
npx jest src/__tests__/utils.test.ts
npx jest -t "test name pattern"
```

Running a single Playwright spec:
```bash
npm run test:e2e -- tests/e2e/search.spec.ts
npm run test:e2e -- --project=chromium -g "test name"
```

Pre-commit: `npm run lint && npm run test && npm run build`

## Architecture

**Stack**: Next.js 14.2 App Router, React 18, TypeScript (strict), Tailwind CSS 4, Zustand, Zod, shadcn/ui + Radix UI.

**Base path**: `/directory` (configured in `next.config.js`). All routes and asset paths are prefixed with this.

**Data storage**: File-based JSON in `public/` — no traditional database. Key files: `clinics_processed_new_data.json`, `derms_processed_new_5403.json`, `products_processed_new.json`. File reads go through `readJsonFile`/`writeJsonFile` from `@/lib/admin/file-utils`. In-memory caching via `node-cache` (1-hour TTL) wraps these reads; cache must be invalidated after writes.

**Data fetching**: Server actions in `src/app/actions/` load and cache data server-side using React's `cache()` for request-level deduplication. Client components fetch via API routes under `/api/admin/`.

**Global state**: Zustand store at `src/app/stores/datastore.ts` holds search filter state (type, query, category, location, rating, services). All other state is local React state.

**Routing structure**:
- `/[cityslug]/` — city landing pages
- `/[cityslug]/clinic/[slug]/` — clinic detail
- `/[cityslug]/practitioner/[slug]/` — practitioner detail
- `/search` — search results (query-driven)
- `/admin/*` — admin dashboard (CRUD for all entities)
- `/api/admin/[entity]/route.ts` — list + create
- `/api/admin/[entity]/[slug]/route.ts` — read, update, delete

**Validation**: All API route inputs validated with Zod schemas from `src/lib/schemas/`. Return 400 with validation errors on invalid input. Slug format: `/^[a-z0-9-]+$/`.

**Admin API pattern**: Export named `GET`/`POST`/`PUT`/`DELETE` functions, always use try-catch, return `NextResponse.json()` with appropriate status codes.

**Deployment**: Custom Express server (`server.js`) for PM2. Pre-warms file cache on startup. PM2 config in `ecosystem.config.js`.

## Code Conventions

**Imports**: Group as external libs → internal (`@/*`) → relative; sort alphabetically. Use `import type` for type-only imports.

**Naming**: Components PascalCase, functions/variables camelCase, files kebab-case, types/interfaces PascalCase.

**Components**: `'use client'` directive required for client components. Use `cn()` from `@/lib/utils` for conditional Tailwind. Use `next/image` for all images (domains allowlisted in `next.config.js`). Semantic HTML + `aria-label` for accessibility.

**Types**: Shared types exported from `src/lib/types.ts`. Prefer `interface` for object shapes, `type` for unions. Use `unknown` over `any`. Type guards: `function isFoo(obj: unknown): obj is Foo`.

**Key utilities**: `cn()`, `safeParse()`, `decodeUnicodeEscapes()`, `cleanRouteSlug()` — all importable from `@/lib/utils` or `@/lib/admin/file-utils`.
