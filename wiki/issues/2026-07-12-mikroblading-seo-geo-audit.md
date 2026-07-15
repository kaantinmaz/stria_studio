# Issue: mikroblading_ankara SEO/GEO audit — pre-launch blockers

**Date:** 2026-07-12
**Status:** Code-side clean (fixes shipped). Remaining items are owner-data-gated.

## What was audited

Full SEO/GEO audit of `mikroblading_ankara/` (target: Google + AI answer engines), run as a **real local crawl**: MySQL(8889) + backend(8002) + `next build && next start`(3001), crawler over the sitemap capturing status, title/desc, canonical, robots meta, H1/H2, JSON-LD @types, img alt, internal-link 404s. Domain `microbladingankara.com` does **not** resolve yet → live SERP / AI-answer benchmarking is impossible pre-launch; the benchmark is the local crawl + per-query answer-readiness mapping.

Strong already: crawlability (robots allows AI bots, blocks CCBot), self-canonicals, unique in-range titles/descriptions, full JSON-LD (BeautySalon/Service/FAQPage/HowTo/Breadcrumb/BlogPosting), answer-first copy, internal linking (no orphans), llms.txt w/ machine-readable pricing, geo meta, `/og`. hreflang correctly absent (TR-only, see [[decisions/2026-07-08-seo-architecture]]).

## Fixed (code)

1. **Missing `<h1>` on 6/15 pages** (galeri, blog, sss, hakkimizda, iletisim, api-docs). Root cause: `Section` hardcoded its heading as `<h2>`. Fix: `Section` got an `as?: "h1"|"h2"` prop (default `h2`); the 6 pages that use a Section as their **primary** heading now pass `as="h1"`. Verified crawl: H1 coverage 9/15 → 15/15, each exactly one.
   - **Convention (recurring gotcha):** any new page whose main title comes from `<Section heading=...>` MUST pass `as="h1"`, else the page ships with no H1.
2. **`/api-docs` thin + indexed** → `robots: noindex, follow` + removed from `sitemap.ts` (kept in footer for humans). Verified: meta present, sitemap 15→14 URLs, other pages still `index,follow`.

## Open — owner action (block ranking; NOT code-fixable)

1. **Gallery empty** — `gallery_images.image = NULL` ×6 (alt text written). `/galeri` + home gallery render placeholders, no `<img>`. Upload real before/after photos in Filament (site = `mikroblading-ankara`). High impact for local "öncesi sonrası" intent.
2. **NAP placeholders** — `settings.street_address` = "[Mahalle] Cd. No: 00", `postal_code` 06000. Weakens LocalBusiness schema + GBP/citation consistency. Set real address in admin.
3. **No AggregateRating/Review schema** despite "4,9/5" + testimonials shown. Do **not** add schema over seed testimonials (Google policy risk). Add only once real, attributable reviews exist.
4. **Launch setup** — set real domain DNS, Google Business Profile URL (`site.gbpUrl`), Google Search Console + Bing Webmaster, submit sitemap. Then re-run true SERP/AI-answer benchmark.

## Deliberately skipped

- `/pricing.md` — `llms.txt` already serves machine-readable pricing; no duplicate.
- Dedicated `/kas-pudralama` page — secondary intent covered by comparison blog + pricing row; YAGNI for a mikroblading-focused microsite.

## Sources

Crawl harness + R1/R2/R3 JSON in session scratchpad. Code: `mikroblading_ankara/components/Section.tsx`, `app/{sss,hakkimizda,galeri,blog,iletisim,api-docs}/page.tsx`, `app/sitemap.ts`. Builds on [[decisions/2026-07-09-microsite-architecture]], [[decisions/2026-07-08-seo-architecture]].
