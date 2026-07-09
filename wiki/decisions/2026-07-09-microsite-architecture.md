# Decision: Per-service SEO microsites on the shared backend

**Date:** 2026-07-09
**Status:** Accepted (first instance built: `mikrobladingankara.com`)

## Context

Beyond the main Stria Studio site, the owner is launching **one SEO microsite per service** on its own exact-match domain (first: `mikrobladingankara.com` for microblading / kıl tekniği kaş). Goal: rank in both classic Google search and AI answer engines (ChatGPT, Perplexity, AI Overviews) for a single, tightly-focused topic + locality.

## Decision

1. **Separate Next.js app per microsite**, sibling of `frontend/` (first one in `mikroblading_ankara/`). Not multi-tenant — justified by separate domains, SEO isolation, and the existing `scripts/sync-repos.sh` mirror model. TR-only, SSG + ISR (`revalidate: 3600`).
2. **Shared Laravel backend as the single CMS** for all microsites. Content is scoped by a nullable, indexed **`site` column** on `posts`, `faqs`, `gallery_images`, `leads` (`NULL` = main site).
3. **Site registry** in [`backend/config/microsites.php`](../../backend/config/microsites.php): slug → `{ name, service, url }`. Unknown slugs are rejected (404).
4. **Public API** `GET|POST /api/microsites/{site}/{service,posts,posts/{slug},faqs,gallery,settings,contact}` via `MicrositeController`. Reuses existing API Resources. Contact creates a `site`-tagged `Lead`.
5. **Isolation guard**: main-site endpoints (`/api/posts`, `/api/faqs`, `/api/gallery`) now add `whereNull('site')` so microsite rows never leak into the main site (and vice-versa). Verified: main `/posts`=1, microsite `/posts`=6.
6. **Filament admin**: a `Site` `Select` + column + `SelectFilter` on Post/Faq/GalleryImage. One admin manages every site.
7. **Settings are shared** — same physical business (Stria Studio, Çankaya) — so `/microsites/{site}/settings` returns `Setting::current()` (same NAP/hours as main).

## SEO / AEO layer (per microsite)

JSON-LD (`BeautySalon`, `Service`, `FAQPage`, `HowTo`, `BlogPosting`, `BreadcrumbList`); answer-first content with question-form headings; extractable pricing/comparison tables; `robots.ts` allows AI bots (GPTBot/ClaudeBot/PerplexityBot/Google-Extended) and blocks CCBot; `/llms.txt` manifest (with machine-readable pricing); `sitemap.ts`, canonical, OpenGraph, geo meta. Builds on [[decisions/2026-07-08-seo-architecture]].

## Consequences

- New microsite = add a config key + copy the Next app (change `NEXT_PUBLIC_SITE`, `lib/site.ts`, `lib/copy.ts`) + tag content in admin. No backend duplication.
- Content-scoping via a string column keeps schema simple but relies on every main-site query remembering `whereNull('site')` — a future regression risk (candidate for a global scope if it grows).
- API is documented by a committed `openapi.yaml` → in-site `/api-docs` + `docs/API.md`.

## Sources

- Design spec: `docs/superpowers/specs/2026-07-09-mikroblading-ankara-microsite-design.md`
- Implementation plan: `docs/superpowers/plans/2026-07-09-mikroblading-ankara-microsite.md`
- Code: `mikroblading_ankara/`, `backend/app/Http/Controllers/MicrositeController.php`, `backend/config/microsites.php`
