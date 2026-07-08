# Design: Galeri / Hakkımızda / İletişim pages + Blog subsystem

**Date:** 2026-07-08
**Status:** Approved (design), pending implementation plan

## Goal

Add three standalone pages (Galeri, Hakkımızda, İletişim) and a full SEO blog
with an owner-editable admin, to the existing Stria Studio site (Next.js frontend
+ Laravel API). Bilingual TR/EN, matching the site's existing client-toggle i18n.

## Decisions (locked)

- **Blog content:** Laravel DB + Filament admin panel (owner self-publishes).
- **Three pages:** reuse & expand the existing homepage section components.
- **Language:** bilingual TR/EN via the existing `LanguageProvider` client toggle.
- **Blog fields:** full — bilingual title/slug/excerpt/body, cover image,
  categories, tags, per-post SEO meta override, publish state.

## Non-goals (YAGNI)

- No separate localized routes (`/en/...`); one URL serves both langs, TR default.
- No lightbox on the gallery page (add later if asked).
- No comments, no author profiles, no post scheduling beyond a publish toggle +
  `published_at`.
- No blog search (category/tag filter only).

---

## Part A — Static pages

Three Next App Router routes with Turkish slugs (SEO + consistency with
`/hizmetler`):

| Route | Content |
|---|---|
| `/galeri` | Full photo grid from existing `GALLERY` data + heading. Full version of the homepage teaser. |
| `/hakkimizda` | Existing `About` component + an expanded story/values block (new long text in i18n). |
| `/iletisim` | Existing `Contact` (form + info) + working hours + Google Maps iframe using `site.geo`. |

**Structure:** each page = `<Nav /> <main>…</main> <Footer />`, mirroring
`app/page.tsx`. Pages reuse the existing client section components (which already
consume `useLang`), so the page files are thin wrappers.

**Shared changes:**
- `Nav.tsx`: repoint `navGallery`/`navAbout`/`navContact` from `/#gallery` etc.
  to `/galeri`, `/hakkimizda`, `/iletisim`. Add a **Blog** link → `/blog`.
- `Footer.tsx`: same link updates + Blog.
- `lib/i18n.ts`: add `navBlog` (TR "Blog" / EN "Blog"); add expanded About copy
  (`aboutStoryLong` TR/EN) and any İletişim hours label already present.
- Each page: `metadata` export (TR-default) + `BreadcrumbList` JSON-LD via the
  existing `JsonLd` + `schema.ts` helpers.
- Add the three routes to `sitemap.ts`.

**Verification (Part A):** each route returns 200; nav/footer links resolve;
content visible with JS disabled (reveal fix already global); lang toggle swaps
copy; breadcrumb JSON-LD present in HTML.

---

## Part B — Blog subsystem

### B1. Backend — data model (Laravel migrations + Eloquent)

`posts`
- `id`
- `title_tr`, `title_en` — string
- `slug` — string, unique, indexed (language-neutral)
- `excerpt_tr`, `excerpt_en` — text
- `body_tr`, `body_en` — longText (rich HTML from Filament editor)
- `cover_path` — string, nullable
- `category_id` — FK → categories.id, nullable, nullOnDelete
- `meta_title_tr`, `meta_title_en` — string, nullable (SEO override)
- `meta_desc_tr`, `meta_desc_en` — string, nullable
- `is_published` — boolean, default false, indexed
- `published_at` — timestamp, nullable
- `timestamps`

`categories`: `id`, `name_tr`, `name_en`, `slug` (unique), `timestamps`.
`tags`: `id`, `name_tr`, `name_en`, `slug` (unique), `timestamps`.
`post_tag`: pivot `post_id`, `tag_id` (composite unique).

**Models:** `Post` (belongsTo `Category`, belongsToMany `Tag`; casts
`published_at`→datetime, `is_published`→bool; a `published` scope =
`is_published && published_at <= now`), `Category` (hasMany Post), `Tag`
(belongsToMany Post).

### B2. Backend — admin (Filament)

- Install Filament. **First-step checkpoint:** verify Filament ↔ Laravel 13.19 /
  PHP 8.5 compatibility; pin a working version or abort to a fallback (Breeze +
  Blade CRUD) if no compatible release exists. Record the resolved version in the
  plan.
