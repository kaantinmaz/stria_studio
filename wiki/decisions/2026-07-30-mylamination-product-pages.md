# Decision: My Lamination brand + product pages

**Date:** 2026-07-30

## Context
Stria Studio uses **My Lamination** products (mylamination.com.tr — Türkiye exclusive distributor, Antalya; manufacture in Italy) for kaş laminasyonu and kirpik lifting. Two goals:
1. State the My Lamination expertise **at the top of** `/hizmetler/kas-laminasyon` and `/hizmetler/kirpik-lifting`.
2. Rank on Google + AI search for the brand's product queries with our own detailed Turkish explainers.

## Decisions
- **Routes:** `/mylamination` (hub) + `/mylamination/<slug>` (33 product detail pages). Flat under the brand, not under `/hizmetler` — these are reference/product content, not services we sell.
- **Content is static, in `frontend/lib/mylamination.ts`**, not the DB. The supplier catalog is editorial reference data, not owner-managed service content; keeping it in code avoids adding a Filament resource for content that changes a few times a year. Mirrors the `/ankara-kalici-makyaj-yapan-yerler` static-page pattern.
- **Copy is original, not copied.** Product facts (steps, ingredients, ml, sizes, warnings) come from the manufacturer's pages, but every paragraph is rewritten — verbatim supplier text would be duplicate content and defeat the ranking goal. Each detail page links its `sourceUrl` with `rel="nofollow"`.
- **4 categories** (`MlCategory`): `uygulama` (studio solutions), `ekipman` (shields/pads/brushes/glues), `evde-bakim` (home serums + mascaras), `cilt` (skin prep + SPF). `MlScope` (`kas` / `kirpik` / `ikisi`) drives which products surface on which service page.
- **Assets self-hosted** in `public/mylamination/` — brand logo (`logo.png`, `logo-italy.png`) + one image per product. No hotlinking, no `remotePatterns` change.
- **Service-page integration** lives in `ServicePage.tsx`, gated by a slug→scope map (`ML_SERVICE_SCOPE`), same shape as the existing `SERVICE_GUIDES` map:
  - `MyLaminationBadge` renders **above the h1** on both pages (the explicit ask).
  - `MyLaminationServiceSection` lists in-scope solutions + home-care products after the benefits/process block.
- **DB/seeder content** for both services updated in `ServiceSeeder.php` (source of truth) and re-seeded: intro, aftercare, benefits, process now name the actual products; 2 new FAQ entries each ("hangi ürünleri kullanıyorsunuz", brand credibility / lifting-vs-laminasyon); keywords gained `my lamination *` terms; `seo_title_tr` → "… | My Lamination Uzmanı".
- **Structured data:** `Brand` (`@id` `/mylamination#brand`) + `ItemList` (33 items) on the hub; `Product` per detail page with `additionalProperty` specs and `isRelatedTo` → the Service. **No `offers`** — we don't sell the products, so a price/availability offer would be false.
- **AI search:** `llms.txt` gained a `## My Lamination ürünleri` section listing all 33 products with URL + summary, plus the brand's clinical claim. Sitemap gained 34 URLs.
- **Discoverability:** hub linked from the Hizmetler mega-menu, the mobile menu, and the footer "explore" list.

## Notable source facts (used in copy)
- Vegan; no toxin/paraben/sulfate; Avrupa + T.C. Sağlık Bakanlığı registered; made in Italy.
- Padua Üniversitesi ESEM study: lash diameter 68,18 µm → 86,14 µm (post-treatment) → 129,32 µm (after 1 month of home serum). This is the strongest citable claim and appears on the hub, `llms.txt`, and the Vitamin Lash Serum Home page.
- Products are **not** freely sold — only workshop-certified appliers can buy them. This is stated on the hub and on every `uygulama` detail page, and is why the pages don't read as a shop.

## Consequences
- Products deliberately kept in the catalog even when the manufacturer shows them out of stock (`inStock: false` renders as "Üreticide stokta yok") — the query value is in the explainer, not availability.
- `Lifting Cream` is scoped `ikisi` although the supplier page frames it as lash-only: it is the step-1 solution in the brow protocol too, and the kaş service `process_tr` names it. Divergence from the source is called out in the page body.
- Prices are **not** published anywhere — supplier prices are for certified appliers, not our customers, and would go stale.
- If the supplier revises a product, update `lib/mylamination.ts` only; images live beside it in `public/mylamination/`.

## Sources
`frontend/lib/mylamination.ts` · `frontend/components/MyLaminationBadge.tsx` · `frontend/components/MyLaminationServiceSection.tsx` · `frontend/app/mylamination/` · `backend/database/seeders/ServiceSeeder.php` · [[seo-architecture]]

## Düzeltme (aynı gün): uzmanlık kişiye ait

İlk sürümde iddia **"Stria Studio bir My Lamination uzmanıdır"** biçiminde kurumaydı — yanlış. My Lamination sertifikası workshopu tamamlayan **uygulayıcı adına** düzenlenir, kuruma verilmez. Owner düzeltmesiyle tüm uzmanlık atfı **Nilsu Kamişli**'ye (Kurucu & Kalıcı Makyaj Uzmanı) taşındı.

- `ML_EXPERT` sabiti `lib/mylamination.ts`'te — ad ve unvan tek yerde; rozet, hub, ürün detay, hizmet bölümü ve `llms.txt` buradan okur.
- Rozet artık "Nilsu Kamişli, kaş laminasyonunda My Lamination uzmanıdır" der; gövde metni sertifikanın kişiye ait olduğunu açıklar.
- Hub'a **`Person`** şeması eklendi: `jobTitle`, `worksFor` → `/#business`, `knowsAbout`, ve `hasCredential` (`EducationalOccupationalCredential`, `recognizedBy` → `/mylamination#brand`). Uzmanlık atfı artık makine tarafında da kurulu — E-E-A-T sinyali kuruma değil kişiye bağlanıyor.
- İki hizmete "**Kim uyguluyor?**" SSS'i ve "Sertifikalı My Lamination uzmanı Nilsu Kamişli uygular" fayda maddesi eklendi (seeder; SSS 5→6).
- Ayrım korundu: *stüdyo* ürünleri **kullanır**, *kişi* sertifikayı **taşır**. "Stria Studio'da … kullanılır" ifadeleri doğru olduğu için bırakıldı.

Ayrıca owner isteğiyle **mobil menünün en altına** My Lamination logosu + uzmanlık notu (`/mylamination`'a link) eklendi; ana sayfa ve `/hizmetler` kartlarında `MyLaminationChip` duruyor.
