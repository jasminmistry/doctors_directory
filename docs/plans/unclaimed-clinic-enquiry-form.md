# Simplified enquiry form for unclaimed clinics

**Status:** in progress
**Branch:** `jasmin/business-profile`

## Goal

Patient contact requests made against an **unclaimed** clinic capture and share
*less* data than requests to claimed clinics. Claimed-clinic flow is unchanged.

Unclaimed enquiry form = current rich form **minus** first name, last name, date
of birth; phone becomes **optional**; a required **"Reason for contact"**
dropdown is added.

## Decisions

| Question | Decision |
|---|---|
| Auth | Keep inline login (Google / Apple / magic link). Email stays verified; the `Patient` record is still reused across claimed + unclaimed clinics. |
| Consent | Keep all four tick-boxes, wording unchanged. |
| CTAs on an unclaimed profile | **Unchanged.** Keep the existing "Request Consultation" and "Request Pricing" triggers exactly as they are — only the *form* behind them is swapped to the simplified one for unclaimed clinics. |
| Analytics | New dedicated `enquiry_submitted` event (value 0). Do **not** reuse `generate_lead` — keep it out of the Google Ads conversion import. |
| Reason storage | Canonical value in new `ConsultationLead.contactReason`; the human label is **also** written into `treatment` so existing portal / email / Core-sync rendering works with no change. |
| `source` for these leads | Unchanged (`consultation` / `pricing`, whichever button was used). `isGhostLead` + a non-null `contactReason` already flag a simplified enquiry. |

## Server is the source of truth

The client `simplified` prop only drives which form renders. `/api/leads`
branches on `clinic.claimed`:

- **claimed** → current validation exactly (first/last name required). `contactReason` ignored.
- **unclaimed** → `contactReason` required + validated; first/last name optional; phone optional.

So a spoofed request can't downgrade a claimed-clinic lead or bypass the reason.

---

## Work items

### 1. Data model — `prisma/schema.prisma` + migration

`ConsultationLead`:
- add `contactReason String? @db.VarChar(80)`
- `patientName String @db.VarChar(200)` → `String?`
- `patientPhone String @db.VarChar(30)` → `String?`

Migration `prisma/migrations/20260903095700_add_contact_reason_to_leads/`. Column add
+ `MODIFY` to drop NOT NULL on the two columns. No backfill needed (existing rows
keep their values; `''` was already valid).

### 2. `src/lib/consultation-reasons.ts` (new)

```ts
export interface ContactReason { value: string; label: string }
export const CONTACT_REASONS: ContactReason[]           // placeholder list, final list TBD
export function isValidContactReason(v: unknown): v is string
export function contactReasonLabel(value: string): string
```

Placeholder values: `consultation`, `consultation_24h`. Full list pending.

### 3. Analytics — `src/lib/analytics/track.ts`

- Add `"enquiry_submitted"` to the `AnalyticsEvent` union.
- `src/lib/analytics/ga-dashboard.ts`: `enquiry_submitted` added to `COUNTED_EVENTS`
  and an `enquiries` KPI; surfaced as "Unclaimed enquiries" in
  `src/components/admin/ga-analytics-dashboard.tsx`.

### 4. Form — `src/components/consultation/`

- `consultation-form-parts.tsx` (new): extract `Field`, `IconInput`, the
  4-checkbox consent block, and the regex / `isOver18` helpers so both forms share them.
- `consultation-simple-form.tsx` (new) — `ConsultationSimpleForm`:
  email (locked when logged in) → phone (optional) → **Reason for contact** `<select>` (required)
  → same 4 consent checkboxes. No name row, no DOB. Emits `{ email, phone, contactReason }`.
  Fires `form_start` / `form_submit` with `form_name: 'enquiry'`.
- `consultation-form.tsx`: `ConsultationRichForm` unchanged apart from importing the shared parts.

### 5. Dialogs

Both dialogs keep their existing trigger button, label and `openParam`. A new
`simplified?: boolean` prop only swaps the form body.

**`src/components/tracking/request-consultation-dialog.tsx`**
- `simplified` → render `ConsultationSimpleForm` instead of `ConsultationRichForm`;
  POST body omits `firstName` / `lastName` / `dateOfBirth` / `treatment`, adds
  `contactReason`. `source` stays the button's own `leadSource`.
- On submit fire `enquiry_submitted` `{ value: 0, clinic_slug, contact_reason, page_type, clinic_claimed: false }`
  instead of `generate_lead`.

**`src/components/chat/consultation-chat-dialog.tsx`**
- New `simplified?: boolean`. An unclaimed clinic can never be "online", so the
  dialog skips the status check and goes straight to the offline lead form, which
  renders `ConsultationSimpleForm` and posts via `handleSimpleOfflineSubmit`
  (+ `enquiry_submitted`). Chat / booking phases are unreachable for these clinics.

### 6. Profile headers

- `src/components/Clinic/profile-header.tsx`: render both dialogs as today; pass
  `simplified={claimState !== 'claimed'}` to each.
- `src/components/Practitioner/profile-header.tsx`: same, keyed off the
  practitioner `claimState`.

### 7. API — `src/app/api/leads/route.ts`

- Zod: `firstName` / `lastName` `.optional()`; add `contactReason: z.string().optional()`.
  `source` enum unchanged.
- `contactReason`, if present, must pass `isValidContactReason` (else 400).
- After loading the clinic: **claimed** clinics still require `firstName` + `lastName`
  (400 if missing — a malformed full-form submission). Unclaimed clinics: names optional.
- Store: `contactReason` (canonical) + `treatment` falls back to
  `contactReasonLabel(contactReason)` (dual-write); `patientName` null when no name;
  `patientPhone` null when omitted.
- `Patient` autosave: only write `firstName` / `lastName` when provided.
- Consent rows: unchanged (still 4).
- Ghost hook: pass first name only when known.

### 8. Email — `src/lib/email.ts`

`sendGhostLeadHook`: `patientFirstName` optional → falls back to "A patient" in
subject + body when absent.

### 9. Portal / admin display

Free via the `treatment` dual-write — the reason shows wherever `treatment` renders
(portal lead card title, notification / teaser emails, Core prospect notes, admin).
Null-safety only:
- `src/lib/tracking/dashboard-queries.ts`: `mapConsultationLeadRow` row type +
  `name` / `contact` fall back to `"—"`.
- `src/app/api/portal/leads/[id]/pull-to-core/route.ts`: placeholder name when
  `patientName` is null so Core still gets a prospect.
- `lead-card.tsx` / portal API already type `patientName` as `string | null`.

### 10. Tests

- `src/lib/consultation-reasons.test.ts` — validator + label lookup. ✅
- `src/components/consultation/consultation-simple-form.test.tsx` — no name/DOB
  inputs, reason required, phone optional (rejects a bad number, allows blank),
  submit gated on all 4 consents. ✅
- `jest.setup.js` — added a `ResizeObserver` shim for Radix primitives under jsdom.
- TODO: E2E — unclaimed profile → Request Consultation / Request Pricing → login →
  simplified form → submit → confirmation.

### 11. GA-admin tasks (not code)

- Register `enquiry_submitted` + `contact_reason` / `clinic_claimed` custom
  dimensions in the GA4 property.
- Decide key-event status for `enquiry_submitted`; keep it **out** of the Google
  Ads conversion import that `generate_lead` feeds.

## Open items (non-blocking)

1. Final "Reason for contact" dropdown list.
2. The kept `age` consent says "…the person named above" — no name is shown now;
   left verbatim per the "no consent change" decision.
3. Ghost leads are still not migrated/upgraded on claim (pre-existing).
