# Design: Services CMS — Phase 1 (of the "admin-managed content" project)

**Date:** 2026-07-08
**Status:** Approved (design), Phase 1 of 3.
**Later phases (not this spec):** Phase 2 = Site Settings; Phase 3 = Gallery + Home FAQ.

## Goal

Move the service catalog from static frontend files (`lib/i18n` SERVICES +
`lib/services` SERVICE_SEO) into the database, editable via the Filament admin,
served through a public API, and consumed by the frontend — with no loss of
existing content and no SEO regression.

## Decisions (locked)

- Full service content editable (name, tag, desc, cover, slug, SEO title/desc,
  keywords, intro, benefits[], process[], aftercare, faq[], gallery[], related[]).
- **Bilingual TR + EN.** Existing SEO body content is TR-only today → EN fields
  seeded empty; **frontend falls back to TR when an EN field is empty** (no blank
  EN pages).
- Existing 7 services are **seeded** into the DB from the current static data so
  nothing is lost and pages keep working identically.
- Service detail pages switch from build-time-only (`dynamicParams=false`) to
  **ISR** so an owner adding a service doesn't require a redeploy.

## Non-goals (Phase 1)

- Site settings, gallery, home FAQ (Phases 2–3). `HOME_FAQ` stays in code for now.
- No machine translation of EN SEO content — owner fills EN over time; TR fallback covers gaps.
- Homepage marketing copy stays in `lib/i18n` UI dict.

---

## Data model

`services` table:
- `id`, `slug` (unique, indexed), `sort_order` (int, default 0), `is_active` (bool, default true, indexed)
- `name_tr`, `name_en` (string)
- `tag_tr`, `tag_en` (string)
- `desc_tr`, `desc_en` (text)  — short card description
- `image` (string, nullable) — cover path (`/images/*.png` seeded, or `/storage/*` when uploaded)
- `seo_title_tr`, `seo_title_en` (string, nullable)
- `seo_desc_tr`, `seo_desc_en` (string, nullable)
- `keywords_tr`, `keywords_en` (json, nullable) — string[]
- `intro_tr`, `intro_en` (text, nullable)
- `aftercare_tr`, `aftercare_en` (text, nullable)
- `benefits_tr`, `benefits_en` (json) — string[]
- `process_tr`, `process_en` (json) — string[]
- `faq_tr`, `faq_en` (json) — {q,a}[]
- `gallery` (json) — string[] (image paths, language-neutral)
- `related` (json) — string[] (other service slugs)
- `timestamps`

`Service` model casts: all `*_json` array fields (`keywords_*`, `benefits_*`,
`process_*`, `faq_*`, `gallery`, `related`) → `array`; `is_active` → `bool`.
Scope `active()` = `where('is_active', true)->orderBy('sort_order')`.

---

## Backend

