# Design: Kaş Tasarımı Ankara — SEO/AEO landing-page expansion

**Date:** 2026-07-11
**App:** `kastasarimi/` (Next.js, port 3002, SSG+ISR) — the `kas-tasarimi-ankara` microsite.
**Status:** Design — pending user review.

## Goal

Add topical, searchable pages so the microsite ranks/answers across more
"kaş tasarımı" intents in both Google and AI answer engines (ChatGPT,
Perplexity, AI Overviews). Deliverables: **8 static landing pages** + **3
supporting blog posts** (CMS), each with unique Turkish content, answer-first
structure, question-form H1, JSON-LD, breadcrumbs, FAQ, appointment CTA, and
internal links — all wired into `sitemap.ts`, `/llms.txt`, and the footer.

Uses the existing "Atelier" editorial design system (no visual redesign).
Builds on the microsite SEO architecture
(`wiki/decisions/2026-07-09-microsite-architecture.md`).

## Non-negotiable guardrails

1. **House rule** — never name any other technique or the brand-term for the
   technique. Site stands out purely as "kaş tasarımı".
2. **Unique content per page** — no templated near-duplicate copy. Thin /
   doorway pages get penalized and defeat the purpose. Locality pages (7, 8)
   are the highest risk and must differ meaningfully (distinct intro, sections,
   FAQ).
3. **Every page:** self-canonical, one `<h1>` containing its target keyword,
   answer-first opening (definition/answer in the first 40–60 words), ≥1
   JSON-LD block, `<Breadcrumbs>`, an appointment CTA, and ≥2 internal links.
4. **No backend/schema/API changes** except appending blog posts to the seed
   JSON + reseed. No changes to existing pages' content beyond adding internal
   links and footer/nav wiring.

## Page inventory (static routes)

Pattern for every page = the existing `/kas-tasarimi-fiyatlari` template:
`buildMetadata()` export, inline page-specific FAQ array, `<JsonLd>` blocks,
`<Breadcrumbs>`, `<Section>`/`<Faq>`/`<CTAButtons>`/`<CTABanner>`. Copy lives
**inline in each page file** (matches existing convention — no new content
module). Schema builders already exist in `lib/schema.ts`
(`serviceSchema`, `faqSchema`, `howToSchema`, `breadcrumbSchema`).

### Cluster A — Informational (highest AEO value)

**1. `/kas-tasarimi-nedir`** — H1 "Kaş tasarımı nedir?"
- Keywords: kaş tasarımı nedir, kaş tasarımı ne demek.
- Answer: definition (kıl tekniği + altın oran + 12–18 ay kalıcı), expanded and
  reworded from `whatIs.answer` (not copied verbatim).
- Sections: form nasıl belirlenir (altın oran), kimler için uygundur, kalıcılık
  özeti, doğal görünüm.
- Schema: Service + FAQPage + Breadcrumb. FAQ: 4–5 Q.
- Links → nasil-yapilir, kalici-mi, fiyatlari, seyrek-kaslar.

**2. `/kas-tasarimi-kalici-mi`** — H1 "Kaş tasarımı kalıcı mı? Ne kadar dayanır?"
- Keywords: kaş tasarımı kalıcı mı, ne kadar kalıcı, kalıcılık.
- Answer: 12–18 ay; cilt tipine göre değişir; yıllık yenileme ile korunur.
- Sections: kalıcılığı etkileyen faktörler (cilt tipi, güneş, bakım), yenileme
  seansı, "kalıcı" ne anlama gelir.
- Schema: FAQPage + Breadcrumb. FAQ: 5 Q.
- Links → bakimi, nedir, fiyatlari (yıllık yenileme).

**3. `/kas-tasarimi-iyilesme-sureci`** — H1 "Kaş tasarımı acır mı? İyileşme süreci"
- Keywords: kaş tasarımı acır mı, iyileşme süreci, kaş tasarımı sonrası.
- Answer: anestezik krem → hafif çizilme hissi; yüzeysel iyileşme 7–10 gün;
  nihai renk 4–6 haftada.
