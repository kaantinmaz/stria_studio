# Design: Site Settings CMS — Phase 2

**Date:** 2026-07-08
**Status:** Approved (design), Phase 2 of 3. (Phase 1 services = merged; Phase 3 = Gallery + Home FAQ.)

## Goal

Move the studio's business/contact settings from `frontend/lib/site.ts` into a DB
singleton, editable via a Filament settings screen, served by a public API, and
consumed by the frontend via a `SettingsProvider`. No behavior change for the
current placeholder values.

## Decisions (locked)

- **In DB (owner-editable):** phone, phone (local), WhatsApp, Instagram (+handle),
  address, NAP (street/locality/region/postal/country), geo (lat/lng), working
  hours (structured).
- **Stays in code/env (config):** `apiUrl` (env — frontend needs it to reach the
  API), `siteUrl` (canonical/OG/schema base — build/server config), `gbpUrl`.
- **Hours = structured** (`[{days[], open, close}]`) → drives schema.org
  `openingHoursSpecification` AND a derived bilingual display string.

## Non-goals

- Gallery, home FAQ (Phase 3). Homepage marketing copy stays in `lib/i18n`.
- No siteUrl/apiUrl in DB.

---

## Data model

`settings` — single row (id=1).
- `phone` (string) — intl display, e.g. `+90 507 732 30 26`
- `phone_local` (string) — local display for the call CTA, e.g. `0507 732 30 26`
- `whatsapp` (string) — full wa.me URL
- `instagram` (string) — full profile URL
- `instagram_handle` (string) — e.g. `@striastudio`
- `address` (string) — short display address
- `street_address`, `locality`, `region`, `postal_code`, `country` (string) — NAP
- `lat`, `lng` (decimal 10,7)
- `hours` (json) — `[{ "days": ["Monday",...], "open": "10:00", "close": "19:00" }]`
- `timestamps`

`Setting` model: `hours` cast `array`; a `Setting::current()` helper returning the
single row (first-or-create). `$guarded = ['id']`.

`phoneHref` is **derived** on the frontend (`tel:` + digits of `phone`), not stored.

---

## Backend

### Filament settings screen
A single-record editor. Implementation checkpoint (v4.11):
- **Preferred:** a custom Filament Page (`ManageSettings`) with a form (statePath
  `data`), `mount()` fills from `Setting::current()`, `save()` persists. Needs a
  small blade view.
- **Fallback** (if the custom-page+form pattern is fiddly in v4.11): a
  `SettingResource` whose list has exactly one row and links straight to Edit.
Pick whichever boots cleanly; record the choice. Form groups: İletişim (phone,
phone_local, whatsapp, instagram, instagram_handle, address), Adres/NAP
(street/locality/region/postal/country), Konum (lat, lng), Çalışma Saatleri
(repeater: days multi-select, open, close).

### Seeder `SettingSeeder`
Imports the current `site.ts` values (phone/phone_local/wa/ig/handle/address/nap/
geo/hours) into row id=1 (`updateOrCreate(['id'=>1], [...])`). Idempotent.

### Public API
`GET /api/settings` → `{ data: { ...all settings fields... } }` via
`SettingResource`. Public read. Single object (not a list).

---

## Frontend

### `lib/content.ts` (extend)
- Type `Settings` (matches API).
- `getSettings(): Promise<Settings | null>` (server fetch, ISR 300, safe fallback).
- `phoneHref(phone: string): string` = `"tel:" + phone.replace(/[^\d+]/g, "")`.
- `formatHours(hours, lang): string` — bilingual display from structured hours
  (day-name map TR/EN; e.g. `Pzt – Cmt · 10:00 – 19:00`).

### `components/SettingsProvider.tsx`
Client context fed by a layout server fetch; `useSettings(): Settings`. Because a
missing API must not break the shell, the provider is given a **non-null fallback
object** (seeded defaults) so consumers always get values.

### `layout.tsx`
`const settings = await getSettings()` → provide via `<SettingsProvider>` (next to
`ServicesProvider`, inside `LanguageProvider`). Fetch settings + services in
parallel.

### Consumer rewire (site.* → useSettings/settings)
| File | Fields |
|---|---|
| `Nav.tsx` | phone, phoneHref, ig, wa |
| `Footer.tsx` | address, phone, phoneHref, ig, instagram_handle, wa |
| `Hero.tsx` | wa, phoneHref |
| `Contact.tsx` | wa, phoneHref, phone |
| `ServicePage.tsx` | wa, phoneHref (server → pass settings in, or read via a server `getSettings()`) |
| `CallLabel.tsx` | phone_local |
| `WhatsAppFab.tsx` | wa (currently server component — make it read settings: either client+useSettings, or keep server + fetch) |
| `StudioMap.tsx` | lat, lng (server component → read via getSettings or props) |
| `schema.ts` `beautySalonSchema()` | nap, geo, phoneHref, hours, ig, (gbpUrl stays config) — server, `await getSettings()` |
| `i18n` `barLoc`/`barHours` | Nav's contact bar: `barLoc` → settings.address; `barHours` → `formatHours(settings.hours, lang)`. Remove these two derived strings from the i18n dict (they now come from settings). |
| `ContactForm.tsx` | keeps `site.apiUrl` (config, unchanged) |

Server components that need settings (`schema.ts`, `WhatsAppFab`, `StudioMap`,
`beautySalonSchema` caller in `layout.tsx`) fetch via `getSettings()`; client
components use `useSettings()`.

### `lib/site.ts` cleanup
Keep `apiUrl`, `siteUrl`, `gbpUrl`. Remove the migrated fields (phone, phone_local,
phoneHref, wa, ig, igHandle, address, nap, geo, hours). Update importers.

---

## Guardrails

- Current placeholder/real values seeded → site renders identically after switch.
- `beautySalonSchema` must keep emitting the same LocalBusiness shape (telephone,
  address, geo, openingHoursSpecification, sameAs) — now from DB.
- Contact bar (`barHours`/`barLoc`) still shows in both languages (via
  `formatHours` + `address`).
- `phoneHref` derivation must yield `tel:+905077323026` from `+90 507 732 30 26`.

## Risks

1. **Filament singleton UI** in v4.11 (custom page vs single-record resource) —
   checkpoint with fallback.
2. **Wide rewire** — many components read `site.*`; `SettingsProvider` (+ server
   `getSettings()` for server comps) contains it. Non-null fallback avoids a blank
   shell if the API is down.
3. **Bilingual hours formatting** — `formatHours` needs a correct TR/EN day-name
   map and range compaction (consecutive days → "Pzt – Cmt").

## Decomposition (tasks)
1. `settings` migration + `Setting` model (+ `current()`) + factory (TDD).
2. `SettingSeeder` (import site.ts values).
3. Settings API (`GET /api/settings`) + resource (TDD).
4. Filament settings screen (checkpoint).
5. `lib/content` getSettings + `phoneHref` + `formatHours` + `SettingsProvider` + layout wiring.
6. Rewire client consumers (Nav, Footer, Hero, Contact, CallLabel, WhatsAppFab client-ize).
7. Rewire server consumers (schema.ts, StudioMap, WhatsAppFab if server) + barHours/barLoc.
8. Cleanup `site.ts` + full verification (site renders identically; schema intact; both langs).
