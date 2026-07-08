# Design: Gallery + Home FAQ CMS — Phase 3 (final)

**Date:** 2026-07-08
**Status:** Approved (design), Phase 3 of 3. (Phase 1 services + Phase 2 settings = merged.)

## Goal

Move the homepage gallery and home FAQ from static frontend files into the DB,
editable via Filament, served by the public API, consumed by the frontend. No
behavior change for current content.

## Decisions

- **Gallery** (`lib/i18n` GALLERY, 6 items `{img, ph:{tr,en}}`) → DB. Owner
  uploads/orders/removes images with bilingual alt text.
- **Home FAQ** (`lib/services` HOME_FAQ, 4 items `{q,a}`, TR-only) → DB, made
  **bilingual** (q/a tr+en); EN empty → **TR fallback** via `pickLang`.
- Neither needs a site-wide provider (used only on the homepage; gallery also on
  `/galeri`). Server pages fetch and pass as props; client leaf components pick
  the language.

## Non-goals

- Marketing copy (hero/about/UI dict) stays static. This is the last CMS phase.

---

## Data model

`gallery_images`
- `id`, `image` (string, nullable), `alt_tr` (string), `alt_en` (string, nullable),
  `sort_order` (int, default 0), `is_active` (bool, default true, indexed), timestamps.
- `GalleryImage` model: `is_active` bool cast; `scopeActive()` = active + orderBy sort_order.

`faqs`
- `id`, `q_tr` (string), `q_en` (string, nullable), `a_tr` (text), `a_en` (text, nullable),
  `sort_order` (int, default 0), `is_active` (bool, default true, indexed), timestamps.
- `Faq` model: `is_active` bool cast; `scopeActive()` = active + orderBy sort_order.

---

## Backend

- **Seeders:** `GalleryImageSeeder` (6 items from GALLERY: `image`←img, `alt_tr`/`alt_en`←ph.tr/ph.en, `sort_order`←index), `FaqSeeder` (4 items from HOME_FAQ: `q_tr`/`a_tr`←q/a, EN empty, `sort_order`←index). Idempotent.
- **Filament:** `GalleryImageResource` (image FileUpload public/gallery, alt_tr, alt_en, sort_order, is_active; reorderable table) + `FaqResource` (q_tr/q_en, a_tr/a_en textareas, sort_order, is_active). Mirror the existing `Services` resource conventions (v4.11).
- **API** (append to routes/api.php, mirror ServiceListResource pattern):
  - `GET /api/gallery` → `{data:[{image (abs URL if /storage else raw), alt_tr, alt_en}]}` active+ordered.
  - `GET /api/faqs` → `{data:[{q_tr, q_en, a_tr, a_en}]}` active+ordered.

---

## Frontend

### `lib/content.ts` (extend)
- Types `GalleryItem2` (image/alt_tr/alt_en) and `FaqItem` (q_tr/q_en/a_tr/a_en).
- `getGallery(): Promise<GalleryItem2[]>`, `getFaqs(): Promise<FaqItem[]>` (server fetch, ISR 300, safe fallback `[]`).

### Components
- `Gallery.tsx` — currently client, reads `GALLERY`. Change to take an `items: GalleryItem2[]` **prop**; render with `pickLang(alt_tr, alt_en, lang)`; `ImageSlot src={image ?? ""}`. Still `"use client"` for `useLang`.
- `HomeFaq.tsx` (new, client) — takes `faqs: FaqItem[]`, picks lang via `useLang`, maps to `{q,a}` and renders the existing `Faq` visual (`<Faq title items={picked}/>`).

### Pages
- `app/page.tsx` (server) — `const [gallery, faqs] = await Promise.all([getGallery(), getFaqs()])`; pass `<Gallery items={gallery} />`; replace `<Faq items={HOME_FAQ}/>` with `<HomeFaq faqs={faqs} title="Sıkça Sorulan Sorular" />`; `faqSchema` from DB faqs TR: `faqSchema(faqs.map(f => ({q: f.q_tr, a: f.a_tr})))`. Add `export const revalidate = 300`.
- `app/galeri/page.tsx` (server) — `const gallery = await getGallery()`; `<Gallery items={gallery} />`; `export const revalidate = 300`.

### Cleanup
- Remove `GALLERY` + `GalleryItem` type from `lib/i18n.ts` (keep `IMG`, `TRUST`, `UI`, etc.).
- Remove `HOME_FAQ` from `lib/services.ts`. If the file becomes empty, delete it and drop any dangling import.

---

## Guardrails
- Seeded gallery/faq equal current homepage content (same images, same TR FAQ text/order).
- Homepage FAQ toggles TR/EN (EN falls back to TR until owner fills EN).
- `faqSchema` (FAQPage JSON-LD) still emitted on the homepage from DB (TR).
- `/galeri` + homepage gallery render the 6 images (mg6 = empty → placeholder).
- Uploaded gallery images use `/storage` (asset URL via request host; remotePatterns already allow :8002/storage).

## Decomposition (tasks)
1. Gallery: migration + model + factory + seeder (import GALLERY) + TDD.
2. FAQ: migration + model + factory + seeder (import HOME_FAQ) + TDD.
3. API: `/api/gallery` + `/api/faqs` + resources + TDD.
4. Filament: GalleryImageResource + FaqResource.
5. Frontend: content getGallery/getFaqs + Gallery prop + HomeFaq + wire homepage & /galeri.
6. Cleanup static GALLERY/HOME_FAQ + full verification.