- Sections: acı/konfor, gün-gün iyileşme (HowTo: gün 1–3 / 3–7 / 7–10 / 4–6
  hafta), rötuş neden gerekli.
- Schema: FAQPage + HowTo + Breadcrumb. FAQ: 4–5 Q.
- Links → bakimi, nasil-yapilir.

**4. `/kas-tasarimi-bakimi`** — H1 "Kaş tasarımı bakımı: öncesi ve sonrası"
- Keywords: kaş tasarımı bakımı, sonrası bakım, öncesi hazırlık.
- Answer: öncesi (kafein/kan sulandırıcı/güneş kaçın); sonrası (ilk 10 gün
  ıslatma yok, kabuk koparma yok, güneş/havuz/sauna kaçın, nemlendirme).
- Sections: işlem öncesi hazırlık (HowTo), ilk 10 gün (HowTo), uzun vadede
  koruma.
- Schema: HowTo + FAQPage + Breadcrumb. FAQ: 4 Q.
- Links → iyilesme-sureci, kalici-mi.

### Cluster B — Audience / variant

**5. `/erkek-kas-tasarimi-ankara`** — H1 "Erkek kaş tasarımı — Ankara"
- Keywords: erkek kaş tasarımı ankara, erkek kaş tasarımı.
- Answer: erkeklere özel doğal, düz/dolgun form; abartısız; kıl tekniğiyle.
- Sections: erkek kaş formu farkı (doğal, kavis az), süreç, doğallık/gizlilik.
- Schema: Service (name "Erkek Kaş Tasarımı") + FAQPage + Breadcrumb. FAQ: 4 Q.
- Links → nedir, nasil-yapilir, fiyatlari.

**6. `/seyrek-kaslar-kas-tasarimi`** — H1 "Seyrek ve dökük kaşlar için kaş tasarımı"
- Keywords: seyrek kaşlar için kaş tasarımı, dökük kaşlar, boşluklu kaşlar.
- Answer: seyrek/boşluklu/açık renkli kaşlarda kıl kıl dolgu ile doğal görünüm.
- Sections: uygunluk, boşlukların doğal doldurulması, açık renk kaşlar.
- Schema: Service + FAQPage + Breadcrumb. FAQ: 4 Q.
- Links → nedir, nasil-yapilir, bakimi.

### Cluster C — Locality (thin-content risk — enforce uniqueness)

**7. `/cankaya-kas-tasarimi`** — H1 "Çankaya kaş tasarımı — Stria Studio"
- Keywords: çankaya kaş tasarımı, kaş tasarımı çankaya.
- Angle: **studio is in Çankaya** (home turf). Unique: adres, çevre semtler,
  neden Çankaya'da hizmet.
- Sections: konum & ulaşım (reuse `<StudioMap>`), Çankaya'da kaş tasarımı,
  randevu.
- Schema: Service (areaServed Çankaya) + FAQPage + Breadcrumb. FAQ: 3–4 Q
  (local, distinct from page 8).
- Links → iletisim, fiyatlari, kizilay-kas-tasarimi.

**8. `/kizilay-kas-tasarimi`** — H1 "Kızılay kaş tasarımı (Çankaya)"
- Keywords: kızılay kaş tasarımı.
- Angle: **getting here from Kızılay** (proximity/transit), NOT a duplicate of
  page 7. Unique: Kızılay'dan metro/otobüs ile ulaşım, mesafe.
- Sections: Kızılay'dan erişim, stüdyo konumu (`<StudioMap>`), randevu.
- Schema: Service + FAQPage + Breadcrumb. FAQ: 3 Q (distinct from page 7).
- Links → cankaya-kas-tasarimi, iletisim.

## Blog posts (CMS — phase 4)

Append 3 posts to `backend/database/seeders/data/kas-tasarimi-ankara.json`
`posts[]` (keys: `slug, title_tr, excerpt_tr, meta_title_tr, meta_desc_tr,
body_tr`; `body_tr` = unique HTML rendered via `.prose`). Reseed via the
microsite seeder. Each links to relevant landing pages inside `body_tr`.

