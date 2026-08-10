# Issue: striastudio.com.tr organik görünürlük teşhisi (blog trafiği ≈ 0)

**Date:** 2026-08-10
**Status:** 1 kod düzeltmesi shipped; kalanlar owner-gated / strateji kararı bekliyor.

## Yöntem

Canlı crawl (37 blog + 76 sitemap URL'i): status/headers, Googlebot UA ile render, title/desc uzunlukları, H1–H3, JSON-LD @type, gövde içi link sayısı, kelime sayısı; robots.txt/sitemap/llms.txt; `site:` indeks sondası (Bing + arama motoru); iki kardeş domain'in canlılığı; NAP/schema tutarlılığı.

## Sağlam olanlar (tekrar denetlemeye gerek yok)

- HTTP→HTTPS ve www→apex 301, TTFB ~80–130 ms, nginx + `s-maxage`. Googlebot 200 + tam SSR içerik (720 kelime), noindex yok.
- Her sayfada self-canonical, tek H1, benzersiz ve aralıkta title (46–82) / description (135–165).
- Her blog yazısında BeautySalon + BlogPosting + BreadcrumbList JSON-LD; `dateModified` gerçek.
- Gövde içi iç linkleme güçlü (yazı başına 28–37 link, pillar `/hizmetler/*`'a çıkıyor). Orphan yok.
- robots.txt AI botlara açık, CCBot kapalı; `llms.txt` makine-okunur fiyatlarla yayında.

## Bulgular (öncelik sıralı)

1. **Ölçüm katmanı kör + `<head>`'de kırık script.** Her sayfada `<script async src="http://localhost:3001/v.js" data-vd="...">` var — kaynağı kodda değil, prod DB `settings.header_code`. HTTPS sayfada `http://localhost` → mixed content, tarayıcı bloklar. Ayrıca GA4/GTM yok, `google-site-verification` meta yok. Kendi `/api/track` tracker'ı çalışıyor ama **impression/query verisi yok** → "blog okunmuyor" teşhisi kanıtsız kalıyor. Fix: admin > header_code temizle; GSC + Bing Webmaster doğrula, sitemap gönder.
2. **Indeksleme boşluğu.** `site:striastudio.com.tr` hem Bing'de hem arama indeksinde 0 sonuç. Teknik engel yok → keşif/otorite sorunu (yeni domain, 0 backlink).
3. **NAP hâlâ placeholder — artık AI cevaplarına sızıyor.** LocalBusiness schema: `streetAddress: "[Mahalle] Cd. No: 00"`, `postalCode: 06000`; footer'da yalnız "Çankaya, Ankara". Bir AI cevabı bunu **güvenilmezlik uyarısı** olarak kullanıcıya gösteriyor ("gerçek açık adres yerine…"). Local pack + E-E-A-T'yi doğrudan kesiyor. Owner-gated.
4. **Kardeş domain kanibalizasyonu.** Aynı işletme 3 domain'de; marka sorgusunda öne çıkan **kastasarimiankara.com**, ana domain değil. Otorite 3'e bölünüyor. Strateji kararı: ya ana domain'e 301 konsolidasyon, ya mikrositelerin kesin sorgu ayrımı + ana domain'e link.
5. **Sosyal hesap tutarsızlığı.** Schema `sameAs: instagram.com/striastudio`, footer `@striakamuflaj`. Entity birleşmesini bozar.
6. **İçerik derinliği ince.** Gövdeler ~300–600 kelime (chrome dahil 512–844). 37 yazı 14.05–10.08 arasında günde ~1 kadansla yayınlanmış → "scaled content" görünümü. Yazar = `Organization`, görünür byline / yazar sayfası / sertifika yok; öncesi-sonrası fotoğrafı yok (galeri owner-gated). FAQPage şeması blog yazılarında yok (yalnız `/sss`).
7. **EN içerik kayıp.** `body_en` DB'de var ama URL yok — dil değişimi client-side, `/en/*` route ve hreflang yok. İndekslenen tek versiyon TR.

## Shipped (kod)

- `frontend/app/sitemap.ts`: blog URL'lerinin `lastModified`'ı build zamanı (`new Date()`) yerine `updated_at ?? published_at`. Önceden 76 URL'in tamamı aynı damgayı taşıyordu → Google lastmod'u tümden yok sayar. Doğrulama: prod API'ye bağlı `next dev` + `/sitemap.xml` → yazı başına gerçek tarih.

## Owner action (kod dışı, sıralama bloklayıcı)

Gerçek açık adres + posta kodu · Google Business Profile (kategori, foto, hizmet, `site.gbpUrl`) · GSC + Bing doğrulama & sitemap · `header_code` temizliği · gerçek öncesi-sonrası fotoğrafları · gerçek yorumlar (sonra AggregateRating) · yerel citation/dizinler.

## Sources

Canlı crawl bu oturumda. Önceki iş: [[issues/2026-07-12-mikroblading-seo-geo-audit]] · [[syntheses/2026-07-12-seo-geo-topic-strategy]] · [[decisions/2026-07-08-seo-architecture]] · skill://seo-audit
