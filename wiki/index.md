# Wiki Index

Catalog of all wiki pages, by category. Update on every ingest/query that adds or renames a page.

## Entities
_(none yet)_

## Concepts
- [keyword-cannibalization](concepts/keyword-cannibalization.md) — tek niyet tek sayfa; varyant sorgular mevcut sayfaya (title/intro/SSS/alternateName); domainler arası sorgu bölüşümü kuralları.

## Decisions
- [desktop-api-integration](decisions/2026-09-13-desktop-api-integration.md) — macOS yönetici uygulaması için ayrı Sanctum API, müşteri/randevu/saat yönetimi, kayıt sürümü denetimi.
- [stack-and-dev-servers](decisions/2026-07-07-stack-and-dev-servers.md) — monorepo, MySQL/MAMP, dev ports (8002/3001), added contact form, CORS. ("No admin UI" call superseded by filament-admin-resources below.)
- [seo-architecture](decisions/2026-07-08-seo-architecture.md) — TR-first, per-service pages, JSON-LD, sitemap/robots, llms.txt.
- [filament-admin-resources](decisions/2026-07-08-filament-admin-resources.md) — Filament v4.11 admin CRUD for Post/Category/Tag; v3→v4 namespace map (Schema, Schemas\Components\Tabs, Actions, recordActions/toolbarActions).
- [microsite-architecture](decisions/2026-07-09-microsite-architecture.md) — per-service SEO microsites (microbladingankara.com) on shared backend; `site` column scoping, `/api/microsites/{site}/*`, Filament Site selector, isolation guard. (Item 7 "settings shared" superseded by per-site-settings below.)
- [per-site-settings](decisions/2026-07-12-per-site-settings.md) — settings now `site`-scoped (NULL=main); `Setting::forSite()`, Filament site switcher, per-site campaign bar + code injection on both microsites.
- [model-routing](decisions/2026-07-12-model-routing.md) — Fable 5 = thinking/orchestration; coding & detail always delegated to Codex 5.6 (`gpt-5.6-sol`) or Opus 4.8 (`claude -p --model opus`). Codified in CLAUDE.md §5.
- [mylamination-product-pages](decisions/2026-07-30-mylamination-product-pages.md) — My Lamination marka/ürün sayfaları: `/mylamination` hub + 33 ürün detayı, statik `lib/mylamination.ts`, hizmet sayfalarında uzmanlık rozeti, Brand/ItemList/Product JSON-LD, offers yok (satış yapmıyoruz).
- [domain-konsolidasyonu](decisions/2026-08-10-domain-konsolidasyonu.md) — 2026-08-10: iki mikrosite (microbladingankara, kastasarimiankara) ana domaine 301 ile konsolide; 59 URL haritası + catch-all, kapsam boşlukları için 3 yeni yazı, redirect'e giden iç/dış linkler temizlendi, Person yazar entity'si. Mikrosite-SEO açısından [[decisions/2026-07-09-microsite-architecture]] geçersiz.
- [yorum-ve-puan-sistemi](decisions/2026-08-17-yorum-ve-puan-sistemi.md) — 2026-08-17: gerçek veriye dayalı yıldız/puan; `service_reviews` tablosu + Filament `Yorumlar` CRUD (hizmet bazlı müşteri yorumları) ve `settings`'te Google İşletme puanı (`reviews:sync-google`, Places API). Veri yoksa hiçbir yüzeyde yıldız yok; `AggregateRating` yalnız gerçek yorum varken. Hero'daki sabit `5.0` çipi kaldırıldı.
- [chatbot-konusma-kaydi](decisions/2026-08-18-chatbot-konusma-kaydi.md) — 2026-08-18: `POST /api/chat` artık `session_id` alıp konuşmayı `chat_conversations` satırında **ekleyerek** biriktiriyor (`ChatTranscript`); özet, sohbet sessize düşünce `chat:summarize` (30 dk'da bir) ile üretiliyor; Filament `Sohbetler` kaynağında özet listesi + `Döküm` modali + anında `Özetle`. Mobil `/api/app/chat` bilinçli kapsam dışı (App Store gizlilik beyanı).
- [instagram-feed-anasayfa](decisions/2026-08-19-instagram-feed-anasayfa.md) — 2026-08-19: Instagram gönderileri anasayfada; `instagram:sync` (Graph API, saatlik) → `instagram_posts` + görseller public disk'e **indirilir** (CDN URL'leri süreli), `GET /api/instagram` → `InstagramFeed` bölümü (Gallery↔About arası). Token yoksa/boş listede bölüm hiç basılmaz; API hatasında mevcut kayıtlara dokunulmaz. Filament kaynağı yok (liste Instagram'ın aynası).
- [randevu-seanslari](decisions/2026-08-19-randevu-seanslari.md) — 2026-08-19: bir randevu seanslara bölünebiliyor; `appointments` üzerinde tek seviyeli `parent_id` (kök = en erken seans), `session_no`/`session_total`, `App\Support\AppointmentSessions` (böl/ekle/çıkar/resync). Para YALNIZCA kökte (`price`/`is_paid`/`payment_method`) → ciro çift sayılmaz; kök silinirse para kalan en erken seansa devredilir. Her seans takvimde ayrı kutucuk (`· 2/3`), pill'in ödeme rengi kökten okunur. Mobil kapsam dışı.
- [icerik-uretim-pipeline](decisions/2026-09-05-icerik-uretim-pipeline.md) — 2026-09-05: GSC sorgularından yayına içerik üreten Laravel artisan pipeline'ı (`gsc:import`→`content:plan`→`content:write`/`content:service-copy`); metin `claude -p` **abonelik kimliğiyle** üretilir (API anahtarı YOK). Blog anında yayımlanır + IndexNow; hizmet kopyası öneridir, `--apply` ile yazılır. `ContentGuard` iç linkleri canlı envantere karşı doğrular (uydurma link reddedilir); ISR 300 sn.
- [meta-google-butce-stratejisi](decisions/2026-09-26-meta-google-butce-stratejisi.md) — 2026-09-26: aylık 40.000 ₺ → Google 22.000 / Meta 18.000 (öneri); kaş pudralama reklama girdi (yeni C7), altın oran C5 duraklatma önerisi; Meta tek CBO + WhatsApp konuşma, 3 ad set; ölçüm açıkları (Pixel yok, form olayı yok, randevu kaynağı yok).
- [llms-full-marka-dosyasi](decisions/2026-10-01-llms-full-marka-dosyasi.md) — 2026-10-01: `/llms-full.txt` kapsamlı marka dosyası (kimlik, canlı ölçek `GET /api/studio-facts`, tam hizmet metni, uzmanlık, yorumlar, şikâyet+yanıt `REPUTATION`, kaynaklar, bilginin sınırları); uydurma yok, placeholder basılmaz; `/llms.txt` hizmetleri API'den; Instagram tek hesap `@striabeautystudio` (data migration). Edge worker bilinçli yok.

## Issues
- [mikroblading-seo-geo-audit](issues/2026-07-12-mikroblading-seo-geo-audit.md) — 2026-07-12 audit: fixed missing H1 (Section `as="h1"`) + api-docs noindex; open owner blockers (gallery photos, real NAP, reviews→AggregateRating, launch/GSC).
- [striastudio-organik-gorunurluk-teshisi](issues/2026-08-10-striastudio-organik-gorunurluk-teshisi.md) — 2026-08-10 canlı crawl: teknik/on-page temiz, indekste 0 sonuç; bloklayıcılar = `header_code`'daki kırık `http://localhost:3001/v.js` + GA4/GSC yok, placeholder NAP (AI cevabında güvenilmezlik uyarısı), 3 domain kanibalizasyonu, ince gövdeler + yazar entity yok. Shipped: sitemap gerçek `lastmod`.

## Syntheses
- [seo-geo-topic-strategy](syntheses/2026-07-12-seo-geo-topic-strategy.md) — 2026-07-12: query universe → page map for all 3 sites; gaps → lanes (kastasarimi tech fixes, mikroblading topical expansion, main-site GEO infra + 6 blog posts).

## Raw sources
- [desktop-integration-source-note](raw/2026-09-13-desktop-integration-source-note.md) — masaüstü entegrasyonu kaynak kodu incelemesi.
- [stria-studio-design](raw/stria-studio-design.md) — imported Minimal design: tokens, bilingual copy, services, image URLs.
- [2026-07-16-kil-teknigi-cannibalization-note](raw/2026-07-16-kil-teknigi-cannibalization-note.md) — kıl tekniği kaş danışması, uygulanan on-page değişiklikler, cannibalization denetim bulguları.