1. `kas-tasariminda-altin-oran` — "Kaş tasarımında altın oran nedir?" → nedir, nasil-yapilir.
2. `kas-tasarimi-karar-rehberi` — "Kaş tasarımı yaptırmalı mıyım? Karar rehberi" → kalici-mi, seyrek-kaslar, nedir.
3. `kas-tasarimi-sonrasi-ilk-10-gun` — "Kaş tasarımı sonrası ilk 10 gün" → bakimi, iyilesme-sureci.

House rule applies to blog bodies too.

## Cross-cutting wiring

- **`app/sitemap.ts`** — add the 8 new routes to `staticPages` (priority: A/B
  pages 0.8, locality 0.7; `changeFrequency: "monthly"`). Blog posts flow in
  automatically via `getAllPostSlugs()`.
- **`app/llms.txt/route.ts`** — extend the `## Önemli sayfalar` list with the 8
  pages, grouped under a new `## Kaş tasarımı rehberi` heading (info + audience
  + locality), so LLMs see the full topical map.
- **`components/Footer.tsx`** — add a new column "Kaş Tasarımı Rehberi" linking
  the 8 pages (site-wide crawlable internal links; no nav overflow).
- **`app/page.tsx`** — add a compact "Kaş Tasarımı Rehberi" links section on the
  home page (internal-linking hub) near the existing FAQ/blog sections.
- **Contextual cross-links** — each landing page links to ≥2 related pages
  (listed per page above).
- **`components/Nav.tsx`** — unchanged (8 links would overflow the top bar;
  footer + home hub + cross-links carry the internal linking). <!-- ponytail:
  footer column over a nav dropdown; add a nav "Rehber" dropdown only if the
  owner later wants top-nav discovery. -->

## Reuse / no new abstraction

Each page composes existing components directly (`Section`, `Faq`, `CTAButtons`,
`CTABanner`, `Breadcrumbs`, `JsonLd`, `StudioMap`, `PricingTable` where
relevant) — same as the current 8 pages. No shared "landing" wrapper component
(pages vary in schema/sections; YAGNI). Content stays inline per page file.

## Build order (phased in the plan)

1. **Phase 1** — Cluster A (pages 1–4) + sitemap/llms.txt/footer/home wiring for them.
2. **Phase 2** — Cluster B (pages 5–6) + wiring.
3. **Phase 3** — Cluster C (pages 7–8) + wiring.
4. **Phase 4** — 3 blog posts (seed JSON + reseed).

Each phase ships independently deployable, testable pages.

## Out of scope

- Visual/design changes (Atelier system reused as-is).
- Nav dropdown restructure (footer + hub links instead).
- Backend/API/schema changes beyond appending blog seed rows.
- New imagery/photography.
- Comparison pages against other techniques (house rule forbids naming them).

## Verification / success criteria

1. `npm run build` (in `kastasarimi/`) passes; all 8 routes prerender.
2. Each new page: exactly one `<h1>` containing its target keyword;
   self-canonical to its own path; ≥1 JSON-LD block present; `<Breadcrumbs>`
   rendered; ≥2 internal links; an appointment CTA.
3. All 8 routes appear in `/sitemap.xml` and in `/llms.txt`.
4. All 8 appear in the footer "Kaş Tasarımı Rehberi" column and the home hub.
5. Locality pages 7 & 8 have visibly distinct intro + FAQ (no duplicate blocks).
6. House-rule grep clean across new pages + blog bodies (no other technique/its
   brand-term named).
7. Blog: 3 new posts render at `/blog/<slug>` with BlogPosting schema after reseed.

## Risks

- **Thin/duplicate locality content** → mitigated by distinct angles (studio-in-
  Çankaya vs transit-from-Kızılay) + distinct FAQs; criterion 5 verifies.
- **House-rule slip in long-form copy** → criterion 6 grep + copy written with
  the ai-seo/copywriting skills.
- **Reseed side effects** (blog) → append-only to seed `posts[]`; verify existing
  6 posts remain and `whereNull('site')` isolation holds (main site unaffected).
