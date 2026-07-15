# Wiki Index

Catalog of all wiki pages, by category. Update on every ingest/query that adds or renames a page.

## Entities
_(none yet)_

## Concepts
_(none yet)_

## Decisions
- [stack-and-dev-servers](decisions/2026-07-07-stack-and-dev-servers.md) — monorepo, MySQL/MAMP, dev ports (8002/3001), added contact form, CORS. ("No admin UI" call superseded by filament-admin-resources below.)
- [seo-architecture](decisions/2026-07-08-seo-architecture.md) — TR-first, per-service pages, JSON-LD, sitemap/robots, llms.txt.
- [filament-admin-resources](decisions/2026-07-08-filament-admin-resources.md) — Filament v4.11 admin CRUD for Post/Category/Tag; v3→v4 namespace map (Schema, Schemas\Components\Tabs, Actions, recordActions/toolbarActions).
- [microsite-architecture](decisions/2026-07-09-microsite-architecture.md) — per-service SEO microsites (microbladingankara.com) on shared backend; `site` column scoping, `/api/microsites/{site}/*`, Filament Site selector, isolation guard. (Item 7 "settings shared" superseded by per-site-settings below.)
- [per-site-settings](decisions/2026-07-12-per-site-settings.md) — settings now `site`-scoped (NULL=main); `Setting::forSite()`, Filament site switcher, per-site campaign bar + code injection on both microsites.
- [model-routing](decisions/2026-07-12-model-routing.md) — Fable 5 = thinking/orchestration; coding & detail always delegated to Codex 5.6 (`gpt-5.6-sol`) or Opus 4.8 (`claude -p --model opus`). Codified in CLAUDE.md §5.

## Issues
- [mikroblading-seo-geo-audit](issues/2026-07-12-mikroblading-seo-geo-audit.md) — 2026-07-12 audit: fixed missing H1 (Section `as="h1"`) + api-docs noindex; open owner blockers (gallery photos, real NAP, reviews→AggregateRating, launch/GSC).

## Syntheses
- [seo-geo-topic-strategy](syntheses/2026-07-12-seo-geo-topic-strategy.md) — 2026-07-12: query universe → page map for all 3 sites; gaps → lanes (kastasarimi tech fixes, mikroblading topical expansion, main-site GEO infra + 6 blog posts).

## Raw sources
- [stria-studio-design](raw/stria-studio-design.md) — imported Minimal design: tokens, bilingual copy, services, image URLs.
