# Decision: Per-site settings (one admin, every site)

**Date:** 2026-07-12
**Status:** Accepted. Supersedes item 7 of [[decisions/2026-07-09-microsite-architecture]] ("Settings are shared").

## Context

Settings (NAP, hours, geo) were a single shared row — `Setting::current()` = `firstOrCreate(['id' => 1])` — reused by the main site and every microsite, on the rationale "same physical business." Since then, settings gained **campaign bar** (`campaign_enabled`, `campaign_text_tr/en`) and **code injection** (`header_code`, `footer_code`) fields — both inherently per-domain (each microsite has its own promo and its own analytics/GTM/pixel). A shared row couldn't express that, and the owner wanted every site — settings included — managed from the single `/backend` Filament admin.

## Decision

Settings are now **scoped by the same `site` column pattern** used for posts/faqs/gallery/leads (NULL = main site).

1. **DB** (`add_site_to_settings`): nullable, unique `site` column. Existing row → main (NULL). Migration seeds one row per `config('microsites')` slug, **copied from the main row** so each site starts identical to the old shared values, then diverges as edited.
2. **Model**: `Setting::forSite(?string $site)` = `firstOrCreate(['site' => $site])`; `Setting::current()` = `forSite(null)` (main). Backward compatible.
3. **API**: `MicrositeController::settings($site)` → `Setting::forSite($site)`; main `SettingController` → `current()`. Verified: main / mikroblading / kas-tasarimi return independent rows.
4. **Filament** `ManageSettings`: a **site switcher** `Select` (`editing_site`, `dehydrated(false)` so it never writes the `site` column) loads/saves the chosen site's row. One admin edits every site's full settings (all tabs).
5. **Frontends**: both microsites (`mikroblading_ankara`, `kastasarimi`) now consume the per-site **campaign bar** (dismissible, TR-only, in-flow above the sticky Nav) and **code injection** (server-rendered `dangerouslySetInnerHTML` for header/footer, mirroring `frontend/`). `getSettings()` cache dropped to 300s so admin toggles appear ~live. The main `frontend/` already consumed these.

## Consequences

- Owner edits NAP once per site (3 rows). Seeded copies avoid empty microsite NAP. If the studio moves, each site is updated independently.
- `header_code`/`footer_code` are raw, unescaped, admin-only (analytics/pixels). HTML comments are stripped by Next's production minifier; real `<script>` injection survives (verified).
- Every main-site query that reads settings must keep using `current()` (main), never a bare `first()`.

## Verification

Backend suite green (29 tests). `PerSiteSettingsTest`: API isolation + Filament switcher saves only the selected site (no `site`-column leak). Both microsites built + served: per-site campaign text and `header/footer` scripts render and do **not** cross-contaminate (`__HDR_MIKRO` absent on kastasarimi and vice-versa).

## Sources

Code: `backend/app/Models/Setting.php`, `backend/app/Http/Controllers/MicrositeController.php`, `backend/app/Filament/Pages/ManageSettings.php`, `backend/database/migrations/2026_07_12_000001_add_site_to_settings.php`, `{mikroblading_ankara,kastasarimi}/{lib/content.ts,app/layout.tsx,components/Nav.tsx}`. Builds on [[decisions/2026-07-09-microsite-architecture]].
