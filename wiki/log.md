# Wiki Log

Append-only timeline. Newest at top. One line per operation: `YYYY-MM-DD — OP — summary`.

- 2026-07-08 — BUILD — Task B4: Filament v4.11 admin resources (Post/Category/Tag) under backend/app/Filament/Resources. Documented v3→v4 namespace map (Schema, Schemas\Components\Tabs, Utilities\Set, Actions, recordActions/toolbarActions) since generator output differs from generic Filament docs/briefs. Seeded demo category/tag/published post. Verified: php -l clean, route:list shows admin/{posts,categories,tags}, curl 302 not 500, filament:optimize-clear clean. Added decisions/2026-07-08-filament-admin-resources (supersedes "No admin UI" call in stack-and-dev-servers). Commit 76bbf16.
- 2026-07-08 — BUILD — SEO overhaul: TR-first architecture, 7 per-service pages + /hizmetler hub, JSON-LD (BeautySalon/Service/FAQ/Breadcrumb), sitemap.ts/robots.ts, per-page metadata+canonical+OG, llms.txt, home & service FAQ, hero LCP priority, internal linking. Plan: docs/superpowers/plans/2026-07-08-stria-seo-overhaul.md. Verified: build + per-route h1/title/canonical/schema.
- 2026-07-07 — BUILD — Nav "Hizmetler" → mega-menu dropdown (full service list + featured Microblading); Footer → 4-column detailed (brand+social, services, explore, contact+CTA). Installed 5 marketing skills to .claude/skills/ (seo-audit, site-architecture, schema, ai-seo, copywriting) with reference files.
- 2026-07-07 — BUILD — Scaffolded Next.js frontend + Laravel backend; ported Minimal design (7 sections, TR/EN, appointment form → leads). Verified: build passes, POST /api/contact inserts leads, CORS OK. Added decisions/2026-07-07-stack-and-dev-servers.
- 2026-07-07 — INGEST — Added raw/stria-studio-design.md (Minimal design source); downloaded 5 studio images to frontend/public/images.
- 2026-07-07 — SETUP — Wiki scaffold created (schema, index, log, prompts, empty category folders).
