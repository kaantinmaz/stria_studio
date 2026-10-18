# Decision: Haftalık otomatik SEO döngüsü (GSC API + Serper)

**Date:** 2026-10-18
**Status:** Accepted (owner directive, this session). Kod yazıldı, commit edilmedi.

## Context

[[decisions/2026-09-05-icerik-uretim-pipeline]] GSC verisini elle CSV ile
alıyordu. Sahibi: "Haftada bir Search Console verilerini analiz ederek hem
site içindeki içerikleri güncelleyelim hem de yeni blog yazılarını bunlara göre
yazalım; SERP API ile haftada bir istek atıp arama verilerini al."

## Decision

- **Tüm güncellemeler otomatik**, onay adımı yok (blog VE hizmet sayfaları) —
  sahibinin kararı. Karşılığında her otomatik değişikliğin önce/sonra kopyası
  `content_revisions`'ta; `php artisan seo:revert {id}` ile geri alınır.
- `seo:weekly` Pazartesi 06:00 (Europe/Istanbul): `gsc:sync` (servis hesabı
  JWT, son 28 gün, 3 gün gecikme) → `serp:sync` (Serper.dev, haftada ≤60
  sorgu) → SERP konuları `search_queries`'e (`source='serp'`, gösterim 0;
  günlük `content:write` önce GSC sorgularını tüketir) → düşen/vurucu
  mesafedeki ≤3 yazıyı `content:write --slug` ile tazele → hizmet başına haftada
  ≤2 SSS (toplam ≤16) → haftada ≤1 hizmetin yalnızca SEO başlık/açıklaması
  (`content:service-copy --apply --seo-only`) → rapor `storage/app/seo-reports/`
  + Telegram.
- Dönem kimliği `YYYYWww` (ör. `2026W42`); aynı yıl içinde `max('period')` eski
  `YYYY-MM` dönemlerinden sonra gelir. SERP konuları en son GSC dönemine eklenir.

## Consequences

- Sunucuda `GSC_CREDENTIALS`, `GSC_SITE_URL`, `SERPER_API_KEY` tanımlanmadıkça
  ilgili adım atlanır (uyarı), döngü eldeki veriyle çalışır.
- Elle tam `content:service-copy --apply` en fazla 8 SSS döndürür (şema) ve
  otomatik eklenen 9.–16. SSS'leri siler.
- Ayrıntı: `docs/CONTENT_PIPELINE.md` → "Haftalık SEO döngüsü".

## Sources

- This decision record (owner directive, 2026-10-18 session).
