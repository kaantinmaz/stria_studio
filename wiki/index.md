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
- [microsite-architecture](decisions/2026-07-09-microsite-architecture.md) — per-service SEO microsites (mikrobladingankara.com) on shared backend; `site` column scoping, `/api/microsites/{site}/*`, Filament Site selector, isolation guard.

## Issues
- [mikroblading-seo-geo-audit](issues/2026-07-12-mikroblading-seo-geo-audit.md) — 2026-07-12 audit: fixed missing H1 (Section `as="h1"`) + api-docs noindex; open owner blockers (gallery photos, real NAP, reviews→AggregateRating, launch/GSC).

## Syntheses
_(none yet)_

## Raw sources
- [stria-studio-design](raw/stria-studio-design.md) — imported Minimal design: tokens, bilingual copy, services, image URLs.
