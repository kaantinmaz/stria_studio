# Decision: mikrositeler ana domaine 301 ile konsolide edilir

**Date:** 2026-08-10
**Karar sahibi:** owner (üç seçenek sunuldu, "ana domaine konsolide et" seçildi)

## Neden

Aynı işletme üç domainde (striastudio.com.tr, microbladingankara.com, kastasarimiankara.com) yayındaydı; otorite üçe bölünüyordu. Marka sorgusunda öne çıkan ana domain değil **kastasarimiankara.com**'du, ana domain ise `site:` sorgusunda hiç görünmüyordu. Bkz. [[issues/2026-08-10-striastudio-organik-gorunurluk-teshisi]]. Bu, [[decisions/2026-07-09-microsite-architecture]] kararının mikrosite-SEO kısmını **geçersiz kılar** (backend'in `site` kolonu ile scope'lanması mimari olarak kalır, ama mikrositeler artık kendi içeriklerini sunmaz).

## Ne yapıldı (kod, yerel doğrulandı)

1. **301 haritası** — `mikroblading_ankara/next.config.ts` + `kastasarimi/next.config.ts`: 59 mikrosite URL'inin tamamı mutlak `https://striastudio.com.tr/...` hedefine `statusCode: 301` ile eşlendi (ilçe sayfaları → ilgili `/hizmetler/*`; blog yazıları → ana domaindeki kanonik karşılığı; `/galeri`,`/sss`,`/hakkimizda`,`/iletisim`,`/blog` → aynı yol). Sonda negatif-lookahead catch-all → ana sayfa; `_next|api|sitemap.xml|robots.txt|favicon.ico|og` ve statik uzantılar hariç tutulur — Google'ın 301'leri keşfetmesi için sitemap/robots 200 kalmalı. `permanent: true` Next'te 308 üretir, konsolidasyonda açık 301 tercih edildi.
2. **Kapsam boşlukları** — mikrositelerde olup ana domainde karşılığı olmayan sorgular için 3 yeni yazı: `seyrek-kaslar-icin-kas-cozumleri`, `kalici-makyaj-zararli-mi`, `eski-kalici-kas-duzeltme` (TR ~900 kelime + tam EN, cevap-önce, 5–6 iç link). İnce/yakın-duplike **ilçe sayfaları ana domaine taşınmadı** — gerçek adres olmadan yerel farklılaşma taşımıyorlardı, doorway riski. `/fiyatlar` sayfası açılmadı (fiyat sorgusunu blog yazısı sahipleniyor).
3. **Redirect'e link bırakılmadı** — `llms.txt` "Uzman rehber sitelerimiz" bölümü, `ServicePage.tsx` `SERVICE_GUIDES` (microblading/kas-tasarimi girdileri) ve `/ankara-kalici-makyaj-yapan-yerler` içindeki 6 dış link iç hedeflere çevrildi. `beautySalonSchema.sameAs`'tan kardeş domainler çıkarıldı.
4. **E-E-A-T** — `personSchema()`: Person `@id = /hakkimizda#nilsu-kamisli`, `worksFor` → `/#business`, `knowsAbout`, `hasCredential` (My Lamination workshop). BlogPosting `author` artık Organization değil bu Person; blog yazılarında görünür byline; `/hakkimizda`'da Person JSON-LD + çıpa; BeautySalon'a `founder` bağı.
5. **Sitemap tazeliği** — blog `lastModified` build zamanı yerine `updated_at ?? published_at`.
6. **Seeder tarih hatası** — `MainPostSeeder` `updateOrCreate` ile her çalıştırmada tüm yazıların `published_at`'ini yeniden yazıyordu. Artık `firstOrNew` + tarih yalnızca yeni kayıtta; JSON'da açık `published_at` varsa o kullanılır (yeni yazılar aylar öncesine tarihlenmesin).

## Doğrulama

Her iki mikrositede `tsc` temiz + `next dev` üzerinde curl: 20+ yol 301 + doğru `location`, eşleşmeyen yol 301 → kök, `sitemap.xml`/`robots.txt`/`_next` asset 200. Ana sitede yerel Laravel API + `next dev`: 3 yeni yazı 200, `author` Person `@id`'sine işaret ediyor, byline render ediliyor, `sameAs`'ta kardeş domain yok, `/hakkimizda` Person JSON-LD + çıpa var, `llms.txt` ve rehber sayfasında kardeş domain referansı kalmadı, `kalici-makyaj-silinir-mi` ↔ `eski-kalici-kas-duzeltme` karşılıklı link, sitemap'te yeni yazılar gerçek tarihle. MySQL: seeder iki kez çalıştırıldı, mevcut yazıların `published_at` değerleri değişmedi.

## Deploy sırası (bozulmasın)

1. Ana domaini (`frontend/` + `backend` seeder) deploy et → 3 yeni yazı canlıda 200 dönmeli.
2. Sonra mikrositeleri deploy et (301'ler devreye girer). Ters sıra, hedefi henüz olmayan URL'lere 301 üretir.
3. GSC'de her iki mikrosite için **Change of Address** + ana domain sitemap'ini yeniden gönder. Mikrosite property'lerini en az 6 ay kapatma; 301'ler kalıcı kalmalı.

## Sources

[[issues/2026-08-10-striastudio-organik-gorunurluk-teshisi]] · [[decisions/2026-07-09-microsite-architecture]] (SEO kısmı geçersiz) · [[syntheses/2026-07-12-seo-geo-topic-strategy]]