- Panel at `:8002/admin`, auth via existing `users` table. Seed one owner account
  (credentials via a seeder reading env vars; not hard-coded secrets).
- `PostResource`: form with TR/EN tabs, rich text editor for body, file upload for
  cover (public disk), category select, tag multi-select (create-on-the-fly),
  collapsible SEO section (meta title/desc TR/EN), publish toggle + `published_at`
  picker. Table: title, category, published badge, date; filters by category/
  published.
- `CategoryResource`, `TagResource`: simple CRUD.
- `php artisan storage:link` so uploaded covers are web-served at `:8002/storage/…`.

### B3. Backend — public API (read-only, published only)

Routes in `routes/api.php`:
- `GET /api/posts` — paginated list of published posts. Query: `category` (slug),
  `tag` (slug), `page`. Each item returns **both languages** + cover URL, category
  {slug,name_tr,name_en}, tags[], `published_at`.
- `GET /api/posts/{slug}` — single published post, both languages, full body,
  category, tags. 404 if not found/unpublished.
- `GET /api/categories`, `GET /api/tags` — for filter UI.

Use API Resources (JsonResource) to shape output and build absolute cover URLs.
Confirm `config/cors.php` allows the Next origin for `api/*` (contact form already
posts cross-origin — reuse that config).

### B4. Frontend — blog UI (Next)

- `lib/blog.ts`: TS types (`Post`, `Category`, `Tag`) + fetch helpers hitting
  `site.apiUrl` (`getPosts`, `getPost`, `getCategories`, `getTags`). Server-side
  fetch with `next: { revalidate: 300 }` (ISR) for SEO + freshness.
- `app/blog/page.tsx` — server component fetches published posts + categories/
  tags, renders a client list component (`BlogList`) that handles lang toggle,
  category/tag filtering, and pagination. Grid card: cover, category chip, title,
  excerpt, date.
- `app/blog/[slug]/page.tsx` — server fetch single post; render cover, title,
  meta (date, category, tags), body via `dangerouslySetInnerHTML` (HTML produced
  by the trusted admin editor). `generateMetadata` from meta override → excerpt
  fallback, per current default lang (TR). `generateStaticParams` optional (ISR).
  Emit `BlogPosting` + `BreadcrumbList` JSON-LD.
- `next.config.ts`: add `images.remotePatterns` for `127.0.0.1:8002` (+ prod host
  later) so `next/image` can load `/storage/…` covers.
- `sitemap.ts`: fetch published slugs from the API and append `/blog` + each post.
- `Nav`/`Footer`: Blog link (from Part A).

### B5. SEO behavior

One URL per post, both langs in payload, **TR default** rendered server-side →
crawlers index TR (primary Ankara/TR market). Client toggle swaps to EN with no
refetch. `hreflang`/localized routes deferred until EN SEO is a stated need.

---

## Interfaces (contracts between units)

- **API → frontend:** JSON shape defined by JsonResource; `lib/blog.ts` types are
  the single source of truth on the frontend. A field rename is a change in two
  known places (Resource + types).
- **Admin → DB:** Filament writes the `posts`/`categories`/`tags` schema above;
  the API reads the same. No shared code, only the schema contract.
- **Pages → components:** the three static pages depend only on the existing
  section components' public props (currently none — they self-fetch via i18n).

## Risks

1. **Filament ↔ Laravel 13 compat** (Laravel 13 is very new). Mitigation: verify
   first thing in the plan; fallback to Breeze + Blade CRUD if unavailable.
2. **Rich HTML body** rendered with `dangerouslySetInnerHTML`. Safe because the
   only author is the authenticated owner via the admin; no user-generated
   content. Note it explicitly so no untrusted source is ever piped in.
3. **CORS / image host**: covers served from `:8002` need both CORS (for API) and
   Next `remotePatterns` (for images). Both are one-time config.

## Decomposition & order

1. **Part A** (pages) — independent, ship first (fast win, no backend).
2. **B1–B3** (backend: schema → admin → API) — sequential.
3. **B4** (frontend blog) — depends on B3 API.
4. **B5/sitemap/config** — folded into B4.

Each part verified before the next (see per-part verification notes).
