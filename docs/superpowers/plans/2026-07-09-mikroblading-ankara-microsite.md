# Mikroblading Ankara Microsite — Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans. Steps use `- [ ]` checkboxes.

**Goal:** Ship `mikrobladingankara.com` — a TR-only, single-service SEO/AEO microsite fed by the shared Laravel backend, with blog, API docs, and full structured data.

**Architecture:** Standalone Next.js 16 app in `mikroblading_ankara/` (SSG + ISR), reads site-scoped content from the shared Laravel backend. New `site` column scopes blog/FAQ/gallery/leads; existing main-site endpoints guarded to `site IS NULL`. API described by committed `openapi.yaml` → `/api-docs`.

**Tech Stack:** Next.js 16, React 19, Tailwind 4, TypeScript; Laravel 13 + Filament 4; MySQL.

## Global Constraints
- Turkish only. `lang="tr"`, `locale=tr_TR`.
- `site` slug for this microsite: `mikroblading-ankara`. Pinned service slug: `microblading`.
- Same physical business as main site (Stria Studio, Ankara) → NAP/hours are shared (reuse Setting row).
- Microsite content must NOT leak into the main site and vice-versa.
- Match existing code patterns (JsonResource, `api()` client with `revalidate`, `buildMetadata`, `JsonLd`).
- Resilient: pages render with fallback copy if backend is down (build must not fail).

---

## Phase A — Backend (shared Laravel)

### Task A1: `site` column migration
**Files:** Create `backend/database/migrations/2026_07_09_000010_add_site_to_content_tables.php`
- Add nullable indexed `string('site', 64)` to `posts`, `faqs`, `gallery_images`, `leads`.
- [ ] Write migration (up: add column+index on each; down: drop).
- [ ] `php artisan migrate` — expect 4 tables altered.

### Task A2: Models fillable + config allow-list
**Files:** Modify `Post.php` ($fillable + 'site'), `Lead.php` ($fillable + 'site'); Faq/GalleryImage use `$guarded=['id']` (no change). Create `backend/config/microsites.php`.
- `config/microsites.php` returns `['mikroblading-ankara' => ['service' => 'microblading', 'name' => 'Mikroblading Ankara']]`.
- [ ] Edit models, add config.

### Task A3: Guard main-site endpoints
**Files:** Modify `BlogController.php`, `FaqController.php`, `GalleryController.php` — add `->whereNull('site')` so main site never shows microsite rows.
- [ ] Edit 3 controllers. Verify `/api/posts` etc. exclude scoped rows.

### Task A4: MicrositeController + routes
**Files:** Create `app/Http/Controllers/MicrositeController.php`; modify `routes/api.php`.
- Methods: `service`, `posts`, `post`, `faqs`, `gallery`, `settings`, `contact`. Resolve `{site}` against `config('microsites')`, 404 if unknown. Reuse existing Resources.
- Routes group `prefix('microsites/{site}')`; contact throttled.
- [ ] Implement + register routes.

### Task A5: Seed microsite content
**Files:** Create `database/seeders/MicrositeSeeder.php`; register in `DatabaseSeeder`. Ensure `microblading` service exists.
- Seed ~4 FAQs, ~6 blog posts (real SEO copy), ~6 gallery rows, all `site='mikroblading-ankara'`.
- [ ] Write seeder, run it.

**Verify Phase A:** `curl /api/microsites/mikroblading-ankara/{service,posts,faqs,gallery,settings}` returns scoped data; `curl /api/posts` excludes microsite rows; `phpunit` green.

---

## Phase B — Frontend app scaffold

### Task B1: Project files
**Files:** `mikroblading_ankara/`: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`, `.env.local.example`, `app/globals.css`.
- Copy proven configs from `frontend/`; set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE`.
- [ ] Create files; `npm install`.

### Task B2: lib
**Files:** `lib/site.ts` (config + NAP + keyword constants), `lib/content.ts` (scoped `api()` client: getService/getPosts/getPost/getFaqs/getGallery/getSettings), `lib/seo.ts` (`buildMetadata`, `absUrl`), `lib/schema.ts` (BeautySalon/Service/FAQ/BlogPosting/Breadcrumb JSON-LD), `lib/copy.ts` (TR landing-page copy).
- [ ] Implement, mirroring frontend types.

### Task B3: Core components
**Files:** `components/`: `Nav`, `Footer`, `Hero`, `WhatsAppFab`, `Analytics`, `JsonLd`, `Breadcrumbs`, `ImageSlot`, `Icons`, `Section`, `CTA`, `ContactForm`, `Gallery`, `BlogList`, `PostBody`, `Faq`, `StudioMap`, `Reviews`, `PricingTable`, `ProcessSteps`, `TrustBar`.
- TR hardcoded, no i18n provider. Reuse frontend visual patterns.
- [ ] Implement.

### Task B4: layout
**Files:** `app/layout.tsx` — Jost font, metadataBase, default TR metadata, BeautySalon JSON-LD, Nav/Footer/WhatsAppFab/Analytics.
- [ ] Implement.

---

## Phase C — Pages

### Task C1: Landing `/`
Hero, mikroblading nedir (answer-first), kimler için, süreç, öncesi/sonrası önizleme, fiyat aralığı, yorumlar, SSS önizleme (FAQPage), harita, CTA. Service+Breadcrumb JSON-LD.

### Task C2: `/mikroblading-fiyatlari` + `/mikroblading-nasil-yapilir`
High-intent + AEO landings with pricing table / step list, FAQ schema.

### Task C3: `/galeri`, `/blog`, `/blog/[slug]`, `/sss`
API-fed with empty-state fallbacks. BlogPosting + FAQPage schema. `generateStaticParams` for posts.

### Task C4: `/hakkimizda`, `/iletisim`
E-E-A-T trust page; contact form (scoped POST) + map + NAP.

### Task C5: `/api-docs` + `openapi.yaml`
`public/openapi.yaml` (source of truth) + rendered docs page + `docs/API.md`.

### Task C6: SEO plumbing
`app/robots.ts` (allow AI bots: GPTBot, ClaudeBot, PerplexityBot, Google-Extended), `app/sitemap.ts`, `app/llms.txt/route.ts`, favicon/OG.

**Verify Phase C:** `npm run build` succeeds; every route renders; JSON-LD present in HTML; `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/openapi.yaml` served; contact POST creates site-tagged lead.

---

## Self-Review (coverage)
Spec §3 → Phase A. §4 pages → Phase C. §5 SEO/AEO → B2(schema)+C6+per-page. §6 API docs → C5. §7 components → B3. All covered.
