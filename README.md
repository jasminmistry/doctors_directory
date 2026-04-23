# Doctor Directory

A comprehensive Next.js 14.2 application for an aesthetic medical directory platform. The platform allows users to search for clinics, practitioners, products, and treatments with advanced filtering capabilities, and includes an admin dashboard for content management.

Sonarcloud Static Code Analysis + Quality Gate: [https://sonarcloud.io/project/overview?id=mobgsm-creator_doctors_directory](https://sonarcloud.io/project/overview?id=mobgsm-creator_doctors_directory)
<img width="1575" height="816" alt="image" src="https://github.com/user-attachments/assets/89ee4a77-e09c-4b27-a5a4-478e2c1d1c80" />

## Features

- **Search & Discovery**: Advanced search with filters for clinics, practitioners, products, and treatments
- **City-Based Navigation**: Browse listings by location
- **Accreditation Directory**: Filter by medical accreditations and credentials
- **Treatment Catalog**: Browse aesthetic treatments with details
- **Product Directory**: Search products by brand and category
- **Admin Dashboard**: CRUD operations for all entities (clinics, practitioners, products, treatments)
- **Pending Items Queue**: Review and approve submitted content
- **QA Testing**: Built-in test reporting and validation
- **Mobile Responsive**: Optimized for all device sizes

## File/Folder Structure

```
doctor-directory/
├── src/
│   ├── __tests__/           # Jest unit/integration tests
│   ├── actions/             # Server actions for data operations
│   ├── admin/               # Admin dashboard pages
│   ├── api/                 # API routes (REST endpoints)
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities, types, schemas
│   └── stores/              # Zustand state management
├── public/                  # Static assets & JSON data files
├── tests/                   # Playwright E2E tests
├── run_tests/             # Legacy Jest batch test files
└── Configuration files (next.config.js, playwright.config.ts, etc.)
```

## Pages (App Router)

### Core Pages

| Route | File | Purpose |
|--------|------|---------|
| `/` | `page.tsx` | Home page with hero, search, treatments grid, FAQ |
| `/search` | `page.tsx` | Main search results page |
| `/search/loading.tsx` | `loading.tsx` | Loading state for search |

### Clinic Routes

| Route | Purpose |
|--------|---------|
| `/clinics/page.tsx` | Clinics listing page |
| `/clinics/[cityslug]/page.tsx` | Clinics by city |
| `/clinics/[cityslug]/clinic/[slug]/page.tsx` | Individual clinic profile |
| `/clinics/[cityslug]/clinic/[slug]/loading.tsx` | Loading state for clinic profile |
| `/clinics/[cityslug]/services/[serviceslug]/page.tsx` | Clinics by city & service |

### Practitioner Routes

| Route | Purpose |
|--------|---------|
| `/practitioners/page.tsx` | Practitioners listing page |
| `/practitioners/[cityslug]/page.tsx` | Practitioners by city |
| `/practitioners/credentials/page.tsx` | Credentials listing |
| `/practitioners/credentials/[cred]/page.tsx` | Individual credential profile |

### Treatment Routes

| Route | Purpose |
|--------|---------|
| `/treatments/page.tsx` | All treatments grid |
| `/treatments/[slug]/page.tsx` | Individual treatment detail |
| `/treatments/[slug]/loading.tsx` | Loading state for treatment |
| `/treatments/actions.ts` | Server actions for treatments |

### Product Routes

| Route | Purpose |
|--------|---------|
| `/products/brands/page.tsx` | Products by brand listing |
| `/products/brands/[brand]/page.tsx` | Individual brand products |
| `/products/brands/[brand]/[slug]/page.tsx` | Product detail page |
| `/products/category/page.tsx` | Products by category listing |
| `/products/category/[category]/page.tsx` | Category products |
| `/products/category/[category]/[slug]/page.tsx` | Product detail page |
| `/products/category/[category]/loading.tsx` | Loading state |

### Accreditation Routes

| Route | Purpose |
|--------|---------|
| `/accredited/page.tsx` | Accredited providers overview |
| `/accredited/[accreditation]/clinics/page.tsx` | Accredited clinics |
| `/accredited/[accreditation]/clinics/[cityslug]/page.tsx` | Accredited clinics by city |
| `/accredited/[accreditation]/practitioners/page.tsx` | Accredited practitioners |
| `/accredited/[accreditation]/practitioners/[cityslug]/page.tsx` | Accredited practitioners by city |

### Admin Routes

| Route | Purpose |
|--------|---------|
| `/admin/page.tsx` | Admin dashboard overview |
| `/admin/clinics/page.tsx` | Clinics management |
| `/admin/clinics/[slug]/page.tsx` | Edit/create clinic |
| `/admin/practitioners/page.tsx` | Practitioners management |
| `/admin/practitioners/[slug]/page.tsx` | Edit/create practitioner |
| `/admin/products/page.tsx` | Products management |
| `/admin/products/[slug]/page.tsx` | Edit/create product |
| `/admin/treatments/page.tsx` | Treatments management |
| `/admin/treatments/[slug]/page.tsx` | Edit/create treatment |
| `/admin/pending/` | Pending items review |
| `/admin/qa/page.tsx` | QA test report viewer |

### Layout

| File | Purpose |
|------|---------|
| `layout.tsx` | Root layout with Header, Footer, Analytics |
| `globals.css` | Global CSS styles |

## API Routes

All API routes are under `/api/admin/` for admin operations:

| Route | Methods | Purpose |
|--------|---------|---------|
| `/api/admin/clinics/route.ts` | GET, POST | List all clinics, create new clinic |
| `/api/admin/clinics/[slug]/route.ts` | GET, PUT, DELETE | Read/update/delete individual clinic |
| `/api/admin/practitioners/route.ts` | GET, POST | List all practitioners, create new |
| `/api/admin/practitioners/[slug]/route.ts` | GET, PUT, DELETE | Read/update/delete practitioner |
| `/api/admin/products/route.ts` | GET, POST | List all products, create new |
| `/api/admin/products/[slug]/route.ts` | GET, PUT, DELETE | Read/update/delete product |
| `/api/admin/treatments/route.ts` | GET, POST | List all treatments, create new |
| `/api/admin/treatments/[slug]/route.ts` | GET, PUT, DELETE | Read/update/delete treatment |
| `/api/admin/pending/route.ts` | GET, POST | Get/pending items |
| `/api/admin/pending/clinics/route.ts` | GET, POST | Pending clinics |
| `/api/admin/pending/clinics/[slug]/route.ts` | GET, PUT, DELETE | Pending clinic management |
| `/api/admin/pending/practitioners/route.ts` | GET, POST | Pending practitioners |
| `/api/admin/pending/practitioners/[slug]/route.ts` | GET, PUT, DELETE | Pending practitioner management |

## Components

### UI Components (`src/components/ui/`)

| Component | Purpose |
|-----------|---------|
| `accordion.tsx` | Collapsible accordion panels |
| `avatar.tsx` | User avatar display |
| `badge.tsx` | Small status/category badges |
| `breadcrumb.tsx` | Navigation breadcrumbs |
| `button.tsx` | Button component with variants |
| `card.tsx` | Card container component |
| `checkbox.tsx` | Checkbox input |
| `collapsible.tsx` | Collapsible content wrapper |
| `dialog.tsx` | Modal dialog |
| `input.tsx` | Text input field |
| `label.tsx` | Form label |
| `select.tsx` | Select dropdown |
| `separator.tsx` | Visual separator |
| `sheet.tsx` | Side sheet/drawer |
| `skeleton.tsx` | Loading skeleton |
| `slider.tsx` | Range slider |
| `tabs.tsx` | Tabbed interface |
| `textarea.tsx` | Multi-line text input |
| `section.tsx` | Section wrapper |

### Core Search & Navigation Components

| Component | Purpose |
|-----------|---------|
| `header.tsx` | Site header with navigation |
| `navigation-header.tsx` | Secondary navigation |
| `footer.tsx` | Site footer |
| `search-bar.tsx` | Main search bar component |
| `searchClient.tsx` | Client-side search logic |
| `search-button.tsx` | Search trigger button |
| `search-dropdown.tsx` | Search filter dropdown |
| `search-results-header.tsx` | Results page header |
| `mobile-search-view.tsx` | Mobile search UI |
| `desktop-search-view.tsx` | Desktop search UI |
| `hero-section.tsx` | Hero banner with search |
| `home-page.tsx` | Home page content |

### Display Components

| Component | Purpose |
|-----------|---------|
| `practitioner-card.tsx` | Unified card for clinics/practitioners/products/treatments |
| `practitioner-list-item.tsx` | List view item |
| `treatment-grid.tsx` | Treatments display grid |
| `treatment-detail.tsx` | Treatment detail view |
| `treatment-search-client.tsx` | Treatment search UI |
| `treatment-filters-client.tsx` | Treatment filters |
| `review-card.tsx` | Review display |
| `performace-summary.tsx` | Performance metrics |
| `visx-donut.tsx` | Donut chart (VisX) |
| `boxplot-graph.tsx` | Box plot visualization |
| `gmaps-embed.tsx` | Google Maps embed |
| `loading-skeleton.tsx` | Loading skeleton wrapper |

### Filter Components

| Component | Purpose |
|-----------|---------|
| `filterSidebar.tsx` | Filter sidebar container |
| `filters/ClinicFilters.tsx` | Clinic-specific filters |
| `filters/PractitionerFilters.tsx` | Practitioner-specific filters |
| `filters/ProductFilters.tsx` | Product-specific filters |

### Entity-Specific Components

#### Clinic (`src/components/Clinic/`)

| Component | Purpose |
|-----------|---------|
| `clinicDetailsMD.tsx` | Clinic details (markdown) |
| `clinicLabels.tsx` | Accreditation badges |
| `clinicSocialMedia.tsx` | Social media links |
| `clinicTabs.tsx` | Clinic profile tabs |
| `profile-header.tsx` | Clinic profile header |

#### Practitioner (`src/components/Practitioner/`)

| Component | Purpose |
|-----------|---------|
| `profile-header.tsx` | Practitioner profile header |
| `clinicTabsHeader.tsx` | Tabs header |
| `clinicLabels.tsx` | Label badges |
| `practitionerDetailsMD.tsx` | Details (markdown) |
| `practitioner-insights.tsx` | Analytics insights |
| `PractitionerTabs.tsx` | Profile tabs |

#### Product (`src/components/Product/`)

| Component | Purpose |
|-----------|---------|
| `profile-header.tsx` | Product profile header |
| `ProductDetailsMD.tsx` | Product details (markdown) |
| `ProductTabs.tsx` | Product profile tabs |

### Admin Components (`src/components/admin/`)

| Component | Purpose |
|-----------|---------|
| `AdminLayout.tsx` | Admin page layout |
| `AdminForm.tsx` | Generic CRUD form |
| `ArrayEditor.tsx` | Array field editor |
| `DataTable.tsx` | Data table display |
| `EditPreviewTabs.tsx` | Edit/preview tabs |
| `QAClient.tsx` | QA test client |
| `RichTextEditor.tsx` | Rich text input |

### Utility Components

| Component | Purpose |
|-----------|---------|
| `scroll-to-top.tsx` | Scroll to top button |
| `LogoLoop.tsx` | Logo carousel |
| `MoreItems.tsx` | Load more items |
| `MoreItemsScroller.tsx` | Scroller for more items |
| `MobileDrawer.tsx` | Mobile drawer menu |
| `FAQSection.tsx` | FAQ display |
| `FilterForm.tsx` | Filter form wrapper |

### Test Components (`src/components/test/`)

Used for test reporting and validation:

| Component | Purpose |
|-----------|---------|
| `testAccreditedClinics.tsx` | Accredited clinics test |
| `testAccreditedPractitioners.tsx` | Accredited practitioners test |
| `testCityClinics.tsx` | City clinics test |
| `testClinicsCount.tsx` | Clinics count test |
| `testPractitionerCount.tsx` | Practitioner count test |
| `testPractitionerCredentials.tsx` | Credentials test |
| `testPractitionersByCity.tsx` | Practitioners by city test |
| `testServicesCount.tsx` | Services count test |
| `testTreatments.tsx` | Treatments test |
| `testTreatmentsCount.tsx` | Treatments count test |

## Test Suites

### Jest Unit/Integration Tests (`src/__tests__/`)

| Test File | Purpose |
|-----------|---------|
| `accredited-clinics-batch-1.test.tsx` | Accredited clinics batch 1 |
| `accredited-practitioners-batch-1.test.tsx` | Accredited practitioners batch 1 |
| `city-clinics-batch-1.test.tsx` | City clinics batch 1 |
| `clinic-city-services-batch-1.test.tsx` | Clinic city services batch 1 |
| `practitioner-city-treatments-batch-1.test.tsx` | Practitioner city treatments batch 1 |
| `practitioner-credentials-batch-1.test.tsx` | Practitioner credentials batch 1 |
| `practitioners-by-city-batch-1.test.tsx` | Practitioners by city batch 1 |
| `treatments-batch-1.test.tsx` | Treatments batch 1 |

<img width="1525" height="956" alt="image" src="https://github.com/user-attachments/assets/83268111-060f-4afb-b270-751dbb97b228" />


### Legacy Batch Tests (`run_tests/`)

Batch test files for clinics and practitioners (batches 1-11):
- `clinics-batch-[1-9].test.tsx`
- `practitioners-batch-[1-11].test.tsx`

### Playwright E2E Tests

- **Config**: `playwright.config.ts` - Tests 5 browsers (Chromium, Firefox, Safari, Mobile Chrome, Mobile Safari)
- **Test dir**: `./tests/e2e`
- **Status**: Configured and ready for test files

## Tech Stack

- **Framework**: Next.js 14.2.25 (App Router)
- **Runtime**: React 18.2
- **Language**: TypeScript 5.9 (strict mode)
- **Styling**: Tailwind CSS 4.1.9
- **State**: Zustand 5.0.8
- **Validation**: Zod 3.25.67
- **UI Components**: shadcn/ui + Radix UI
- **Testing**: Jest 30.2.0 (unit), Playwright 1.57.0 (E2E)
- **Backend**: File-based JSON storage
- **Analytics**: Vercel Analytics
- **Icons**: Lucide React
- **Charts**: VisX, Recharts
- **Fonts**: Geist Sans, Geist Mono
- **Forms**: React Hook Form, Hookform Resolvers

## Key Utilities & Libraries

### Types (`src/lib/types.ts`)
Core TypeScript interfaces for Clinic, Practitioner, Product, Review, SearchFilters, and more.

### Schemas (`src/lib/schemas/`)
Zod validation schemas for clinics, practitioners, products, and treatments.

### Admin Utilities (`src/lib/admin/`)
File operations (`readJsonFile`, `writeJsonFile`), validation wrappers, and search functionality.

### Core Utilities (`src/lib/utils.ts`)
- `cn()` - Merge Tailwind classes
- `cleanRouteSlug()` - Format URL slugs
- `safeParse()` - Safe JSON parsing
- `decodeUnicodeEscapes()` - Handle Unicode sequences
- Type guards for entity types

### Data (`src/lib/data.ts`)
Static data for categories, services, brands (1650+), accreditations (200+), product categories, modalities (73+), and education qualifications.

### State Management (`src/app/stores/datastore.ts`)
Zustand store for global search filter state.

### Server Actions (`src/app/actions/`)
Cached data loading and search with filters, pagination, and sorting.

## Development Commands

### Development & Building

```bash
npm run dev          # Start development server on localhost:3000
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint checks
```

### Testing

```bash
npm run test                      # Run Vitest unit tests
npm run test:ui                   # Run Vitest with UI (watch mode)
npm run test:coverage             # Generate coverage reports
npm run test:e2e                  # Run Playwright end-to-end tests
npm run test:e2e:ui               # Run Playwright with interactive UI
npm run test:e2e:debug            # Debug Playwright tests with inspector
npm run test:e2e:install          # Install Playwright browsers
```

### Running Single Tests

Vitest patterns:
```bash
npm run test -- <filename>                  # Run specific test file
npm run test -- -t "<pattern>"              # Run tests matching pattern
npm run test -- --watch                      # Watch mode for TDD
```

Playwright patterns:
```bash
npm run test:e2e -- <spec-file>              # Run specific E2E test file
npm run test:e2e -- -g "<test name>"         # Run tests matching name
npm run test:e2e -- --project=chromium       # Run on specific browser
```

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Lead Tracking Setup

This project includes a lightweight tracking + lead capture layer for directory CTAs.

1. Copy env defaults:

```bash
cp .env.local.example .env.local
```

2. (Optional, recommended) create MariaDB tables using:

```bash
mariadb/tracking-schema.sql
```

3. Set these values in `.env.local` for hosted storage:

- `MARIADB_HOST`
- `MARIADB_PORT` (default `3306`)
- `MARIADB_USER`
- `MARIADB_PASSWORD`
- `MARIADB_DATABASE`

Optional (only if you want custom table names):

- `MARIADB_EVENTS_TABLE` (default fallback: `directory_events`)
- `MARIADB_LEADS_TABLE` (default fallback: `directory_leads`)

If MariaDB is not configured, events/leads are written locally to:

```bash
.data/tracking/events.ndjson
.data/tracking/leads.ndjson
```

### Tracking dashboard (admin)

- UI: `/admin/tracking` (filters are stored in the query string so views are shareable).
- API: `GET /api/admin/tracking` (same query params as the UI).
- Optional gate: set `TRACKING_DASHBOARD_TOKEN` in `.env.local` / server env, then pass `?token=…` on the dashboard URL and in API calls (the UI “Copy link” includes it when present).

### Google Analytics (measurement ID)

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to your GA4 property ID when available. If unset, the app keeps the existing default measurement ID in `src/app/layout.tsx`.

# Deployed to https://staging.consentz.com/directory/
