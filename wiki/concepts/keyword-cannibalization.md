# Keyword Cannibalization — tek niyet, tek sayfa

**Kural:** Bir arama niyetinin (intent) sahibi tek sayfadır. Aynı niyete ikinci bir sayfa açmak Google'ın iki sayfayı birbirine karşı yarıştırmasına yol açar ve genellikle ikisi de düşer.

## Politika

1. **Eşanlamlı/varyant sorgular** ("microblading" ↔ "kıl tekniği kaş" ↔ "kaş microblading") yeni sayfa DEĞİL; mevcut sahip sayfaya işlenir:
   - Title'a varyant (`Microblading Ankara | Kıl Tekniği Kaş`)
   - Intro'ya tanım köprüsü ("— halk arasında X olarak bilinir —") → GEO/AI motorları eşanlamlıyı bu cümleden öğrenir
   - SSS'ye "X nedir?" maddesi → FAQPage şeması + PAA/snippet şansı
   - Service şemasına `alternateName` (frontend `SERVICE_ALTERNATE_NAMES` haritası)
2. **Yeni sayfa ancak niyet farklıysa** açılır: bilgi vs hizmet/randevu, karşılaştırma vs tanım, genel vs semt (çankaya/kızılay), genel vs alt-problem (kamuflaj → vitiligo/sezaryen izi).
3. **Blog ↔ hizmet sayfası:** blog uzun kuyruk/bilgi açısını alır, pillar hizmet sayfasına link verir; başlıkta hizmet sayfasının head query'sini tekrarlamaz (kastasarimi 2026-07-12 re-angle örneği).
4. **Domainler arası (mikrositler):** aynı işletmenin domain'leri arasında aynı sorgu+açı ASLA iki kez hedeflenmez. Ana site hizmet sayfası transactional head query'nin sahibi; mikrosit derinlik/rehber/semt sayfalarını alır. Mikrosit ana sayfası ↔ ana site hizmet sayfası örtüşmesi bilinçli istisnadır (çift SERP görünürlüğü; sameAs ile entity birleştirme).
5. **Denetim tetikleyicisi:** yeni sayfa/başlık eklerken önce mevcut sahip sayfayı ara (`seo_title`, H1, blog başlıkları); GSC'de iki URL'in aynı sorguda dönüşümlü görünmesi (URL flip-flop) cannibalization sinyalidir.

## Uygulanmış örnekler
- 2026-07-16: microblading sayfası "kıl tekniği kaş" varyantlarına genişletildi (yeni sayfa açılmadı).
- 2026-07-16: mikroblading_ankara `/kas-pudralama-ankara` ana sitedeki `/hizmetler/kas-pudralama` ile çakışıyordu → bilgilendirici açıya re-angle, randevu linki ana siteye.
- 2026-07-12: kastasarimi blog başlıkları landing sayfalarıyla çakışmasın diye re-angle (bkz. [[syntheses/2026-07-12-seo-geo-topic-strategy]] §kastasarimi).

## Sources
[[raw/2026-07-16-kil-teknigi-cannibalization-note]] · [[syntheses/2026-07-12-seo-geo-topic-strategy]] · [[decisions/2026-07-09-microsite-architecture]]
