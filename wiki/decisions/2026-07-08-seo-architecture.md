# Decision: SEO architecture (TR-first, per-service pages)

**Date:** 2026-07-08

## Context
Goal: rank on Google + AI search for every service group. The original site was a single page with a client-side EN toggle — structurally unable to rank for 7 distinct service queries, and EN content wasn't even in the HTML.

## Decisions
- **TR is the SEO target; EN stays a cosmetic client toggle** (not indexed, no `/en`, no hreflang). Ankara locals search in Turkish; EN has negligible local demand.
- **Per-service indexable pages** at `/hizmetler/<slug>` (7) + a `/hizmetler` hub, rendered from one dynamic route + `lib/services.ts` data. Slugs: `microblading`, `kas-pudralama`, `eyeliner`, `dipliner`, `dudak-renklendirme`, `kas-laminasyon`, `kirpik-lifting`. `dynamicParams = false` → only these 7 build; unknown slugs 404.
- **Structured data** (server-rendered JSON-LD, so crawlers/AI see it): `BeautySalon` site-wide (layout), `Service` + `FAQPage` + `BreadcrumbList` per service page, `FAQPage` on home.
- **Crawl infra:** native `app/sitemap.ts` (9 URLs) + `app/robots.ts`; per-page `generateMetadata` (title/desc/canonical/OG). `buildMetadata` uses `title.absolute` to avoid double-branding against the layout title template.
- **AI search:** `public/llms.txt` + home & per-service FAQ, answer-first copy.
- **Perf:** hero image gets `priority` (LCP); `next/image` auto-serves WebP/AVIF from the PNG source.
- **Schema source of truth:** NAP/geo/hours/domain live in `frontend/lib/site.ts` (placeholders) — owner edits one file.

## Consequences
- Content: 7 services' TR copy authored in `lib/services.ts` with the copywriting + ai-seo skills.
- Internal linking: nav mega-menu, footer, and home cards now point to `/hizmetler/<slug>`; cross-page nav anchors use `/#...` so they work from service pages.
- Owner must set the real domain (`site.siteUrl`), address, geo, phone, and Google Business Profile URL before launch, and set up Google Search Console + GBP.

## Sources
[[stria-studio-design]] · docs/superpowers/plans/2026-07-08-stria-seo-overhaul.md · [[stack-and-dev-servers]]
