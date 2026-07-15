# Synthesis: SEO/GEO topic strategy — all three sites

**Date:** 2026-07-12
**Goal:** every site strong in classic SEO + GEO (AI answer engines). Query universe → page mapping → gaps → implementation lanes.

## Principles (from seo-audit + ai-seo skills)

- One page owns one primary query; blog posts take long-tail angles that link up to their pillar page (no cannibalization).
- Answer-first copy: lead each section with a 40–60 word direct answer; question-form H2s; tables for comparisons/pricing.
- GEO layer per site: JSON-LD (BeautySalon/Service/FAQPage/HowTo/Breadcrumb/BlogPosting), llms.txt with machine-readable pricing, robots allowing GPTBot/ClaudeBot/PerplexityBot/Google-Extended (CCBot blocked), geo meta, /og.
- Same business on 3 domains ⇒ never duplicate the same query+angle across sites; each site's schema `sameAs` cross-references the siblings + Instagram for entity consolidation.
- No AggregateRating schema until real reviews exist (policy risk — see [[issues/2026-07-12-mikroblading-seo-geo-audit]]).

## striastudio.com (frontend/) — "kalıcı makyaj" hub

| Cluster | Queries | Owner page | Status |
|---|---|---|---|
| Head/local | kalıcı makyaj ankara, çankaya kalıcı makyaj salonu | `/` + `/hizmetler` | OK |
| Service ×7 | microblading ankara, kaş pudralama ankara, kalıcı eyeliner, dipliner, dudak renklendirme, kaş laminasyonu, kirpik lifting | `/hizmetler/<slug>` | OK |
| Fiyat | kalıcı makyaj fiyatları ankara 2026 | blog: `kalici-makyaj-fiyatlari-2026-ankara` (7-hizmet fiyat tablosu) | GAP |
| Teknik seçimi | hangi kaş tekniği: microblading vs pudralama vs laminasyon (3'lü; mikroblading sitesindeki 2'li karşılaştırmayla çakışmaz) | blog: `hangi-kas-teknigi-size-uygun` | GAP |
| Ağrı | kalıcı makyaj acır mı, anestezi | blog: `kalici-makyaj-acir-mi` | GAP |
| Kontrendikasyon | kalıcı makyaj kimlere yapılmaz, hamilelikte kalıcı makyaj | blog: `kalici-makyaj-kimlere-yapilmaz` | GAP |
| Dudak lifecycle | dudak renklendirme iyileşme süreci, öncesi sonrası | blog: `dudak-renklendirme-iyilesme-sureci` | GAP |
| Eyeliner lifecycle | kalıcı eyeliner kaç yıl kalır, silinir mi | blog: `kalici-eyeliner-kac-yil-kalici` | GAP |
| SSS hub | tüm "… mı/mi" soruları | `/sss` (hizmet SSS'leri + genel, FAQPage) | GAP |
| GEO infra | — | dinamik `llms.txt` (blog+sss+fiyat rehberi), `/og`, AI-bot robots, geo meta | GAP |

## microbladingankara.com (mikroblading_ankara/)

Covered: nedir, fiyat (sayfa+blog), nasıl yapılır (HowTo), pudralama karşılaştırma, bakım, kalıcılık, acı. Teknik temiz (12.07 denetimi).

New landing pages (kastasarimi template: answer-first + Service/FAQPage/Breadcrumb):

| Query | Page |
|---|---|
| çankaya mikroblading | `/cankaya-mikroblading` |
| kızılay mikroblading | `/kizilay-mikroblading` |
| erkek mikroblading ankara | `/erkek-mikroblading-ankara` |
| seyrek kaşlar için mikroblading, kaş dökülmesi | `/seyrek-kaslar-mikroblading` |

No new blog posts (existing 6 own their long-tails). Sitemap + llms.txt + internal links updated. "öncesi sonrası" page deliberately skipped until gallery has real photos (owner-gated).

## kastasarimiankara.com (kastasarimi/)

Coverage already widest — no new content. Fixes:

1. **Port Section `as="h1"` fix** (missed during sync) + apply on pages whose primary heading is a Section: sss, hakkimizda, galeri, blog, iletisim (+ verify all 10 topical pages have exactly one H1).
2. **`/api-docs`**: `robots: noindex, follow` + remove from sitemap (mirror mikroblading fix).
3. **Cannibalization**: landing pages own head queries; colliding blog posts re-angled to long-tail in `backend/database/seeders/data/kas-tasarimi-ankara.json`:
   - `/kas-tasarimi-nedir` (page) vs blog `kas-tasarimi-nedir` → blog re-angled/retitled (ör. teknik derinlik: "Kaş Tasarımı Teknikleri: hangi yöntem nasıl çalışır")
   - `/kas-tasarimi-fiyatlari` vs blog `kas-tasarimi-fiyatlari-2026-ankara` → blog = 2026 fiyat analizi/etkenler açısı, page = fiyat listesi; karşılıklı link
   - `/kas-tasarimi-kalici-mi` vs blog `kas-tasarimi-ne-kadar-kalici` → blog cilt tipi/pigment açısı
   - `/kas-tasarimi-bakimi` vs blog `kas-tasarimi-sonrasi-bakim` → blog gün-gün rehber açısı (ilk-10-gun postuyla da ayrışmalı)
   - `/kas-tasarimi-iyilesme-sureci` vs blog `kas-tasarimi-oncesi-sonrasi-sureci` → blog randevu öncesi hazırlık açısı
   Every blog post links to its pillar landing page.

## Cross-site

- BeautySalon JSON-LD `sameAs`: her sitede Instagram + kardeş domain'ler.
- NAP tek kaynak: backend settings (site-scoped) — gerçek adres owner-gated.
- Owner-gated (kod dışı): galeri fotoğrafları, gerçek NAP, GBP + Search Console kurulumu, gerçek yorumlar → AggregateRating.


## Round 2 (2026-07-12, aynı gün) — kalan kümeler + E-E-A-T

Round 1 crawl-doğrulandıktan sonra hâlâ sahipsiz kalan sorgu kümeleri:

| Cluster | Queries | Owner |
|---|---|---|
| Silme | kalıcı makyaj silinir mi, lazerle silme | ana blog: `kalici-makyaj-silinir-mi` |
| Silme (kaş) | mikroblading silinir mi, mikroblading silme | mikro blog: `mikroblading-silinir-mi` (kaşa özel açı; ana yazı tüm hizmetler) |
| Hazırlık | kalıcı makyaj öncesi hazırlık, randevu öncesi yapılmaması gerekenler | ana blog: `kalici-makyaj-oncesi-hazirlik` |
| Pudralama long-tail | kaş pudralama kaç yıl kalıcı, pudralama iyileşme | ana blog: `kas-pudralama-kac-yil-kalici` |
| Laminasyon long-tail | kaş laminasyonu bakımı, ne sıklıkla | ana blog: `kas-laminasyonu-bakimi` |
| Lifting güvenlik | kirpik lifting zararlı mı | ana blog: `kirpik-lifting-zararli-mi` |
| Göz karşılaştırma | dipliner mi eyeliner mı | ana blog: `dipliner-mi-eyeliner-mi` |

E-E-A-T/tazelik derinleştirme: ana site BlogPosting'e publisher/url/dateModified (API `updated_at` üzerinden), mikrositelerde dateModified=updated_at düzeltmesi, ana blogda görünür "Son güncelleme", ana `/hizmetler/[slug]`'a `process_tr`'den HowTo şeması.

Bilinçli atlananlar: kastasarimi'ye silme yazısı (kıl tekniği ≈ mikroblading — domainler arası kanibalizasyon), sayfa-başı dinamik OG görseli (görsel iş, sıralama etkisi düşük), sitemap lastModified gerçekleştirme (düşük öncelik).
## Sources
[[decisions/2026-07-08-seo-architecture]] · [[decisions/2026-07-09-microsite-architecture]] · [[issues/2026-07-12-mikroblading-seo-geo-audit]] · skill://seo-audit · skill://ai-seo
