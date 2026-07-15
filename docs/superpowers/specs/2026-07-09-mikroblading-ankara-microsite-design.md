# Mikroblading Ankara — SEO Microsite (Design Spec)

**Date:** 2026-07-09
**Status:** Approved
**Location:** `mikroblading_ankara/` (new Next.js app), shared Laravel backend under `backend/`.

## 1. Goal

Stand up `microbladingankara.com`: a **single-service, Turkish-only SEO microsite** for microblading / kaş tasarımı in Ankara. It must rank in both classic search (Google) and AI answer engines (ChatGPT, Perplexity, Google AI Overviews, Claude). It is the **first of many** per-service microsites; the backend design must scale to N sites without duplication.

Deliverables:
1. Standalone Next.js app (SSG/ISR) with full page set.
2. Shared-backend content scoping (`site` column) + Filament admin support + site-scoped public API.
3. Full SEO + AI-search (AEO/GEO) layer.
4. Blog (list + post) fed from the shared backend.
5. API documentation: `openapi.yaml` → in-site `/api-docs` page + `docs/API.md`.

## 2. Architecture

```
microbladingankara.com  (Next.js 16, App Router, Tailwind 4, TS)   <-- new app in mikroblading_ankara/
        |  HTTP (build-time fetch + ISR revalidate)
        v
shared Laravel backend (backend/)   <-- one CMS + admin for ALL microsites
        /api/microsites/mikroblading-ankara/{service,posts,faqs,gallery,settings,contact}
        v
MySQL (stria_studio)  --  content rows scoped by `site` column (null = main site)
```

- **Separate app, not multi-tenant.** Justification: separate domains, SEO isolation, and the repo already mirrors `frontend`/`backend` to standalone repos via `scripts/sync-repos.sh` — a microsite fits that model.
- **Rendering:** SSG for all pages; ISR `revalidate` (e.g. 3600s) so content edits in admin appear without a redeploy. No client-side data fetching for primary content (SEO + CWV).
- **No new backend, no new DB.** Reuse existing models, tables, contact + analytics (`/track`).

## 3. Backend changes (shared Laravel)

### 3.1 Migration
Single migration adds a **nullable, indexed `site` VARCHAR(64)** column to:
- `posts`, `faqs`, `gallery_images` — content scoping
- `leads` — so contact submissions record which microsite produced them

`null` = main Stria site (unchanged behavior). Microsite rows carry `site = 'mikroblading-ankara'`.

The pinned service is resolved by existing `services.slug` (e.g. `microblading`) — no new column needed there; the microsite config maps `site -> service slug`.

### 3.2 Public API (site-scoped, read-only + contact)
New controller `MicrositeController` (or route group reusing existing controllers with a `site` filter). Routes in `routes/api.php`:

| Method | Path | Returns |
|---|---|---|
| GET | `/api/microsites/{site}/service` | pinned Service detail (by mapped slug) |
| GET | `/api/microsites/{site}/posts` | published posts where `site={site}` (paginated) |
| GET | `/api/microsites/{site}/posts/{slug}` | single post (scoped) |
| GET | `/api/microsites/{site}/faqs` | FAQs where `site={site}` |
| GET | `/api/microsites/{site}/gallery` | gallery images where `site={site}` |
| GET | `/api/microsites/{site}/settings` | site settings: NAP, phone, WhatsApp, map URL, hours, reviews |
| POST | `/api/microsites/{site}/contact` | create Lead tagged with `site` (throttled) |

- `{site}` validated against an allow-list (config `config/microsites.php`) so arbitrary values can't probe data.
- Existing main-site endpoints (`/api/posts`, `/api/faqs`, etc.) must keep returning **only** main-site rows (`site IS NULL`) — a global scope or explicit `whereNull('site')` on those queries. **This is a behavior change to guard against: microsite rows must not leak into the main site.**

### 3.3 Filament admin
- Add a `Site` `Select` field (options from `config/microsites.php` + "Main site" = null) to `PostForm`, `FaqForm`, `GalleryImageForm`.
- Add a `site` column + `SelectFilter` to `PostsTable`, `FaqsTable`, `GalleryImagesTable`.
- Settings: microsite NAP/phone/etc. stored as `site`-prefixed keys in the existing `settings` table (e.g. `mikroblading-ankara.phone`) OR a small dedicated section — keep it in `settings` to avoid new tables.

## 4. Pages (Turkish only)

