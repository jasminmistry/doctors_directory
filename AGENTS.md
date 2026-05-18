# Agent Guidelines for Doctor Directory

Guidance for coding agents working in this repository. Read fully before exploring files.

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
npx jest src/__tests__/utils.test.ts
npx jest -t "test name pattern"
```

Run a single Playwright test:
```bash
npm run test:e2e -- --project=chromium tests/e2e/my-spec.ts
npm run test:e2e -- --project=chromium -g "test name"
```

Pre-commit: `npm run lint && npm run test && npm run build`

## Architecture

**Stack**: Next.js 14.2 App Router, React 18, TypeScript (strict), Tailwind CSS 4, Zustand, Zod, shadcn/ui + Radix UI.

**What it is:** Aesthetic medical directory. Patients search clinics, practitioners, treatments, products. Clinics claim their listing, choose a plan, and get a portal with leads, calendar, and chat.

**Base path is `/directory`** - all routes, fetches, and assets must be prefixed with it (configured in `next.config.js`).

**URL slugs** follow kebab-case (`/^[a-z0-9-]+$/`). Use `cleanRouteSlug()` from `@/lib/utils` when constructing paths.

**Global state**: Zustand store at `src/stores/datastore.ts` holds search filter state. All other state is local React state.

### Two Distinct Data Layers - Do Not Mix Them

| Layer | What it holds | How it's read |
|---|---|---|
| **JSON files** `/public/*.json` | Clinics, practitioners, products, treatments (scraped/static public data) | `src/actions/search.ts` server actions, NodeCache + Redis |
| **MySQL via Prisma** | Claims, plans, bookings, chat sessions, leads, presence, reviews | `prisma` client from `@/lib/db` |

**JSON data flow:**
1. `server.js` prewarms JSON files into NodeCache (1-hour TTL) at startup. Primary PM2 worker reads disk -> writes Redis; secondary workers read Redis, fall back to disk.
2. Pages call server actions in `src/actions/search.ts` (React `cache()`-wrapped).
3. Admin mutations call `writeJsonFile()` in `src/lib/admin/file-utils.ts` - writes disk + invalidates NodeCache + Redis.

Key JSON files: `clinics_processed_new_data.json`, `derms_processed_new_5403.json`, `products_processed_new.json`, `treatments.json`, `city_data_processed.json`.

## Plans And Feature Gating

`claimedPlan` on the `Clinic` Prisma model. Three values:

| Value | Price | Features |
|---|---|---|
| `free` | GBP 0 | Portal, prospects inbox, consultation chat (local only, no Core sync) |
| `pay_per_lead` | GBP 15/lead unlock | + Calendar, full Core chat sync, leads unlocked per payment |
| `subscription` | GBP 99/mo | + Calendar, Core chat sync, automatic booking sync from Core |

**Gate pattern used everywhere - copy this exactly:**
```ts
const isFree = !clinic?.claimedPlan || clinic.claimedPlan === 'free'
const hasCoreCalendar = clinic.coreClinicId !== null && clinic.claimedPlan !== 'free'
```
Never gate only on `!claimedPlan` - `'free'` is a real plan value, not null.

Sidebar nav colours: cyan = subscription, violet = pay_per_lead, gray = free.

## Consentz Core Integration

`coreClinicId` on `Clinic` links the directory record to Core CRM. Set by admin on claim approval. Null = no Core integration.

### Auth
`src/lib/auth.ts` exports `consentzApi()` - handles token refresh automatically. Cookies (all path-scoped to `/directory`): `consentz_token`, `consentz_refresh_token`, `consentz_username`, `consentz_role`.

Core-lite base URL: `new URL(process.env.CONSENTZ_AUTH_API_URL).origin + '/api/core-lite'`

### In-Person Appointment Booking
- Availability: `GET /api/core-lite/clinics/{coreClinicId}/availability?date=YYYY-MM-DD`
- Create: `POST /api/core-lite/clinics/{coreClinicId}/bookings` - `slot_start`/`slot_end` must be ISO 8601
- Response: `{ booking: { id, status, slot_start, slot_end, practitioner, treatment, patient } }`
- Mirrored into local `Booking` table via `upsert` on `coreBookingId`
- Helpers: `getCoreAvailability()`, `createCoreBooking()` in `src/lib/core-api.ts`

### Video Call Booking
- Create: `POST /api/core-lite/clinics/{coreClinicId}/call-booking`
- **Two response types:**
	- `jitsi`: `{ call_type: 'jitsi', join_url: '...', join_url_ready: true, meeting_id }`
	- `zoom`: `{ call_type: 'zoom', join_url: null, join_url_ready: false, meeting_id }` - must poll
- Poll: `GET /api/core-lite/call-booking/{meetingId}` - same shape, `join_url_ready` flips to true when ready
- Directory proxies: `POST /api/call/[slug]`, `GET /api/call/[slug]/meeting/[meetingId]`
- UI: `src/components/clinic/call-booking-form.tsx` - polls every 10s for zoom, shows spinner

### Consultation Chat
`src/lib/consentz-chat.ts` - three functions, no auth required (public endpoints):
- `startCoreConversation()` -> `POST .../inbox/start` -> returns `conversation_id`
- `sendCoreMessage()` -> `POST .../inbox/{convId}/messages`
- `pollCoreMessages(after?: unixSecs)` -> `GET .../inbox/{convId}/messages?after={unix_ts}`

Free plan: messages stored locally only, no Core push. Paid plans: pushed to Core.

## Clinic Online Status

A clinic shows as **online** when all three are true:
1. `clinic.claimed === true`
2. `ClinicPresence.lastSeenAt` within 5 minutes (constant in `src/app/api/chat/[slug]/status/route.ts`)
3. Current time falls within configured `ClinicHour` business hours (if no hours set, presence alone is sufficient)

**Presence ping:** `PortalLayoutClient` POSTs to `/api/portal/presence` every 2 minutes while portal is open (`PRESENCE_INTERVAL_MS = 2 * 60 * 1000`).

**Check endpoint:** `GET /api/chat/[slug]/status` -> `{ online: boolean }`

**Client component:** `src/components/clinic/online-status.tsx` - polls every 2 minutes.

## Portal Auth

`getPortalUser()` in `src/lib/portal.ts` reads `consentz_username` cookie, finds approved `ClaimRequest`, and returns:

```ts
type PortalUser = {
	claimId: number
	entityType: 'clinic' | 'practitioner'
	entitySlug: string
	entityName: string
	clinicId: number | null
	practitionerId: number | null
	claimerName: string
	claimerEmail: string
}
```

Returns `null` if no approved claim. Portal pages redirect to `/portal/login`. Admin pages use `consentz_role` cookie.

## Chat - Patient Widget

`src/components/chat/consultation-chat-dialog.tsx`

- Floating widget: `fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96`
- Height: `min(560px, calc(100dvh - 5rem))` - `dvh` for mobile Safari
- **Session persistence:** localStorage key `chat:${slug}`, stores only `{ sessionId, visitorToken, savedAt }`. TTL = 24h. Messages fetched fresh from server on restore - nothing sensitive in localStorage.
- Polling: every 3s when panel open and phase is `chat`. Stops when closed.
- Phases: `idle` -> `intro` -> `form` -> `chat`
- "New chat" clears localStorage and resets all state

## Chat - Clinic Portal Inbox

`src/components/portal/chat-inbox.tsx`

- Session list polls every 5s; active conversation messages poll every 3s
- **Auto-scroll rule:** scrolls only when `newCount > prevCount` (new messages arrived) AND user is within 150px of bottom. Initial conversation load scrolls instantly. Tracking resets on conversation switch - never scrolls on poll cycles with no new messages.
- Unread dot shown when last message is from patient and session is active

## API Routes

```text
Public (no auth):
	GET  /api/chat/[slug]/status                      online status check
	POST /api/chat/[slug]/session                     start chat session
	GET  /api/chat/[slug]/session/[id]/messages       poll messages
	POST /api/chat/[slug]/session/[id]/messages       patient sends message
	GET  /api/call/[slug]/slots                       video call availability
	POST /api/call/[slug]                             book video call
	GET  /api/call/[slug]/meeting/[id]                poll zoom meeting status
	POST /api/book/[slug]                             book in-person appointment
	GET  /api/book/[slug]/availability                appointment slot availability

Portal (cookie-gated via getPortalUser):
	GET  /api/portal/chat/sessions                    inbox session list
	GET  /api/portal/chat/sessions/[id]/messages      conversation messages
	POST /api/portal/chat/sessions/[id]/messages      clinic reply
	POST /api/portal/presence                         presence ping

Admin (role cookie-gated):
	GET/POST          /api/admin/[entity]/
	GET/PUT/DELETE    /api/admin/[entity]/[slug]/
```

## Routing

```text
Public:
	/[cityslug]/                           city landing
	/[cityslug]/clinic/[slug]/             clinic detail
	/[cityslug]/practitioner/[slug]/       practitioner detail
	/search                                search results

Portal:
	/portal/login
	/portal/clinic                         dashboard
	/portal/clinic/prospects               leads inbox (all plans)
	/portal/clinic/calendar                calendar (paid plans only)
	/portal/clinic/chat                    consultation inbox (all plans, limited on free)

Admin:
	/admin/*
```

## Key Files

| Path | Purpose |
|---|---|
| `src/actions/search.ts` | Server actions - data load + search, React `cache()`-wrapped |
| `src/lib/core-api.ts` | `getCoreAvailability()`, `createCoreBooking()` - Core CRM helpers |
| `src/lib/consentz-chat.ts` | `startCoreConversation()`, `sendCoreMessage()`, `pollCoreMessages()` |
| `src/lib/portal.ts` | `getPortalUser()` - portal session resolver |
| `src/lib/auth.ts` | `consentzApi()`, cookie constants |
| `src/lib/db.ts` | Prisma client singleton |
| `src/lib/types.ts` | All shared TypeScript interfaces |
| `src/lib/schemas/` | Zod schemas per entity |
| `src/lib/admin/file-utils.ts` | `readJsonFile`, `writeJsonFile`, `prewarmFile` |
| `src/lib/data.ts` | Static lookup tables: 1,650+ brands, 200+ accreditations, 73+ modalities |
| `src/stores/datastore.ts` | Zustand search filter state |
| `src/components/portal/PortalLayoutClient.tsx` | Sidebar nav - plan badge, lock icons, presence ping |
| `src/components/portal/chat-inbox.tsx` | Admin chat inbox |
| `src/components/portal/chat-badge.tsx` | Unread chat count badge |
| `src/components/portal/lead-badge.tsx` | Unseen leads count badge |
| `src/components/chat/consultation-chat-dialog.tsx` | Patient-facing chat widget |
| `src/components/clinic/call-booking-form.tsx` | Video call booking (jitsi + zoom) |
| `src/components/clinic/online-status.tsx` | Online/offline indicator on profile |
| `src/components/Clinic/profile-header.tsx` | Clinic/practitioner page header |
| `src/components/Clinic/clinicLabels.tsx` | Regulatory logos (CQC, HIW, HIS, JCCP, RQIA, Save Face) |
| `src/components/clinic/accreditation-badges.tsx` | Accreditation card (right sidebar) |
| `src/components/clinic/transparency-box.tsx` | Trust/transparency card (right sidebar) |
| `tests/e2e/` | Playwright E2E (5 projects: Chrome, Firefox, Safari, Pixel 5, iPhone 12) |

## Prisma Models - Key Fields

| Model | Fields that matter |
|---|---|
| `Clinic` | `claimed`, `claimedPlan`, `coreClinicId`, `stripeCustomerId`, `verified`, `idVerified` |
| `ClaimRequest` | `status` (pending_otp -> otp_verified -> pending_approval -> approved/rejected), `selectedPlan`, `consentzClinicId`, `consentzUsername` |
| `ConsultationLead` | `isUnlocked`, `isGhostLead`, `seenAt`, `stripePaymentIntentId` |
| `Booking` | `coreBookingId`, `syncedFromCore`, `status` (pending/confirmed/cancelled/completed/no_show) |
| `ChatSession` | `visitorToken` (unique), `coreConversationId`, `status` (active/closed) |
| `ChatMessage` | `sender` (patient/clinic), `coreMessageId` |
| `ClinicPresence` | `lastSeenAt` - upserted on every portal ping |

## Patterns And Conventions

**Imports** - group: external libs -> internal `@/` -> relative; sort alphabetically. Use `import type` for type-only imports.

**Naming** - components PascalCase; files kebab-case; functions/variables camelCase; types/interfaces PascalCase.

**Components** - `'use client'` at top for client components; props interface before export; `cn()` from `@/lib/utils` for conditional Tailwind; `next/image` for allowlisted domains, `<img>` for external/dynamic URLs; semantic HTML + `aria-label`.

**API routes** - named exports `GET`/`POST`/`PUT`/`DELETE`; Zod validation before processing; always `try/catch` with `console.error`; `NextResponse.json()` with correct status codes.

**Types** - shared types from `src/lib/types.ts`. `interface` for object shapes, `type` for unions. `unknown` over `any`. Type guards: `function isFoo(obj: unknown): obj is Foo`.

**Key utilities**: `cn()`, `safeParse()`, `decodeUnicodeEscapes()`, `cleanRouteSlug()` - from `@/lib/utils` or `@/lib/admin/file-utils`.

## Environment Variables

| Variable | Used for |
|---|---|
| `CONSENTZ_AUTH_API_URL` | Base for all Core API calls. Core-lite base = `new URL(x).origin + '/api/core-lite'` |
| `DATABASE_URL` | MySQL connection string (Prisma) |
| `STRIPE_SECRET_KEY` | Stripe server-side operations |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature validation |
| `RESEND_API_KEY` | Transactional email |

## Deployment

- Docker multi-stage build (Alpine 3.23) + PM2 cluster (`ecosystem.config.js`)
- Custom Express server (`server.js`) pre-warms file cache on startup
- Blue-green deployment via GitHub Actions (`.github/workflows/deploy-staging.yml`, `deploy.yml`)
- Health check: `GET /directory/api/healthz/`
- Memory restart threshold: 1,100 MB per PM2 instance

## Before Committing

1. Run `npm run lint` and fix all linting errors.
2. Run `npm run test` and ensure unit tests pass.
3. Run `npm run build` and ensure production build succeeds.
4. Review TypeScript/IDE errors before opening a PR.