### Filament `ServiceResource`
Tabbed form:
- **Türkçe**: name_tr, tag_tr, desc_tr, intro_tr, aftercare_tr, benefits_tr (repeater of text), process_tr (repeater), faq_tr (repeater of {q,a}).
- **English**: same `_en` (all optional — TR fallback).
- **SEO**: slug (auto from name_tr on create, unique), seo_title_tr/en, seo_desc_tr/en, keywords_tr/en (TagsInput).
- **Görseller & Diğer**: image (FileUpload, public disk), gallery (FileUpload multiple), related (Select multiple over other services' slugs), sort_order, is_active.
Table: image, name_tr, tag_tr, is_active, sort_order (reorderable). Default sort by sort_order.

### Seeder `ServiceSeeder`
Imports the current 7 services verbatim from the existing frontend static data:
- `name/tag/desc` (tr+en) from `lib/i18n` SERVICES.
- `seo_title/desc, keywords, intro, benefits, process, aftercare, faq, related, gallery` (TR) from `lib/services` SERVICE_SEO. **EN SEO fields left null/empty.**
- `image` from SERVICES `img`. `sort_order` = array index. `is_active` = true.
Idempotent (`updateOrCreate` on slug).

### Public API (append to `routes/api.php`)
- `GET /api/services` — active services, ordered; **list fields**: slug, name_tr/en, tag_tr/en, desc_tr/en, image (absolute URL if `/storage`, else path), url (`/hizmetler/{slug}`).
- `GET /api/services/{slug}` — single active service; **full fields**: list + seo_title/desc, keywords, intro, aftercare, benefits, process, faq (all tr/en), gallery, related. 404 if not found/inactive.
Resources: `ServiceListResource`, `ServiceApiResource` (extends list). Mirror the blog API pattern.

---

## Frontend

### `lib/content.ts`
- Types `ServiceListItem`, `ServiceFull` (match API).
- `getServices(): Promise<ServiceListItem[]>`, `getService(slug): Promise<ServiceFull|null>`, `getServiceSlugs(): Promise<string[]>`. Server fetch, ISR `revalidate: 300`, safe fallbacks (empty/null).
- `pickLang(tr, en, lang)` helper: `lang === "en" ? (en || tr) : tr` — the EN→TR fallback, used by every consumer for name/tag/desc/SEO/body.

### `components/ServicesProvider.tsx` (client context)
- Fed by a server fetch in `layout.tsx`. Exposes `useServices(): ServiceListItem[]`.
- Feeds the client components that currently import `SERVICES`.

### `layout.tsx` (server)
- `const services = await getServices()` → wrap children in `<ServicesProvider services={services}>` (inside `LanguageProvider`). ISR-cached.

### Consumer rewire
| File | Change |
|---|---|
| `Services.tsx` | `useServices()` + `pickLang`; drop `SERVICES` import |
| `NavServices.tsx` | `useServices()` (featured = first); `pickLang` |
| `Footer.tsx` | `useServices()`; `pickLang` |
| `ContactForm.tsx` | `useServices()` for the dropdown; `pickLang` |
| `app/hizmetler/page.tsx` | server `getServices()`; `pickLang` (TR labels as now) |
| `app/hizmetler/[slug]/page.tsx` | server `getService(slug)`; `generateStaticParams` → `getServiceSlugs()`; **remove `dynamicParams=false`**, add `revalidate`; build crumbs/metadata/schema from fetched data |
| `components/ServicePage.tsx` | accept `ServiceFull` (replaces `svc: ServiceSeo` + `display: Service`); render all sections + gallery from it; `pickLang` for EN fallback |
| `components/schema.ts` | `serviceSchema` accepts the new shape (slug, name, intro/seoDesc) |
| `app/sitemap.ts` | service slugs from `getServiceSlugs()` (async, already async from blog) |

### Cleanup (after all consumers migrated)
- Remove `SERVICES` + `Service` type from `lib/i18n.ts` (verify no other importers).
- Remove `SERVICE_SEO`, `getServiceSeo`, `ServiceSeo` type from `lib/services.ts`; **keep `HOME_FAQ`** (Phase 3).

---

## SEO / correctness guardrails

- Seeded content must equal the current live pages (same TR text, slugs, order) — verify a sample service page byte-for-similar before/after.
- `/hizmetler/{slug}` must keep working for all 7 slugs; metadata (title/desc) unchanged for TR.
- Sitemap still lists all 7 service URLs.
- EN service pages: EN name/tag/desc show; EN SEO body falls back to TR (not blank).
- Cover images: seeded services point at `/images/*.png` (existing public assets) — still render; uploaded ones use `/storage` (needs the Phase-0 `remotePatterns`, already added).

## Risks

1. **Wide rewire** — services feed ~8 components incl. Nav/Footer on every page. The `ServicesProvider` (one server fetch in layout) contains the blast radius; client components read context, not props-drilled.
2. **Content fidelity** — the seeder transcribes 7 services' full TR content; an error loses/garbles copy. Mitigation: seeder built by reading the exact `lib/i18n` + `lib/services` values; spot-verify after seeding.
3. **ISR vs SSG** — switching `dynamicParams` could change caching; verify pages still prerender and new/edited services appear within the revalidate window.

## Decomposition (Phase 1 tasks, ordered)
1. Migration + `Service` model + `active` scope (TDD).
2. `ServiceSeeder` (import current 7 services) + verify count/content.
3. API resources + controller + routes (TDD) — list + single.
4. `ServiceResource` (Filament).
5. `lib/content.ts` + `ServicesProvider` + `layout.tsx` wiring.
6. Rewire client consumers (Services, NavServices, Footer, ContactForm).
7. Rewire server consumers (`/hizmetler`, `/hizmetler/[slug]`, ServicePage, schema, sitemap) + ISR.
8. Cleanup dead static data + full verification (all 7 pages, homepage, nav, sitemap).