| Route | Type | Purpose / primary keywords |
|---|---|---|
| `/` | SSG+ISR | Landing. "mikroblading ankara", "kaş tasarımı ankara". Hero, mikroblading nedir, kimler için, süreç adımları, öncesi/sonrası önizleme, fiyat aralığı, yorumlar, SSS önizleme, harita, CTA (ara / WhatsApp / form). |
| `/mikroblading-fiyatlari` | SSG | High-intent: "mikroblading fiyatları ankara". Fiyat tablosu, neyi kapsar, taksit, CTA. |
| `/mikroblading-nasil-yapilir` | SSG | AEO: "mikroblading nasıl yapılır". Adım adım süreç, iyileşme, bakım — answer-first. |
| `/galeri` | SSG+ISR | Öncesi–sonrası galeri (from gallery API). |
| `/blog` | SSG+ISR | Blog listesi (from posts API). |
| `/blog/[slug]` | SSG+ISR | Blog yazısı + BlogPosting schema. |
| `/sss` | SSG+ISR | Tam SSS (from faqs API) + FAQPage schema. |
| `/hakkimizda` | SSG | E-E-A-T: uzman/uygulayıcı deneyimi, sertifikalar, hijyen — trust signals for both Google and LLMs. |
| `/iletisim` | SSG | İletişim formu (POST contact), NAP, gömülü Google Harita, WhatsApp, çalışma saatleri. |
| `/api-docs` | SSG | Rendered from `openapi.yaml`. |

**Deferred (not built now):** district pages `/mikroblading-<ilçe>`, EN locale.

## 5. SEO + AI-search layer

### 5.1 Structured data (JSON-LD, per page)
- **Global:** `BeautySalon`/`LocalBusiness` with NAP, `geo`, `openingHoursSpecification`, `sameAs`, `priceRange`, `AggregateRating`.
- `/` and service landings: `Service` + `BreadcrumbList`.
- `/sss` and FAQ previews: `FAQPage`.
- `/blog/[slug]`: `BlogPosting` (author, datePublished, image).
- Reuse the pattern in `frontend/components/JsonLd.tsx` + `schema.ts`.

### 5.2 Answer-engine (AEO/GEO)
- Question-form H2/H3 headings; **answer-first** short paragraph under each, then detail.
- Extractable structures: pricing **table**, definition lists, numbered process steps — the formats LLMs quote.
- `/llms.txt` at site root: concise site map + key facts for AI crawlers.
- Clean semantic HTML, one `<h1>` per page, descriptive alt text.

### 5.3 Technical SEO
- `app/sitemap.ts`, `app/robots.ts` — robots **allows AI bots** (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) plus standard crawlers.
- Canonical URLs, `metadata` (title/description/OpenGraph/Twitter) per page via Next Metadata API.
- Geo meta (`geo.region=TR-06`, placename Ankara), `lang="tr"`.
- Fast: static, optimized images (`next/image`), minimal JS.

### 5.4 Local SEO
- Consistent NAP across footer, contact, JSON-LD.
- Embedded Google Map, Ankara geo signals, WhatsApp click-to-chat.

Apply the `ai-seo`, `schema`, `site-architecture`, and `copywriting` skills during implementation.

## 6. API documentation

- `mikroblading_ankara/openapi.yaml` — OpenAPI 3.1 describing the `/api/microsites/{site}/*` endpoints (single source of truth).
- `/api-docs` page renders it (human-readable). Machine-readable file also served (so tools/AI can consume it).
- `docs/API.md` — committed prose copy.

## 7. Components (mirror `frontend/` patterns, TR content)

Nav, Footer, Hero, WhatsAppFab, ContactForm, Gallery, BlogList, PostBody, Faq, Breadcrumbs, JsonLd, StudioMap, `lib/seo.ts`, `lib/content.ts` (API client), `lib/site.ts` (NAP/config constants).

## 8. Success criteria (verification)

- Backend: migration runs; `GET /api/microsites/mikroblading-ankara/*` returns scoped data; main-site endpoints still return only main rows; Filament shows Site field/filter.
- Frontend: `next build` succeeds; every route renders; JSON-LD validates (Rich Results shape); `sitemap.xml`, `robots.txt`, `llms.txt` present; contact form POSTs a site-tagged lead; Lighthouse SEO ~100.
- API docs: `/api-docs` renders from `openapi.yaml`.

## 9. Out of scope / risks

- **Risk:** main-site queries leaking microsite rows — mitigated by explicit `whereNull('site')` / global scope; must be tested.
- **Risk:** duplicate-content penalties across microsites — mitigated by unique per-site copy (no boilerplate reuse of body text).
- Deferred: district landing pages, EN locale, per-site separate DB.
